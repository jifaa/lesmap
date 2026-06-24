-- ============================================
-- SQL Migration: Fix Roles to User/Admin Only
-- LesMap Samarinda
-- ============================================

-- 1. Ensure only 'user' and 'admin' roles exist
-- Remove 'owner' role if it exists

-- Drop owner role if exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'owner') THEN
        -- Revoke any permissions first
        REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM owner;
        REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM owner;
        REVOKE USAGE ON SCHEMA public FROM owner;
        DROP ROLE IF EXISTS owner;
        RAISE NOTICE 'Role owner dropped';
    ELSE
        RAISE NOTICE 'Role owner does not exist, skipping';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error dropping owner role: %', SQLERRM;
END $$;

-- 2. Create or ensure 'user' role exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'user_role') THEN
        CREATE ROLE user_role;
        GRANT CONNECT ON DATABASE postgres TO user_role;
        GRANT USAGE ON SCHEMA public TO user_role;
        GRANT SELECT ON ALL TABLES IN SCHEMA public TO user_role;
        GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO user_role;
        GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO user_role;
        RAISE NOTICE 'Role user_role created';
    ELSE
        RAISE NOTICE 'Role user_role already exists';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error with user_role: %', SQLERRM;
END $$;

-- 3. Create or ensure 'admin' role exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin_role') THEN
        CREATE ROLE admin_role;
        GRANT CONNECT ON DATABASE postgres TO admin_role;
        GRANT USAGE ON SCHEMA public TO admin_role;
        GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin_role;
        GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin_role;
        RAISE NOTICE 'Role admin_role created';
    ELSE
        RAISE NOTICE 'Role admin_role already exists';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error with admin_role: %', SQLERRM;
END $$;

-- ============================================
-- 4. Create users table if not exists
-- ============================================

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

-- ============================================
-- 5. Create trigger for new users
-- ============================================

-- Drop existing trigger function if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert into public.users with default role 'user'
    INSERT INTO public.users (id, email, full_name, phone, role, created_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'phone',
        'user',  -- Always default to 'user' role
        NOW()
    );
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- If user already exists, just return new
    RAISE NOTICE 'User profile may already exist: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 6. Create/update RLS policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fasilitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (safe to re-run)
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
DROP POLICY IF EXISTS "Public can view approved course places" ON public.course_places;
DROP POLICY IF EXISTS "Owners can insert course places" ON public.course_places;
DROP POLICY IF EXISTS "Owners can update own places" ON public.course_places;
DROP POLICY IF EXISTS "Admins can manage all course places" ON public.course_places;
DROP POLICY IF EXISTS "Public can view categories" ON public.categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
DROP POLICY IF EXISTS "Public can view fasilitas" ON public.fasilitas;
DROP POLICY IF EXISTS "Admins can manage fasilitas" ON public.fasilitas;
DROP POLICY IF EXISTS "Public can view reviews for approved places" ON public.reviews;
DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON public.reviews;
DROP POLICY IF EXISTS "Admins can manage all reviews" ON public.reviews;

-- Users table policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can update all users" ON public.users
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Course places policies
CREATE POLICY "Public can view approved course places" ON public.course_places
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Authenticated users can insert course places" ON public.course_places
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());

CREATE POLICY "Users can view own places" ON public.course_places
    FOR SELECT USING (
        owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Users can update own places" ON public.course_places
    FOR UPDATE USING (
        owner_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Admins can do everything
CREATE POLICY "Admins can manage all course places" ON public.course_places
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Categories policies
CREATE POLICY "Public can view categories" ON public.categories
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage categories" ON public.categories
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Fasilitas policies
CREATE POLICY "Public can view fasilitas" ON public.fasilitas
    FOR SELECT USING (true);

CREATE POLICY "Admins can manage fasilitas" ON public.fasilitas
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- Reviews policies
CREATE POLICY "Public can view reviews for approved places" ON public.reviews
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.course_places WHERE id = course_id AND status = 'approved')
    );

CREATE POLICY "Authenticated users can insert reviews" ON public.reviews
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Users can view own reviews" ON public.reviews
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can manage all reviews" ON public.reviews
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- 7. Update existing users with 'owner' role to 'user'
-- ============================================

UPDATE public.users SET role = 'user' WHERE role = 'owner' OR role = 'Owner' OR role = 'OWNER';

-- ============================================
-- 8. Grant permissions to authenticated users
-- ============================================

-- Grant permissions on tables
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT ON public.course_places TO authenticated;
GRANT SELECT ON public.categories TO authenticated;
GRANT SELECT ON public.fasilitas TO authenticated;
GRANT SELECT ON public.reviews TO authenticated;

GRANT INSERT, UPDATE ON public.users TO authenticated;
GRANT INSERT ON public.course_places TO authenticated;
GRANT INSERT ON public.reviews TO authenticated;

-- Grant permissions to anon (for public access)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.course_places TO anon;
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.fasilitas TO anon;
GRANT SELECT ON public.reviews TO anon;

-- ============================================
-- 9. Create helper function to make admin
-- ============================================

CREATE OR REPLACE FUNCTION make_admin(user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.users SET role = 'admin' WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 10. Create helper function to check if user is owner
-- (Checks if user has any course_places)
-- ============================================

CREATE OR REPLACE FUNCTION is_owner(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.course_places
        WHERE owner_id = user_id
        LIMIT 1
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 11. Create helper view for dashboard stats
-- ============================================

CREATE OR REPLACE VIEW public.dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM public.course_places) AS total_places,
    (SELECT COUNT(*) FROM public.course_places WHERE status = 'pending') AS pending_places,
    (SELECT COUNT(*) FROM public.course_places WHERE status = 'approved') AS approved_places,
    (SELECT COUNT(*) FROM public.course_places WHERE status = 'rejected') AS rejected_places,
    (SELECT COUNT(*) FROM public.users WHERE role = 'user') AS total_users,
    (SELECT COUNT(*) FROM public.users WHERE role = 'admin') AS total_admins,
    (SELECT COUNT(*) FROM public.categories) AS total_categories,
    (SELECT COUNT(*) FROM public.fasilitas) AS total_fasilitas,
    (SELECT COUNT(*) FROM public.reviews) AS total_reviews;

-- ============================================
-- 12. Grant access to views
-- ============================================

GRANT SELECT ON public.dashboard_stats TO authenticated;
GRANT SELECT ON public.dashboard_stats TO anon;

-- ============================================
-- Done!
-- ============================================

COMMENT ON TABLE public.users IS 'User profiles with role (user or admin)';
COMMENT ON FUNCTION handle_new_user IS 'Trigger function to create user profile on auth.users insert';
COMMENT ON FUNCTION make_admin IS 'Helper to promote user to admin';
COMMENT ON FUNCTION is_owner IS 'Check if user has registered any course places';
