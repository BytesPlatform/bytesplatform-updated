import type { Metadata } from "next";
import BlogShell from "@/components/blog/BlogShell";
import BlogIndex from "@/components/blog/BlogIndex";
import { getAllPosts } from "@/lib/blog";

// Matches BLOG_REVALIDATE: refresh from Sanity at most every 20 minutes.
export const revalidate = 1200;

export const metadata: Metadata = {
  title: "Blog Insights on Web, SEO, Apps & Marketing",
  description:
    "Guides and insights from BytesPlatform on web development, SEO, mobile apps, digital marketing and AI.",
  alternates: { canonical: "/blogs" },
  openGraph: { title: "Blog · BytesPlatform", url: "/blogs" },
};

export default async function Page() {
  const posts = await getAllPosts();
  return (
    <BlogShell>
      <BlogIndex posts={posts} />
    </BlogShell>
  );
}
