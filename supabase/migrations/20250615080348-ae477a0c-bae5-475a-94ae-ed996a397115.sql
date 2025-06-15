
-- Create a user_profiles table for onboarding
create table public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  bio text,
  industry text,
  goals text,
  interests text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.user_profiles enable row level security;

-- Allow users to manage their own profile (select, insert, update, delete)
create policy "Users can view their own profile"
  on public.user_profiles
  for select
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.user_profiles
  for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.user_profiles
  for update
  using (auth.uid() = id);

create policy "Users can delete their own profile"
  on public.user_profiles
  for delete
  using (auth.uid() = id);
