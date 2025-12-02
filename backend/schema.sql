-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Formats Table
create table if not exists formats (
  id text primary key,
  name text not null,
  generation int4 not null,
  total_battles int8 default 0,
  created_at timestamptz default now()
);

-- Pokemon Stats Table
create table if not exists pokemon_stats (
  id uuid primary key default uuid_generate_v4(),
  format_id text references formats(id),
  pokemon_name text not null,
  slug text not null,
  rating int4 not null,
  usage_percent float8 not null,
  rank int4 not null,
  data jsonb not null,
  created_at timestamptz default now(),
  unique (format_id, pokemon_name, rating)
);

-- Moves Table
create table if not exists moves (
  id text primary key,
  name text not null,
  type text,
  category text,
  base_power int4,
  accuracy int4,
  description text,
  created_at timestamptz default now()
);

-- Items Table
create table if not exists items (
  id text primary key,
  name text not null,
  description text,
  spritenum int4,
  created_at timestamptz default now()
);

-- Abilities Table
create table if not exists abilities (
  id text primary key,
  name text not null,
  description text,
  created_at timestamptz default now()
);

-- Pokedex Table
create table if not exists pokedex (
  name text primary key,
  types text[],
  base_stats jsonb,
  abilities jsonb,
  created_at timestamptz default now()
);
