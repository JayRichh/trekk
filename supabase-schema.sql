-- Supabase Schema for Trekk application

-- Enable Row Level Security (RLS)
alter table auth.users enable row level security;

-- Create trail_ratings table
create table if not exists public.trail_ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  trail_id text not null,  -- DOC API asset ID
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  tips text,
  photos text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add profile information to users
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  bio text,
  favorite_trails text[],
  completed_trails text[],
  planned_trails text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create cache table for DOC API data
create table if not exists public.trail_cache (
  id text primary key, -- DOC API asset ID 
  data jsonb not null,
  cached_at timestamptz default now()
);

-- Create region_stats table for tracking trail counts
create table if not exists public.region_stats (
  region_name text primary key,
  trail_count int default 0,
  avg_rating float default 0,
  updated_at timestamptz default now()
);

-- Enable RLS on new tables
alter table public.trail_ratings enable row level security;
alter table public.profiles enable row level security;
alter table public.trail_cache enable row level security;
alter table public.region_stats enable row level security;

-- RLS Policies 

-- Trail ratings: anyone can view, only the author can edit
create policy "Ratings are viewable by everyone" 
  on public.trail_ratings for select using (true);

create policy "Users can create their own ratings" 
  on public.trail_ratings for insert with check (auth.uid() = user_id);

create policy "Users can update their own ratings" 
  on public.trail_ratings for update using (auth.uid() = user_id);

create policy "Users can delete their own ratings" 
  on public.trail_ratings for delete using (auth.uid() = user_id);

-- Profiles: anyone can view, only the owner can edit
create policy "Profiles are viewable by everyone" 
  on public.profiles for select using (true);

create policy "Users can create their own profile" 
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile" 
  on public.profiles for update using (auth.uid() = id);

-- Cache: viewable by all authenticated users
create policy "Cache is viewable by authenticated users" 
  on public.trail_cache for select to authenticated using (true);

-- Region stats: viewable by all
create policy "Region stats are viewable by everyone" 
  on public.region_stats for select using (true);

-- Setup functions for automatic timestamp updates
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Triggers for updated_at
create trigger set_updated_at
before update on public.trail_ratings
for each row execute procedure public.handle_updated_at();

create trigger set_updated_at
before update on public.profiles
for each row execute procedure public.handle_updated_at();

create trigger set_updated_at
before update on public.region_stats
for each row execute procedure public.handle_updated_at();

-- Automatic profile creation
create or replace function public.create_profile_on_signup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$;

create trigger create_profile_after_signup
after insert on auth.users
for each row execute procedure public.create_profile_on_signup();

-- Add functions to refresh cache
create or replace function public.refresh_trail_cache(trail_id text, data jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.trail_cache (id, data, cached_at)
  values (trail_id, data, now())
  on conflict (id) do update
  set data = excluded.data, cached_at = now();
end;
$$;

-- Add permissions for service role
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
grant all on all sequences in schema public to anon, authenticated;
grant all on all functions in schema public to anon, authenticated;

-- Enable Foreign Key triggers
alter table public.trail_ratings enable trigger all;
alter table public.profiles enable trigger all;
