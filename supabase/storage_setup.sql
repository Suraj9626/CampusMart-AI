-- =====================================================================
-- SUPABASE STORAGE BUCKET CONFIGURATION FOR CAMPUSMART AI
-- =====================================================================

-- 1. Create public bucket for listing images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'listing-images',
    'listing-images',
    TRUE,
    5242880, -- 5MB limit per file
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
    public = TRUE,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 2. Storage Policies
CREATE POLICY "Public Access for Listing Images"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'listing-images');

CREATE POLICY "Authenticated students can upload listing images"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'listing-images' AND
        auth.role() = 'authenticated'
    );

CREATE POLICY "Users can update their own uploaded images"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'listing-images' AND
        auth.uid() = owner
    );

CREATE POLICY "Users can delete their own uploaded images"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'listing-images' AND
        auth.uid() = owner
    );
