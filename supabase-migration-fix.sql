-- Create a view that joins trail_ratings with profiles
create or replace view public.trail_ratings_with_users as
select 
  tr.id,
  tr.trail_id,
  tr.rating,
  tr.comment,
  tr.created_at,
  tr.photos,
  tr.tips,
  tr.user_id,
  p.display_name,
  p.avatar_url
from 
  public.trail_ratings tr
  left join public.profiles p on tr.user_id = p.id;

-- Grant access to the view
grant select on public.trail_ratings_with_users to anon, authenticated;

-- Create an index on trail_id to improve query performance
create index if not exists idx_trail_ratings_trail_id on public.trail_ratings(trail_id);

-- Create a function to get trail ratings with user info
create or replace function public.get_trail_ratings(p_trail_id text)
returns table (
  id uuid,
  trail_id text,
  rating int,
  comment text,
  created_at timestamptz,
  photos text[],
  tips text,
  user_id uuid,
  display_name text,
  avatar_url text
)
language sql
security invoker
set search_path = ''
as $$
  select 
    id, trail_id, rating, comment, created_at, photos, tips, user_id, display_name, avatar_url
  from 
    public.trail_ratings_with_users
  where 
    trail_id = p_trail_id
  order by 
    created_at desc;
$$;

-- Grant execute permission on the function
grant execute on function public.get_trail_ratings(text) to anon, authenticated;
