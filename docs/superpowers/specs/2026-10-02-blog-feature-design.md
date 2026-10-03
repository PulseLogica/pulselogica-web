# Blog Feature — Design

## Context
PulseLogica's marketing site has no content-marketing surface today — only static pages (Hero, Phases, Case Studies, Pulse Check, legal pages). A blog improves SEO visibility and gives the sales funnel something to link to/nurture leads with. Per the user's decisions: content is Supabase-backed (not hardcoded TS data like case studies), authored directly via the Supabase Table Editor for v1 (no admin UI — same pattern already established for `blueprint_orders`, where order rows are created externally), body content is Markdown, and categories/tags are included from the start.

This plan covers schema, validation, routing, and UI/UX. No code is written yet — this is the spec to implement against.

## Decisions confirmed with the user
- **Authoring:** Supabase Table Editor directly, no admin UI in v1.
- **Content format:** Markdown (not MDX) — simple to hand-author as a plain DB column, no compile step.
- **Taxonomy:** Categories/tags included now, not deferred.

## Database schema

Following this repo's established conventions exactly (`supabase/schema/blueprint_orders.sql`): snake_case, `uuid primary key default gen_random_uuid()`, `timestamptz default now()`, status-like fields as `text + check (...)` rather than Postgres enums, plain SQL file run manually (no migration tooling exists in this repo).

**New file: `supabase/schema/blog_posts.sql`**
```sql
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
```

**Design notes:**
- `excerpt` is a required, separately-authored field (not auto-truncated from `content_markdown`) — gives control over what shows in the index/card and in `<meta description>`, rather than an arbitrary substring cutting off mid-sentence.
- `category_id` is a single nullable FK (one category per post) — simplest taxonomy shape; `blog_tags`/`blog_post_tags` is the many-to-many for free-form tags, matching the "include tags now" decision without over-complicating categories into many-to-many too (one-category-per-post is the common blog convention and avoids ambiguous "primary category" questions later).
- `status`/`published_at` split (same pattern as `blueprint_orders.status`): a post can be saved as `draft` and have a future/empty `published_at`; the index/detail queries only ever select `status = 'published' and published_at <= now()`, so same-day authoring doesn't require code changes to "go live" at a specific time.
- No `author_name` FK/user table — this repo has no auth/user system; a plain text field matching `blueprint_orders.client_name`'s style is sufficient for now. Revisit if multi-author attribution with bios/avatars becomes a real need.

## Validation

This repo's zod usage so far is only for the Formik contact form (`src/components/PulseCheck/utils/schema.ts`) — there's no existing API-route body validator to mirror. Since blog data is read-only from the app's perspective (no POST/create route — posts are authored directly in Supabase), the validation need here is different from the Blueprint flow: it's about safely narrowing what Supabase returns, not validating untrusted input.

