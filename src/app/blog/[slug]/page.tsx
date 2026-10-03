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
    <main className="min-h-screen flex flex-col">
      <ScrollReveal />
      <Nav />
      <div className="flex-1">
        <BlogPostDetail post={post} relatedPosts={relatedPosts} />
      </div>
      <Footer />
      <BackToTop />
    </main>
  );
}
