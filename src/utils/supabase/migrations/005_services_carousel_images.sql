-- Convert image_url to an array of images for the carousel
ALTER TABLE public.services 
RENAME COLUMN image_url TO image_url_old;

ALTER TABLE public.services 
ADD COLUMN images TEXT[] DEFAULT '{}';

-- Optional: Migrate data if exists (unlikely as we just created it)
UPDATE public.services SET images = ARRAY[image_url_old] WHERE image_url_old IS NOT NULL;

-- Remove old column
ALTER TABLE public.services DROP COLUMN image_url_old;
