import Nav from "@/components/Nav";
import ScrollReveal from "@/components/ScrollReveal";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import BlogIndex from "@/components/Blog/BlogIndex";
import { getPublishedPosts } from "@/lib/blog";

export const metadata = {
  title: "Blog — PulseLogica",
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
