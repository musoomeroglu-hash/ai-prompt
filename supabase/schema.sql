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

-- Enable Row Level Security (RLS) - Optional for MVP but good practice
alter table profiles enable row level security;
alter table generations enable row level security;
alter table daily_usage enable row level security;

-- Policies can be added later or kept open for service role logic
