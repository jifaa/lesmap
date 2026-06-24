-- ============================================
-- SQL Helper: Create First Admin
-- LesMap Samarinda
-- ============================================

-- Instructions:
-- 1. Run this SQL after a user has registered
-- 2. Replace 'YOUR_USER_ID_HERE' with the user's UUID from auth.users
-- 3. Or run: SELECT id, email FROM auth.users WHERE email = 'your@email.com';

-- Option 1: Update by email
UPDATE public.users
SET role = 'admin'
WHERE email = 'admin@lesmap-samarinda.com';

-- Option 2: Update by user ID (uncomment and fill)
-- UPDATE public.users
-- SET role = 'admin'
-- WHERE id = 'YOUR_USER_ID_HERE';

-- Verify
SELECT id, email, full_name, role FROM public.users WHERE role = 'admin';
