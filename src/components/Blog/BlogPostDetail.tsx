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
