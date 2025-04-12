-- Fix table name mismatch (wishlists vs wishlist)
ALTER TABLE IF EXISTS public.wishlist RENAME TO wishlists;

-- Add missing indexes for performance
CREATE INDEX IF NOT EXISTS ratings_user_trail_idx ON public.ratings(user_id, trail_id);
CREATE INDEX IF NOT EXISTS goals_type_meta_idx ON public.goals((meta->>'trail_id'));
CREATE INDEX IF NOT EXISTS wishlists_user_trail_idx ON public.wishlists(user_id, trail_id);

-- Update table constraints to handle duplicates better
ALTER TABLE IF EXISTS public.ratings 
  DROP CONSTRAINT IF EXISTS ratings_user_id_trail_id_key,
  ADD CONSTRAINT ratings_user_id_trail_id_unique UNIQUE(user_id, trail_id);

ALTER TABLE IF EXISTS public.wishlists 
  DROP CONSTRAINT IF EXISTS wishlist_user_id_trail_id_key,
  ADD CONSTRAINT wishlists_user_id_trail_id_unique UNIQUE(user_id, trail_id);

-- Create a function to handle "not found" errors consistently
CREATE OR REPLACE FUNCTION public.handle_not_found_error()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'PGRST116: Record not found';
END;
$$ LANGUAGE plpgsql;

-- Add comments for better documentation
COMMENT ON TABLE public.wishlists IS 'Stores user wishlist items for trails';
COMMENT ON TABLE public.ratings IS 'Stores user ratings for trails';
COMMENT ON TABLE public.goals IS 'Stores user goals related to trails';
