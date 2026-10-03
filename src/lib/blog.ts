// src/lib/blog.ts
import { getSupabaseServerClient } from "@/lib/supabase";
import { BlogPostSchema, BlogPostListItemSchema, type BlogPost, type BlogPostListItem } from "@/types/blog-types";

const LIST_SELECT = `
  id, slug, title, excerpt, cover_image_url, author_name, published_at,
  category:blog_categories(slug, name),
  blog_post_tags(blog_tags(slug, name))
`;

const DETAIL_SELECT = `
  id, slug, title, excerpt, content_markdown, cover_image_url, author_name, published_at,
  category:blog_categories(slug, name),
  blog_post_tags(blog_tags(slug, name))
`;

function flattenTags(row: { blog_post_tags?: { blog_tags: { slug: string; name: string } | null }[] | null }) {
  return (row.blog_post_tags ?? [])
    .map((pt) => pt.blog_tags)
    .filter((tag): tag is { slug: string; name: string } => tag !== null);
}

export async function getPublishedPosts(): Promise<BlogPostListItem[]> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(LIST_SELECT)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to fetch published blog posts:", error);
    return [];
  }

  return data.map((row) =>
    BlogPostListItemSchema.parse({
      ...row,
      category: Array.isArray(row.category) ? row.category[0] ?? null : row.category,
      tags: flattenTags(row as any),
    })
  );
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(DETAIL_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return BlogPostSchema.parse({
    ...data,
    category: Array.isArray(data.category) ? data.category[0] ?? null : data.category,
    tags: flattenTags(data as any),
  });
}

export async function getAllPublishedSlugs(): Promise<string[]> {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select("slug")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString());

  if (error || !data) {
    console.error("Failed to fetch blog post slugs:", error);
    return [];
  }

  return data.map((row) => row.slug as string);
}
