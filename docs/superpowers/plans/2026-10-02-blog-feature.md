# Blog Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Supabase-backed Blog (index + per-post detail pages) to `pulselogica-web`, authored directly via the Supabase Table Editor, following every existing design/data convention in this repo.

**Architecture:** Two new Next.js App Router routes (`/blog`, `/blog/[slug]`) statically generated via `generateStaticParams`, backed by a new `blog_posts`/`blog_categories`/`blog_tags`/`blog_post_tags` Supabase schema, read through a small `src/lib/blog.ts` data-access layer that validates rows with zod before they reach any component. Post bodies are authored as Markdown and rendered server-side with `react-markdown`.

**Tech Stack:** Next.js 15 (App Router), TypeScript, `@supabase/supabase-js` (already a dependency), zod (already a dependency), `react-markdown` (new dependency), Tailwind CSS.

## Global Constraints

- Follow this repo's exact Supabase schema conventions: snake_case columns, `uuid primary key default gen_random_uuid()`, `timestamptz not null default now()`, status-like fields as `text not null default '<x>' check (col in (...))` — not Postgres enums. SQL files live in `supabase/schema/*.sql` and are run manually (no migration tooling exists).
- Reuse existing design tokens only — `.card-dark`, `.annot`, `.btn-primary`, `.btn-secondary`, `var(--color-amber)`, `var(--color-slate)`, `text-amber`, `text-slate-400`/`text-slate-300`/`text-slate-500`. No new colors or fonts.
- This repo has **no test framework** (no Jest/Vitest, no `*.test.*` files, no test script in `package.json`) and introducing one is out of scope. Every task's verification is `npx tsc --noEmit` + `npm run build`, plus manual verification against a real dev server and real Supabase rows (inserted via the Supabase dashboard) — this matches how every other feature in this repo (Blueprint Unlock flow, Pulse Check) was verified, and replaces this skill template's default "write a failing unit test" step throughout.
- `getSupabaseServerClient()` (`src/lib/supabase.ts`) is the only way to talk to Supabase — reuse it, don't instantiate a new client.
- Server Components by default; only add `"use client"` where genuinely needed (none of the files in this plan need it).

---

## Task 1: Database schema and validated types

**Files:**
- Create: `supabase/schema/blog_posts.sql`
- Create: `src/types/blog-types.ts`

**Interfaces:**
- Produces:
  - `BlogPostSchema` (zod) and `BlogPost` type — `{ id, slug, title, excerpt, content_markdown, cover_image_url, author_name, category: { slug, name } | null, tags: { slug, name }[], published_at }`
  - `BlogPostListItemSchema` and `BlogPostListItem` type — same shape minus `content_markdown`
  These exact names/shapes are what Task 2 (`src/lib/blog.ts`) imports and parses against, and what Tasks 3–4 (components) receive as props.

- [ ] **Step 1: Write the schema file**

```sql
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
  author_name text not null default 'Pulselogica Team',
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
```

- [ ] **Step 2: Write the types file**

