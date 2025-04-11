-- Add ratings table with appropriate relations
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trail_id TEXT NOT NULL,
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  tips TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, trail_id)
);

-- Create RLS policies for ratings table
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Anyone can view ratings
CREATE POLICY "Ratings are viewable by everyone" 
ON public.ratings FOR SELECT 
USING (true);

-- Only authenticated users can insert ratings
CREATE POLICY "Authenticated users can insert ratings" 
ON public.ratings FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own ratings
CREATE POLICY "Users can update their own ratings" 
ON public.ratings FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- Users can only delete their own ratings
CREATE POLICY "Users can delete their own ratings" 
ON public.ratings FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Add goals table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'::text CHECK (status IN ('pending', 'in_progress', 'completed')),
  target_date TIMESTAMPTZ,
  meta JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create RLS policies for goals table
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Users can only see their own goals
CREATE POLICY "Users can view their own goals" 
ON public.goals FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Users can only insert their own goals
CREATE POLICY "Users can insert their own goals" 
ON public.goals FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own goals
CREATE POLICY "Users can update their own goals" 
ON public.goals FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- Users can only delete their own goals
CREATE POLICY "Users can delete their own goals" 
ON public.goals FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Add wishlist table
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trail_id TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, trail_id)
);

-- Create RLS policies for wishlist table
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Users can only see their own wishlist
CREATE POLICY "Users can view their own wishlist" 
ON public.wishlist FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Users can only add to their own wishlist
CREATE POLICY "Users can insert into their own wishlist" 
ON public.wishlist FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own wishlist
CREATE POLICY "Users can update their own wishlist" 
ON public.wishlist FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

-- Users can only delete from their own wishlist
CREATE POLICY "Users can delete from their own wishlist" 
ON public.wishlist FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Add suggestions table
CREATE TABLE IF NOT EXISTS public.suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'::text CHECK (status IN ('pending', 'reviewed', 'implemented', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create RLS policies for suggestions table
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

-- Anyone can view their own suggestions
CREATE POLICY "Users can view their own suggestions" 
ON public.suggestions FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Anyone can insert suggestions (even anonymously)
CREATE POLICY "Anyone can submit suggestions" 
ON public.suggestions FOR INSERT 
TO anon, authenticated 
WITH CHECK (
  (auth.role() = 'authenticated' AND auth.uid() = user_id) OR 
  (auth.role() = 'anon' AND user_id IS NULL)
);

-- Create storage bucket for rating images
INSERT INTO storage.buckets (id, name) VALUES ('rating-images', 'rating-images')
ON CONFLICT (id) DO NOTHING;

-- Set up public access for rating images
CREATE POLICY "Rating images are publicly accessible" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'rating-images');

-- Allow authenticated users to upload rating images
CREATE POLICY "Users can upload their own rating images" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'rating-images' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own rating images
CREATE POLICY "Users can update their own rating images" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'rating-images' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own rating images
CREATE POLICY "Users can delete their own rating images" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'rating-images' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS ratings_user_id_idx ON public.ratings (user_id);
CREATE INDEX IF NOT EXISTS ratings_trail_id_idx ON public.ratings (trail_id);
CREATE INDEX IF NOT EXISTS goals_user_id_idx ON public.goals (user_id);
CREATE INDEX IF NOT EXISTS goals_status_idx ON public.goals (status);
CREATE INDEX IF NOT EXISTS wishlist_user_id_idx ON public.wishlist (user_id);
CREATE INDEX IF NOT EXISTS wishlist_trail_id_idx ON public.wishlist (trail_id);

-- Add function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER set_ratings_updated_at
BEFORE UPDATE ON public.ratings
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_goals_updated_at
BEFORE UPDATE ON public.goals
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_wishlist_updated_at
BEFORE UPDATE ON public.wishlist
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_suggestions_updated_at
BEFORE UPDATE ON public.suggestions
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
