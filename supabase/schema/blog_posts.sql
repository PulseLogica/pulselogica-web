-- supabase/schema/blog_posts.sql
-- Run manually via the Supabase SQL editor (no migration tooling in this repo yet).

create table blog_categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  created_at timestamptz not null default now()
);

create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text not null,
  content_markdown text not null,
  cover_image_url text,
  author_name text not null default 'PulseLogica Team',
  category_id uuid references blog_categories(id),
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table blog_tags (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null
);

create table blog_post_tags (
  post_id uuid not null references blog_posts(id) on delete cascade,
  tag_id uuid not null references blog_tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

create index blog_posts_status_published_at_idx on blog_posts (status, published_at desc);
