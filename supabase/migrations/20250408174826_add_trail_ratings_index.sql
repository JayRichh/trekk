-- Add a performance index to improve query performance on trail_ratings

-- Add an explanatory comment
comment on migration is 'Add index on trail_id to improve query performance for ratings lookups';

-- Create index on trail_id column to speed up IN queries
create index if not exists idx_trail_ratings_trail_id on public.trail_ratings(trail_id);
