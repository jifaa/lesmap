-- Migration: add geometry columns to course_places
-- Idempotent — safe to run multiple times
-- Run this in Supabase SQL Editor

-- 1. Add geometry_type column (default 'point' for backward compat)
ALTER TABLE public.course_places
  ADD COLUMN IF NOT EXISTS geometry_type text DEFAULT 'point';

-- 2. Add geometry_geojson column (nullable jsonb)
ALTER TABLE public.course_places
  ADD COLUMN IF NOT EXISTS geometry_geojson jsonb;

-- 3. Add check constraint (only if it doesn't already exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'course_places_geometry_type_check'
      AND conrelid = 'public.course_places'::regclass
  ) THEN
    ALTER TABLE public.course_places
      ADD CONSTRAINT course_places_geometry_type_check
      CHECK (geometry_type IN ('point', 'line', 'polygon'));
  END IF;
END $$;

-- 4. Backfill: set geometry_type = 'point' for rows where it's null
UPDATE public.course_places
  SET geometry_type = 'point'
  WHERE geometry_type IS NULL;

-- 5. Backfill: set geometry_geojson from lat/lng for existing point rows
UPDATE public.course_places
  SET geometry_geojson = jsonb_build_object(
    'type', 'Point',
    'coordinates', jsonb_build_array(longitude, latitude)
  )
  WHERE geometry_geojson IS NULL
    AND latitude IS NOT NULL
    AND longitude IS NOT NULL
    AND latitude <> 0
    AND longitude <> 0;

-- Done. Verify:
-- SELECT id, name, geometry_type, geometry_geojson FROM public.course_places LIMIT 5;
