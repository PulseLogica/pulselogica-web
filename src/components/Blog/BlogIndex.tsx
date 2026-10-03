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
            The PulseLogica Blog
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