**New file: `src/types/blog-types.ts`**
```ts
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
`BlogPostSchema.parse(...)` is called once in the data-fetching layer (see below) right after the Supabase query returns — this guards against a malformed row (e.g. someone leaves a required field blank in the Table Editor) producing a broken page instead of a confusing runtime error deep in a component.

## Data access layer

**New file: `src/lib/blog.ts`** — mirrors `src/lib/supabase.ts`'s `getSupabaseServerClient()` usage pattern (fresh client per call, service-role key, server-only):
- `getPublishedPosts(): Promise<BlogPostListItem[]>` — `blog_posts` joined to `blog_categories` + `blog_tags` (via `blog_post_tags`), filtered to `status = 'published' and published_at <= now()`, ordered `published_at desc`.
- `getPostBySlug(slug: string): Promise<BlogPost | null>` — same join, single post, same published-filter (so an unpublished/future post 404s rather than leaking via a guessed URL).
- `getAllPublishedSlugs(): Promise<string[]>` — powers `generateStaticParams` for the detail route.

## Routing

Following the exact `case-studies/[slug]` shell pattern (Nav/ScrollReveal/Footer/BackToTop wrapper, `generateStaticParams`, `params: Promise<{...}>`):

- **`src/app/blog/page.tsx`** — index/listing page. Calls `getPublishedPosts()` server-side, renders `<BlogIndex posts={...} />`.
- **`src/app/blog/[slug]/page.tsx`** — detail page. `generateStaticParams` from `getAllPublishedSlugs()`; `getPostBySlug(slug)`, `notFound()` if missing; renders `<BlogPostDetail post={...} />`; exports `generateMetadata` for per-post `<title>`/`<meta description>`/OG tags (title from `post.title`, description from `post.excerpt`, image from `post.cover_image_url`) — this is the concrete SEO payoff the user asked for ("improve visibility").
- Both pages are **dynamic-content-but-statically-rendered** at build time via `generateStaticParams`/ISR-style regeneration is out of scope for v1 (no on-demand revalidation) — a new post requires a redeploy to appear, same tradeoff already accepted by the fully-static case-studies pattern. Flagged as a known v1 limitation, not a gap to silently paper over: if "publish without a deploy" turns out to matter, the fix is adding `export const revalidate = <seconds>` to both pages (time-based ISR) — a one-line addition when needed, not a redesign.

## UI/UX plan

Grounded in this repo's actual design tokens (`globals.css`/`tailwind.config.ts`) — no new colors or fonts introduced. Supplementary UX guidance (line-length, contrast) cross-checked against general accessibility/editorial best practices.

### Blog index (`src/components/Blog/BlogIndex.tsx`)
- Same shell as every other section: `.annot` eyebrow ("From the field" or similar) + `text-4xl md:text-5xl font-light tracking-tight` H1, centered, matching `CaseStudies`/`Phases` section headers.
- **Card grid, not the stacked full-width cards** `CaseStudies` uses — a blog index needs to scan many more items than two case studies, so: `grid md:grid-cols-2 lg:grid-cols-3 gap-6`, each card `.card-dark rounded-2xl` (reusing the established card surface), cover image (`next/image`, `aspect-[16/10] object-cover rounded-t-2xl` — this introduces the first real cover-image use case in the codebase beyond the Nav logo), category pill (`.annot`-style, amber), title (`text-xl font-semibold leading-snug`), excerpt (`text-sm text-slate-400 leading-relaxed`, 2–3 lines via `line-clamp-3`), author + date footer row (`text-xs text-slate-500`).
- Category filter as a simple pill row above the grid (`/blog?category=<slug>` query param, server-rendered — no client-side state needed for v1), tags surfaced only on the detail page, not as a second filter dimension in the index (keeps the index simple; tag-based discovery can be added later as a `/blog/tag/[slug]` route using the same data layer if needed).
- No pagination/infinite-scroll complexity for v1 — straight chronological list. Revisit once post count actually exceeds what's comfortable on one page (B2B consulting blogs rarely need infinite scroll; a "Load more" button or simple numbered pagination is the right future addition, not infinite scroll, which hurts footer/CTA discoverability on a conversion-focused site).

### Blog post detail (`src/components/Blog/BlogPostDetail.tsx`)
- Header block: category pill, `text-4xl md:text-6xl font-light tracking-tight leading-[1.1]` title (matching `CaseStudyDetail`'s `font-light` detail-page-title convention, not Hero's `font-bold`), author/date/read-time row, optional cover image full-width below the header (`rounded-2xl`, matches card treatment).
- **Reading column width is the single most important UX decision here**: wrap the rendered Markdown body in `max-w-[680px] mx-auto` (not the sitewide `max-w-3xl`/`max-w-5xl` used for marketing sections) — at this site's body font size (~16-18px), 680px keeps lines in the ~65-75 character range that's standard for sustained reading comfort, versus the wider marketing-section containers which are fine for short paragraphs but fatiguing for long-form text.
- Body typography: `text-slate-300 leading-[1.75]` (slightly looser than the `leading-relaxed` used for short marketing copy — long-form reading benefits from more line-height), headings within the markdown body styled via a typography wrapper (`prose`-style class scoped to `.blog-content`, not Tailwind's `@tailwindcss/typography` plugin unless we add it — simplest to hand-write a small set of scoped selectors in `globals.css` under `.blog-content h2`, `.blog-content h3`, `.blog-content p`, `.blog-content a`, `.blog-content blockquote`, `.blog-content code`, `.blog-content pre` using the existing color tokens, avoiding a new dependency for something this codebase can style directly).
- **Contrast**: body copy at `text-slate-300` (not `text-slate-400`, which is this site's existing *secondary/muted* copy color) against the dark `--color-bg-mid`/`--color-bg-deep` gradient — `slate-300` is close to white/cream and comfortably exceeds 4.5:1 against this dark background, appropriate for primary reading content rather than secondary/caption text. Links within body copy use `text-amber underline underline-offset-2` (amber already passes contrast against the dark background per existing sitewide usage as an accent/link color).
- Blockquotes: left amber border (`border-l-2` + `var(--color-amber)`) + `text-slate-400 italic`, consistent with the site's existing amber-accent-as-emphasis motif rather than inventing a new treatment.
- Code blocks (if any post needs them): `.card-dark`-style surface (reuse the existing card background/border tokens) with monospace font — no new font family needed, fall back to system monospace since this isn't a developer-tool site and code blocks will be rare/incidental.
- **No reading-progress bar or table-of-contents for v1** — these suit long technical/tutorial content; a B2B consulting authority-building blog's posts are more likely to be shorter thought-leadership pieces where this adds UI complexity without matching the content. Revisit only if actual post length patterns justify it once real content exists.
- **Related posts**: a simple "More from the blog" row of 2-3 cards (same card component as the index) at the bottom, same-category preferred, falling back to most recent — directly serves the "build authority, keep visitors reading" goal without needing a recommendation system.
- CTA: end every post with the same `BOOK_STRATEGY_SESSION_URL` CTA button (`.btn-primary`) already used sitewide — a blog's job on this site is lead nurture, so every post should end with the same conversion path as everywhere else, not a dead end.

### New dependency
- A Markdown renderer is required — none exists in this repo. Recommend `react-markdown` (lightweight, no MDX compile step, matches the "Markdown not MDX" decision) over `next-mdx-remote` (which is for MDX). `react-markdown` renders directly from the `content_markdown` string at request/build time inside the Server Component — no additional build tooling needed.

## File structure summary
```
supabase/schema/blog_posts.sql          (new)
src/types/blog-types.ts                 (new)
src/lib/blog.ts                         (new)
src/app/blog/page.tsx                   (new)
src/app/blog/[slug]/page.tsx            (new)
src/components/Blog/BlogIndex.tsx       (new)
src/components/Blog/BlogPostDetail.tsx  (new)
src/app/globals.css                     (modified — add `.blog-content` scoped typography rules)
src/components/Nav.tsx                  (modified — add a "Blog" link to the LINKS array)
```

## Open items for a future phase (deliberately out of v1 scope)
- Admin UI for authoring (currently: Supabase Table Editor).
- On-demand revalidation / ISR for instant-publish without a redeploy.
- Tag-based browsing route (`/blog/tag/[slug]`).
- Multi-author profiles (bio, avatar, author archive page) if the team grows beyond informal `author_name` text.
- RSS feed / sitemap entry for `/blog/*` — worth doing alongside this feature if SEO is the primary driver, but not blocking the initial build; flagging so it isn't forgotten rather than silently dropping it.

## Verification (once implemented)
- `npx tsc --noEmit` / `npm run build` after each file, matching this repo's established verification convention (no test framework exists).
- Insert 2-3 test rows directly via Supabase Table Editor (one per category, a couple of shared tags) and confirm: index renders cards correctly, category pill filter works, detail page renders Markdown correctly (headings/links/blockquote/code), `generateMetadata` output is correct (view page source), related-posts logic picks same-category posts first, draft/future-`published_at` posts are excluded from both index and direct-URL access (404).