```ts
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
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors (this file has no dependents yet, so it should compile standalone).

- [ ] **Step 4: Run the SQL against Supabase and insert one test row**

In the Supabase dashboard SQL editor, run the contents of `supabase/schema/blog_posts.sql`. Then, in the Table Editor, insert one test category and one test post so later tasks have real data to verify against:

- `blog_categories`: `slug = "systems"`, `name = "Systems & Operations"`
- `blog_posts`: `slug = "test-post"`, `title = "Test Post"`, `excerpt = "A test excerpt."`, `content_markdown = "# Hello\n\nThis is a **test** post with a [link](https://pulselogica.com).\n\n> A blockquote.\n\n- one\n- two"`, `category_id` = the category's id, `status = "published"`, `published_at` = now (use the Table Editor's "now" button or paste an ISO timestamp).

- [ ] **Step 5: Commit**

```bash
git add supabase/schema/blog_posts.sql src/types/blog-types.ts
git commit -m "feat: add blog database schema and validated types"
```

---

## Task 2: Data access layer

**Files:**
- Create: `src/lib/blog.ts`

**Interfaces:**
- Consumes: `getSupabaseServerClient` from `@/lib/supabase`; `BlogPostSchema`, `BlogPostListItemSchema`, `BlogPost`, `BlogPostListItem` from `@/types/blog-types` (Task 1).
- Produces:
  - `getPublishedPosts(): Promise<BlogPostListItem[]>`
  - `getPostBySlug(slug: string): Promise<BlogPost | null>`
  - `getAllPublishedSlugs(): Promise<string[]>`
  Tasks 3 and 4 call these by these exact names.

- [ ] **Step 1: Write the file**

```ts
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
```

Note on the `category`/`tags` reshaping: Supabase's JS client returns a singular FK embed (`category:blog_categories(...)`) as an array in some client versions and an object in others depending on relationship inference — the `Array.isArray(...)` guards handle both without needing to pin a specific client behavior. `flattenTags` turns the nested `blog_post_tags: [{ blog_tags: {...} }]` join shape into the flat `tags: [...]` array `BlogPostSchema` expects.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Manual verification against the real test row from Task 1**

```bash
node -e '
require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  const { data } = await supabase
    .from("blog_posts")
    .select("id, slug, title, excerpt, cover_image_url, author_name, published_at, category:blog_categories(slug, name), blog_post_tags(blog_tags(slug, name))")
    .eq("slug", "test-post")
    .maybeSingle();
  console.log(JSON.stringify(data, null, 2));
})();
'
```
Expected: prints the test post row with `category: { slug: "systems", name: "Systems & Operations" }` (or `[{...}]`) and `blog_post_tags: []`. If `dotenv` isn't installed, read `.env.local` manually the same way earlier verification scripts in this repo's history did (split on `=`, build an env object) instead of adding a new dependency just for this one-off check.

- [ ] **Step 4: Commit**

```bash
git add src/lib/blog.ts
git commit -m "feat: add blog data access layer"
```

---

## Task 3: Blog index page

**Files:**
- Create: `src/app/blog/page.tsx`
- Create: `src/components/Blog/BlogIndex.tsx`

**Interfaces:**
- Consumes: `getPublishedPosts` from `@/lib/blog` (Task 2); `BlogPostListItem` from `@/types/blog-types` (Task 1); `Nav`, `Footer`, `ScrollReveal`, `BackToTop` (existing, `@/components/*`).
- Produces: nothing consumed by later tasks — this is a leaf page.

- [ ] **Step 1: Write the index component**

```tsx
// src/components/Blog/BlogIndex.tsx
import Image from "next/image";
import Link from "next/link";
import type { BlogPostListItem } from "@/types/blog-types";

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function BlogIndex({ posts }: { posts: BlogPostListItem[] }) {
  return (
    <section className="pt-28 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <span className="annot">From the field</span>
          <h1 className="mt-5 text-4xl md:text-5xl font-light tracking-tight">
            The Pulselogica Blog
          </h1>
          <p className="mt-4 text-lg text-slate-400 max-w-xl mx-auto">
            Notes on systems, operations, and running a business that doesn&rsquo;t depend on you.
          </p>
        </div>

        {posts.length === 0 ? (
          <p className="text-center text-slate-400">No posts published yet — check back soon.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="card-dark rounded-2xl overflow-hidden flex flex-col"
              >
                {post.cover_image_url && (
                  <div className="relative aspect-[16/10]">
                    <Image
                      src={post.cover_image_url}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1">
                  {post.category && (
                    <span className="annot mb-3" style={{ color: "var(--color-amber)" }}>
                      {post.category.name}
                    </span>
                  )}
                  <h2 className="text-xl font-semibold leading-snug mb-2">{post.title}</h2>
                  <p className="text-sm text-slate-400 leading-relaxed line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="mt-auto text-xs text-slate-500">
                    {post.author_name} · {formatDate(post.published_at)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Write the route**

```tsx
// src/app/blog/page.tsx
import Nav from "@/components/Nav";
import ScrollReveal from "@/components/ScrollReveal";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import BlogIndex from "@/components/Blog/BlogIndex";
import { getPublishedPosts } from "@/lib/blog";

export const metadata = {
  title: "Blog — Pulselogica",
  description: "Notes on systems, operations, and running a business that doesn't depend on you.",
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();

  return (
    <main>
      <ScrollReveal />
      <Nav />
      <BlogIndex posts={posts} />
      <Footer />
      <BackToTop />
    </main>
  );
}
```

- [ ] **Step 3: Typecheck and build**

Run: `npx tsc --noEmit && npm run build`
Expected: both succeed. Note `next/image` requires `cover_image_url`'s host to be allow-listed in `next.config.js` if any test image uses a non-local domain — if the build fails with an "Invalid src prop" image-host error, that's expected until a real cover image CDN/domain is chosen; leaving `cover_image_url` null on the Task 1 test row avoids hitting this during this task's verification.

- [ ] **Step 4: Manual verification**

Run: `npm run dev`, visit `http://localhost:3000/blog`. Expected: the test post from Task 1 renders as a card with its category label, title, excerpt, and author/date line; clicking it 404s for now (Task 4 adds the detail page).

- [ ] **Step 5: Commit**

```bash
git add src/app/blog/page.tsx src/components/Blog/BlogIndex.tsx
git commit -m "feat: add blog index page"
```

---

## Task 4: Blog post detail page

**Files:**
- Create: `src/app/blog/[slug]/page.tsx`
- Create: `src/components/Blog/BlogPostDetail.tsx`
- Modify: `src/app/globals.css` (add `.blog-content` typography rules)
- Modify: `package.json` / `package-lock.json` (add `react-markdown`)

**Interfaces:**
- Consumes: `getPostBySlug`, `getAllPublishedSlugs`, `getPublishedPosts` from `@/lib/blog` (Task 2); `BlogPost` from `@/types/blog-types` (Task 1).
- Produces: nothing consumed by later tasks — this is a leaf page.

- [ ] **Step 1: Install the Markdown renderer**

```bash
npm install react-markdown
```

- [ ] **Step 2: Add scoped Markdown typography styles**

Append to `src/app/globals.css`, inside the existing `@layer components { ... }` block (alongside `.card-dark`, `.btn-primary`, etc.):

```css
  .blog-content {
    color: var(--color-slate);
  }
  .blog-content p {
    color: #D1D8E0;
    line-height: 1.75;
    margin-bottom: 1.5em;
  }
  .blog-content h2 {
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--color-white);
    margin-top: 2em;
    margin-bottom: 0.75em;
  }
  .blog-content h3 {
    font-size: 1.375rem;
    font-weight: 600;
    color: var(--color-white);
    margin-top: 1.75em;
    margin-bottom: 0.5em;
  }
  .blog-content a {
    color: var(--color-amber);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .blog-content blockquote {
    border-left: 2px solid var(--color-amber);
    padding-left: 1.25em;
    font-style: italic;
    color: var(--color-slate);
    margin: 1.5em 0;
  }
  .blog-content code {
    background: var(--color-white-soft);
    padding: 0.15em 0.4em;
    border-radius: 4px;
    font-size: 0.9em;
  }
  .blog-content pre {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding: 1.25em;
    overflow-x: auto;
    margin: 1.5em 0;
  }
  .blog-content pre code {
    background: none;
    padding: 0;
  }
  .blog-content ul,
  .blog-content ol {
    margin-bottom: 1.5em;
    padding-left: 1.5em;
  }
  .blog-content li {
    margin-bottom: 0.5em;
    color: #D1D8E0;
  }
```

(`#D1D8E0` for body paragraph/list text — slightly brighter than `var(--color-slate)` (`#94A3B8`) for proper reading contrast on the dark background, matching the "text-slate-300-equivalent" level called for in the spec; `var(--color-slate)` itself stays reserved for secondary/caption text, same role it already plays sitewide.)

- [ ] **Step 3: Write the detail component**

```tsx
// src/components/Blog/BlogPostDetail.tsx
import Image from "next/image";
import Link from "next/link";
import Markdown from "react-markdown";
import type { BlogPost, BlogPostListItem } from "@/types/blog-types";
import { BOOK_STRATEGY_SESSION_URL } from "@/lib/constants";

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function BlogPostDetail({
  post,
  relatedPosts,
}: {
  post: BlogPost;
  relatedPosts: BlogPostListItem[];
}) {
  return (
    <>
      <header className="pt-28 pb-12 px-6 border-b border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <Link href="/blog" className="annot inline-block mb-8 hover:text-white transition">
            ← Back to blog
          </Link>

          {post.category && (
            <span className="annot block mb-4" style={{ color: "var(--color-amber)" }}>
              {post.category.name}
            </span>
          )}
          <h1 className="text-4xl md:text-6xl font-light tracking-tight leading-[1.1]">
            {post.title}
          </h1>
          <div className="mt-6 text-sm text-slate-500">
            {post.author_name} · {formatDate(post.published_at)}
          </div>
        </div>
      </header>

      {post.cover_image_url && (
        <div className="max-w-3xl mx-auto px-6 mt-12">
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden">
            <Image src={post.cover_image_url} alt={post.title} fill className="object-cover" />
          </div>
        </div>
      )}

      <article className="px-6 py-16">
        <div className="blog-content max-w-[680px] mx-auto">
          <Markdown>{post.content_markdown}</Markdown>
        </div>
      </article>

      {post.tags.length > 0 && (
        <div className="max-w-[680px] mx-auto px-6 pb-16 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag.slug}
              className="text-xs px-3 py-1.5 rounded-full"
              style={{ background: "var(--color-white-soft)", color: "var(--color-slate)" }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 pb-20 text-center">
        <a
          href={BOOK_STRATEGY_SESSION_URL}
          className="btn-primary inline-block text-black font-bold text-[15px] px-8 py-4 rounded-[10px]"
        >
          Book your Discovery Call
        </a>
      </div>

      {relatedPosts.length > 0 && (
        <section className="border-t border-white/10 py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="annot text-center mb-10">More from the blog</div>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <Link
                  key={related.slug}
                  href={`/blog/${related.slug}`}
                  className="card-dark rounded-2xl p-6 block"
                >
                  <h3 className="text-base font-semibold leading-snug mb-2">{related.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed line-clamp-2">
                    {related.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
```

- [ ] **Step 4: Write the route**

```tsx
// src/app/blog/[slug]/page.tsx
import { notFound } from "next/navigation";
import Nav from "@/components/Nav";
import ScrollReveal from "@/components/ScrollReveal";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import BlogPostDetail from "@/components/Blog/BlogPostDetail";
import { getPostBySlug, getAllPublishedSlugs, getPublishedPosts } from "@/lib/blog";

export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) return {};

  return {
    title: `${post.title} — Pulselogica Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.cover_image_url ? [post.cover_image_url] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const allPosts = await getPublishedPosts();
  const relatedPosts = allPosts
    .filter((p) => p.slug !== post.slug)
    .sort((a, b) => {
      const aMatches = a.category?.slug === post.category?.slug ? 1 : 0;
      const bMatches = b.category?.slug === post.category?.slug ? 1 : 0;
      return bMatches - aMatches;
    })
    .slice(0, 3);

  return (
    <main>
      <ScrollReveal />
      <Nav />
      <BlogPostDetail post={post} relatedPosts={relatedPosts} />
      <Footer />
      <BackToTop />
    </main>
  );
}
```

- [ ] **Step 5: Typecheck and build**

Run: `npx tsc --noEmit && npm run build`
Expected: both succeed; `/blog/test-post` appears in the build's static route list.

- [ ] **Step 6: Manual verification**

Run: `npm run dev`, visit `http://localhost:3000/blog/test-post`. Expected: the `# Hello` heading, bold "test", the link, the blockquote, and the two-item list from the Task 1 test row's `content_markdown` all render with the `.blog-content` styles (bright body text, amber heading/links, amber-bordered blockquote). View page source and confirm the `<title>`/`<meta name="description">` match `generateMetadata`'s output.

- [ ] **Step 7: Commit**

```bash
git add src/app/blog/[slug]/page.tsx src/components/Blog/BlogPostDetail.tsx src/app/globals.css package.json package-lock.json
git commit -m "feat: add blog post detail page"
```

---

## Task 5: Navigation link and final verification

**Files:**
- Modify: `src/components/Nav.tsx`

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing consumed elsewhere — final integration task.

- [ ] **Step 1: Add the Blog link**

In `src/components/Nav.tsx`, update the `LINKS` array (currently all in-page anchors) to include a real route link. Since `LINKS` is typed as `{ href: string; label: string }[]` and rendered with a plain `<a>` tag (not `next/link`), change the Blog entry's anchor to a `Link` so client-side navigation works correctly for a real route while the rest stay in-page anchors:

```tsx
// src/components/Nav.tsx — full updated file
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BOOK_STRATEGY_SESSION_URL } from "@/lib/constants";

const LINKS = [
  { href: "#phases", label: "How it works" },
  { href: "#cases", label: "Case Studies" },
  { href: "/blog", label: "Blog" },
  { href: "#proof", label: "Proof" },
  { href: "#book", label: "Book a call" },
];

function NavLink({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  const className = "hover:text-white transition";
  if (href.startsWith("/")) {
    return (
      <Link href={href} onClick={onClick} className={className}>
        {label}
      </Link>
    );
  }
  return (
    <a href={href} onClick={onClick} className={className}>
      {label}
    </a>
  );
}

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/40 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" aria-label="Pulselogica home" className="flex items-center gap-2">
          <Image src="/assets/logo.png" alt="Pulselogica" width={120} height={32} className="h-8 w-auto" />
        </Link>
        <div className="hidden md:flex gap-8 text-sm text-slate-400">
          {LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </div>
        <a
          href={BOOK_STRATEGY_SESSION_URL}
          rel="noopener noreferrer"
          className="hidden md:inline-block btn-primary text-black font-semibold text-sm px-5 py-2.5 rounded-lg"
        >
          Book a Discovery Call
        </a>

        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="md:hidden h-9 w-9 flex items-center justify-center"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {open ? (
              <>
                <path d="M18 6 6 18" />
                <path d="M6 6l12 12" />
              </>
            ) : (
              <>
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/10 px-6 py-4 flex flex-col gap-4 text-sm text-slate-400">
          {LINKS.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} onClick={() => setOpen(false)} />
          ))}
        </div>
      )}
    </nav>
  );
}
```

- [ ] **Step 2: Typecheck and build**

Run: `npx tsc --noEmit && npm run build`
Expected: both succeed, full production build green.

- [ ] **Step 3: Manual end-to-end verification**

Run: `npm run dev`. Confirm: "Blog" appears in the desktop nav and the mobile menu; clicking it from any page (not just `/`) navigates to `/blog` correctly (this is why it needed `next/link` instead of a bare `#anchor` — anchors only work from `/`); the existing in-page anchors (`#phases`, `#cases`, etc.) still work unchanged from the homepage.

- [ ] **Step 4: Commit**

```bash
git add src/components/Nav.tsx
git commit -m "feat: add Blog link to navigation"
```

---

## Self-Review Notes

- **Spec coverage:** schema + categories/tags (Task 1), validation via zod parse in the data layer (Task 1 + 2), index route/UI (Task 3), detail route/UI/Markdown rendering/SEO metadata (Task 4), card grid + category pill + excerpt line-clamp + reading-column width + contrast + blockquote/code styling + related posts + CTA (all Task 4/3), nav integration (Task 5) — all covered. Admin UI, ISR, tag routes, RSS are explicitly out of scope per the spec's "Open items" section and not included here.
- **Placeholder scan:** no TBD/TODO; every code step is complete, runnable code.
- **Type consistency:** `BlogPost`/`BlogPostListItem` (Task 1) are used identically in `src/lib/blog.ts` (Task 2) return types, and in `BlogIndex`/`BlogPostDetail` props (Tasks 3–4) — `category: { slug, name } | null` and `tags: { slug, name }[]` shapes match across every file. `getPublishedPosts`/`getPostBySlug`/`getAllPublishedSlugs` signatures match their call sites in Tasks 3–4 exactly.
