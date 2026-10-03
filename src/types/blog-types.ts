// src/types/blog-types.ts
import { z } from "zod";

export const BlogPostSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  content_markdown: z.string(),
  cover_image_url: z.string().url().nullable(),
  author_name: z.string(),
  category: z.object({ slug: z.string(), name: z.string() }).nullable(),
  tags: z.array(z.object({ slug: z.string(), name: z.string() })),
  published_at: z.string().nullable(),
});

export type BlogPost = z.infer<typeof BlogPostSchema>;

export const BlogPostListItemSchema = BlogPostSchema.omit({ content_markdown: true });
export type BlogPostListItem = z.infer<typeof BlogPostListItemSchema>;
