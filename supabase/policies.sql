-- RLS Policies
-- Run this in Supabase SQL Editor if you haven't already enabled RLS in schema.sql

-- Profiles: Users can view and update their own profile
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- Generations: Users can view and insert their own generations
create policy "Users can view own generations" on generations
  for select using (auth.uid() = user_id);

create policy "Users can insert own generations" on generations
  for insert with check (auth.uid() = user_id);

-- Daily Usage: Users can view their own usage
create policy "Users can view own usage" on daily_usage
  for select using (auth.uid() = user_id);

create policy "Users can insert own usage" on daily_usage
  for insert with check (auth.uid() = user_id);

create policy "Users can update own usage" on daily_usage
  for update using (auth.uid() = user_id);
