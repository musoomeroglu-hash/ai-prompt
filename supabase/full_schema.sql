-- DİKKAT: Bu kod mevcut "profiles", "generations" ve "daily_usage" tablolarını SİLER ve yeniden oluşturur.
-- Verilerinizi kaybetmek istemiyorsanız DROP komutlarını çalıştırmayın.

DROP TABLE IF EXISTS daily_usage;
DROP TABLE IF EXISTS generations;
DROP TABLE IF EXISTS profiles;

-- PROFILES
create table if not exists profiles (
  id uuid primary key,
  email text,
  plan text not null default 'free',
  created_at timestamptz default now()
);

-- GENERATIONS
create table if not exists generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  category text not null,
  user_request text not null,
  tone text,
  target_model text,
  result_json jsonb not null,
  tokens_used int default 0,
  created_at timestamptz default now()
);

-- DAILY USAGE (user+date unique)
create table if not exists daily_usage (
  user_id uuid not null references profiles(id) on delete cascade,
  date date not null,
  count int not null default 0,
  primary key (user_id, date)
);

-- Enable Row Level Security (RLS)
alter table profiles enable row level security;
alter table generations enable row level security;
alter table daily_usage enable row level security;

-- POLICIES

-- Profiles: Users can view and update their own profile
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);

-- Generations: Users can view and insert their own generations
create policy "Users can view own generations" on generations for select using (auth.uid() = user_id);
create policy "Users can insert own generations" on generations for insert with check (auth.uid() = user_id);

-- Daily Usage: Users can view their own usage
create policy "Users can view own usage" on daily_usage for select using (auth.uid() = user_id);
create policy "Users can insert own usage" on daily_usage for insert with check (auth.uid() = user_id);
create policy "Users can update own usage" on daily_usage for update using (auth.uid() = user_id);
