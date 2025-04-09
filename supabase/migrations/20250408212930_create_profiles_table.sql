-- Create profiles table if it doesn't exist
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

-- Enable Row Level Security on profiles table
alter table public.profiles enable row level security;

-- Create or replace policies for profiles table
-- Select policy (viewable by everyone)
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone" 
  on public.profiles for select using (true);

-- Insert policy (user can create their own profile)
drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile" 
  on public.profiles for insert with check (auth.uid() = id);

-- Update policy (user can update their own profile)
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" 
  on public.profiles for update using (auth.uid() = id);

-- Setup function for automatic timestamp updates
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

-- Trigger for updated_at
create trigger set_updated_at
before update on public.profiles
for each row execute procedure public.handle_updated_at();

-- Trigger for automatic creation of profiles
create or replace function public.create_profile_on_signup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do update
  set display_name = EXCLUDED.display_name,
      avatar_url = EXCLUDED.avatar_url;
  return new;
end;
$$;

-- Create trigger if it doesn't exist
drop trigger if exists create_profile_after_signup on auth.users;
create trigger create_profile_after_signup
after insert on auth.users
for each row execute procedure public.create_profile_on_signup();

-- Ensure storage bucket for avatars exists
-- This is a comment only as bucket creation requires admin API access
-- Admin must create an 'avatars' bucket with public read access
