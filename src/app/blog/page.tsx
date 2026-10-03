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
    <main className="min-h-screen flex flex-col">
      <ScrollReveal />
      <Nav />
      <div className="flex-1">
        <BlogIndex posts={posts} />
      </div>
      <Footer />
      <BackToTop />
    </main>
  );
}
