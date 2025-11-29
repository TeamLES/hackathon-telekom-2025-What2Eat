-- ============================================
-- Supabase Storage Bucket: fridge-photos
-- ============================================
-- This bucket stores images of users' fridges/pantries for ingredient analysis
--
-- Run this in your Supabase SQL Editor or Dashboard

-- 1. Create the storage bucket (if not exists)
-- Note: You may need to create this via Dashboard > Storage > New Bucket
-- Bucket name: fridge-photos
-- Public: false (private bucket)
-- File size limit: 10MB
-- Allowed MIME types: image/jpeg, image/png, image/webp

-- 2. Storage Policies
-- These policies ensure users can only access their own photos

-- Policy: Allow authenticated users to upload their own photos
-- Path structure: {user_id}/{timestamp}.jpg
CREATE POLICY "Users can upload their own fridge photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'fridge-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to view their own photos
CREATE POLICY "Users can view their own fridge photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'fridge-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to delete their own photos
CREATE POLICY "Users can delete their own fridge photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'fridge-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to update their own photos (for upsert)
CREATE POLICY "Users can update their own fridge photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'fridge-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- RLS Policies for fridge_snapshots table
-- ============================================

-- Enable RLS on fridge_snapshots
ALTER TABLE public.fridge_snapshots ENABLE ROW LEVEL SECURITY;

-- Users can insert their own snapshots
CREATE POLICY "Users can insert their own snapshots" ON public.fridge_snapshots FOR
INSERT
    TO authenticated
WITH
    CHECK (auth.uid () = user_id);

-- Users can view their own snapshots
CREATE POLICY "Users can view their own snapshots" ON public.fridge_snapshots FOR
SELECT TO authenticated USING (auth.uid () = user_id);

-- Users can delete their own snapshots
CREATE POLICY "Users can delete their own snapshots" ON public.fridge_snapshots FOR DELETE TO authenticated USING (auth.uid () = user_id);

-- ============================================
-- RLS Policies for fridge_snapshot_items table
-- ============================================

-- Enable RLS on fridge_snapshot_items
ALTER TABLE public.fridge_snapshot_items ENABLE ROW LEVEL SECURITY;

-- Users can insert items for their own snapshots
CREATE POLICY "Users can insert items for their own snapshots" ON public.fridge_snapshot_items FOR
INSERT
    TO authenticated
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM public.fridge_snapshots
            WHERE
                id = snapshot_id
                AND user_id = auth.uid ()
        )
    );

-- Users can view items from their own snapshots
CREATE POLICY "Users can view items from their own snapshots" ON public.fridge_snapshot_items FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM public.fridge_snapshots
            WHERE
                id = snapshot_id
                AND user_id = auth.uid ()
        )
    );

-- Users can delete items from their own snapshots
CREATE POLICY "Users can delete items from their own snapshots" ON public.fridge_snapshot_items FOR DELETE TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM public.fridge_snapshots
        WHERE
            id = snapshot_id
            AND user_id = auth.uid ()
    )
);

-- ============================================
-- INSTRUCTIONS
-- ============================================
--
-- 1. First, create the bucket in Supabase Dashboard:
--    - Go to Storage > Create new bucket
--    - Name: fridge-photos
--    - Public bucket: OFF (private)
--    - File size limit: 10485760 (10MB)
--    - Allowed MIME types: image/jpeg, image/png, image/webp
--
-- 2. Then run the SQL policies above in the SQL Editor
--
-- 3. The API will now:
--    - Analyze the image using GPT-4o vision
--    - Upload the image to storage/{user_id}/{timestamp}.jpg
--    - Save snapshot metadata to fridge_snapshots
--    - Save detected ingredients to fridge_snapshot_items

-- ============================================
-- RLS Policies for meal_plans table
-- ============================================

-- Enable RLS on meal_plans
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;

-- Users can insert their own meal plans
CREATE POLICY "Users can insert their own meal plans" ON public.meal_plans FOR
INSERT
    TO authenticated
WITH
    CHECK (auth.uid () = user_id);

-- Users can view their own meal plans
CREATE POLICY "Users can view their own meal plans" ON public.meal_plans FOR
SELECT TO authenticated USING (auth.uid () = user_id);

-- Users can update their own meal plans
CREATE POLICY "Users can update their own meal plans" ON public.meal_plans FOR
UPDATE TO authenticated USING (auth.uid () = user_id);

-- Users can delete their own meal plans
CREATE POLICY "Users can delete their own meal plans" ON public.meal_plans FOR DELETE TO authenticated USING (auth.uid () = user_id);

-- ============================================
-- RLS Policies for meal_plan_items table
-- ============================================

-- Enable RLS on meal_plan_items
ALTER TABLE public.meal_plan_items ENABLE ROW LEVEL SECURITY;

-- Users can insert items for their own meal plans
CREATE POLICY "Users can insert meal plan items" ON public.meal_plan_items FOR
INSERT
    TO authenticated
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM public.meal_plans
            WHERE
                id = meal_plan_id
                AND user_id = auth.uid ()
        )
    );

-- Users can view items from their own meal plans
CREATE POLICY "Users can view meal plan items" ON public.meal_plan_items FOR
SELECT TO authenticated USING (
        EXISTS (
            SELECT 1
            FROM public.meal_plans
            WHERE
                id = meal_plan_id
                AND user_id = auth.uid ()
        )
    );

-- Users can update items from their own meal plans
CREATE POLICY "Users can update meal plan items" ON public.meal_plan_items FOR
UPDATE TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM public.meal_plans
        WHERE
            id = meal_plan_id
            AND user_id = auth.uid ()
    )
);

-- Users can delete items from their own meal plans
CREATE POLICY "Users can delete meal plan items" ON public.meal_plan_items FOR DELETE TO authenticated USING (
    EXISTS (
        SELECT 1
        FROM public.meal_plans
        WHERE
            id = meal_plan_id
            AND user_id = auth.uid ()
    )
);

-- ============================================
-- RLS Policies for recipes table
-- ============================================

-- Enable RLS on recipes
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;

-- Users can insert their own recipes
CREATE POLICY "Users can insert their own recipes" ON public.recipes FOR
INSERT
    TO authenticated
WITH
    CHECK (auth.uid () = user_id);

-- Users can view their own recipes OR public recipes
CREATE POLICY "Users can view own or public recipes" ON public.recipes FOR
SELECT TO authenticated USING (
        auth.uid () = user_id
        OR is_public = true
    );

-- Users can update their own recipes
CREATE POLICY "Users can update their own recipes" ON public.recipes FOR
UPDATE TO authenticated USING (auth.uid () = user_id);

-- Users can delete their own recipes
CREATE POLICY "Users can delete their own recipes" ON public.recipes FOR DELETE TO authenticated USING (auth.uid () = user_id);