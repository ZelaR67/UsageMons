-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create formats table
create table if not exists formats (
  id text primary key, -- e.g., 'gen9ou'
  name text,
  generation int,
  created_at timestamptz default now()
);

-- Create pokemon_stats table
create table if not exists pokemon_stats (
  id uuid default gen_random_uuid() primary key,
  format_id text references formats(id) on delete cascade,
  pokemon_name text not null,
  slug text, -- For URL lookups
  rating int not null,
  usage_percent float,
  rank int,
  data jsonb not null, -- Stores the full stats object (moves, items, etc.)
  created_at timestamptz default now(),
  unique(format_id, pokemon_name, rating)
);

-- Create moves table
create table if not exists moves (
  id text primary key,
  name text,
  type text,
  category text,
  base_power int,
  accuracy int,
  description text,
  created_at timestamptz default now()
);

-- Create items table
create table if not exists items (
  id text primary key,
  name text,
  description text,
  spritenum int,
  created_at timestamptz default now()
);

-- Create abilities table
create table if not exists abilities (
  id text primary key,
  name text,
  description text,
  created_at timestamptz default now()
);

-- Create pokedex table
create table if not exists pokedex (
  name text primary key,
  types text[],
  base_stats jsonb,
  abilities jsonb,
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table formats enable row level security;
alter table pokemon_stats enable row level security;
alter table moves enable row level security;
alter table items enable row level security;
alter table abilities enable row level security;
alter table pokedex enable row level security;

-- Create policies to allow public read access
create policy "Public formats are viewable by everyone"
  on formats for select
  using ( true );

create policy "Public pokemon_stats are viewable by everyone"
  on pokemon_stats for select
  using ( true );

create policy "Public moves are viewable by everyone"
  on moves for select
  using ( true );

create policy "Public items are viewable by everyone"
  on items for select
  using ( true );

create policy "Public abilities are viewable by everyone"
  on abilities for select
  using ( true );

create policy "Public pokedex are viewable by everyone"
  on pokedex for select
  using ( true );

-- Create policies to allow authenticated (service role) insert/update/delete
-- Note: The anon key cannot write, only read. You need the service_role key for the python script.
create policy "Service role can manage formats"
  on formats for all
  using ( auth.role() = 'service_role' );

create policy "Service role can manage pokemon_stats"
  on pokemon_stats for all
  using ( auth.role() = 'service_role' );

create policy "Service role can manage moves"
  on moves for all
  using ( auth.role() = 'service_role' );

create policy "Service role can manage items"
  on items for all
  using ( auth.role() = 'service_role' );

create policy "Service role can manage abilities"
  on abilities for all
  using ( auth.role() = 'service_role' );

create policy "Service role can manage pokedex"
  on pokedex for all
  using ( auth.role() = 'service_role' );
