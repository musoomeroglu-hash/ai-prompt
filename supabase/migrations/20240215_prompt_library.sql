-- Categories Table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  icon text,
  parent_category_id uuid references public.categories(id),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Prompts Table
create table if not exists public.prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  content text not null,
  description text not null,
  category_id uuid references public.categories(id) on delete set null,
  target_ai text not null, -- 'chatgpt', 'claude', 'gemini', etc.
  difficulty_level text default 'medium', -- 'beginner', 'medium', 'advanced'
  language text default 'tr',
  view_count integer default 0,
  upvotes integer default 0,
  downvotes integer default 0,
  score integer default 0, -- Cached score for sorting
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Votes Table
-- Note: 'vote_type' check constraint used instead of enum type for easier management
create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  prompt_id uuid references public.prompts(id) on delete cascade not null,
  vote_type text not null check (vote_type in ('upvote', 'downvote')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, prompt_id)
);

-- Tags Table
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique
);

-- Prompt_Tags Table (Many-to-Many)
create table if not exists public.prompt_tags (
  prompt_id uuid references public.prompts(id) on delete cascade not null,
  tag_id uuid references public.tags(id) on delete cascade not null,
  primary key (prompt_id, tag_id)
);

-- Favorites Table
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  prompt_id uuid references public.prompts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, prompt_id)
);

-- Comments Table
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  prompt_id uuid references public.prompts(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.categories enable row level security;
alter table public.prompts enable row level security;
alter table public.votes enable row level security;
alter table public.tags enable row level security;
alter table public.prompt_tags enable row level security;
alter table public.favorites enable row level security;
alter table public.comments enable row level security;

-- Policies

-- Categories: Public Read
create policy "Categories public view" on public.categories for select using (true);

-- Prompts: Public Read, Auth Insert/Update/Delete (Owner)
create policy "Prompts public view" on public.prompts for select using (true);
create policy "Prompts insert own" on public.prompts for insert with check (auth.uid() = user_id);
create policy "Prompts update own" on public.prompts for update using (auth.uid() = user_id);
create policy "Prompts delete own" on public.prompts for delete using (auth.uid() = user_id);

-- Votes: Public Read, Auth Insert/Update/Delete (Own vote)
create policy "Votes public view" on public.votes for select using (true);
create policy "Votes insert own" on public.votes for insert with check (auth.uid() = user_id);
create policy "Votes update own" on public.votes for update using (auth.uid() = user_id);
create policy "Votes delete own" on public.votes for delete using (auth.uid() = user_id);

-- Tags: Public Read, Auth Create
create policy "Tags public view" on public.tags for select using (true);
create policy "Tags insert auth" on public.tags for insert with check (auth.role() = 'authenticated');

-- Prompt Tags: Public Read, Auth Manage
create policy "Prompt tags public view" on public.prompt_tags for select using (true);
create policy "Prompt tags insert auth" on public.prompt_tags for insert with check (
  exists (select 1 from public.prompts where id = prompt_tags.prompt_id and user_id = auth.uid())
);

-- Favorites: Owner Read/Write
create policy "Favorites owner view" on public.favorites for select using (auth.uid() = user_id);
create policy "Favorites insert own" on public.favorites for insert with check (auth.uid() = user_id);
create policy "Favorites delete own" on public.favorites for delete using (auth.uid() = user_id);

-- Comments: Public Read, Owner Write
create policy "Comments public view" on public.comments for select using (true);
create policy "Comments insert own" on public.comments for insert with check (auth.uid() = user_id);
create policy "Comments update own" on public.comments for update using (auth.uid() = user_id);
create policy "Comments delete own" on public.comments for delete using (auth.uid() = user_id);

-- Trigger to update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_prompts_updated_at before update on public.prompts for each row execute procedure update_updated_at_column();
create trigger update_comments_updated_at before update on public.comments for each row execute procedure update_updated_at_column();

-- Seed Data (Categories)
insert into public.categories (name, slug, description) values
('İçerik Üretimi', 'icerik-uretimi', 'Metin yazımı, blog, sosyal medya'),
('Kod Geliştirme', 'kod-gelistirme', 'Yazılım, hata ayıklama, optimizasyon'),
('Analiz & Araştırma', 'analiz-arastirma', 'Veri analizi, pazar araştırması'),
('Yaratıcı Çalışmalar', 'yaratici-calismalar', 'Hikaye, senaryo, şiir'),
('Eğitim & Öğretim', 'egitim-ogretim', 'Ders planı, sınav soruları'),
('İş & Verimlilik', 'is-verimlilik', 'Toplantı, sunum, proje yönetimi'),
('Dil & Çeviri', 'dil-ceviri', 'Çeviri, gramer, dil öğrenimi'),
('Diğer', 'diger', 'Genel kullanım')
on conflict (slug) do nothing;

-- Function to increment view count
create or replace function increment_view_count(row_id uuid)
returns void as $$
begin
  update public.prompts
  set view_count = view_count + 1
  where id = row_id;
end;
$$ language plpgsql;
