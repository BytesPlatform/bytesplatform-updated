import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import BlogShell from "@/components/blog/BlogShell";
import PostView from "@/components/blog/PostView";
import { getAllPosts, getPost, getRelatedPosts, imageUrl } from "@/lib/blog";

type Props = { params: Promise<{ slug: string }> };

// Matches BLOG_REVALIDATE; posts published after a build render on first visit.
export const revalidate = 1200;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getAllPosts()).map(({ slug }) => ({ slug }));
}

/** The old site paginated at /blogs/page-N; the index now loads more in place. */
const isOldPagination = (slug: string) => /^page-\d+$/.test(slug);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (isOldPagination(slug)) return {};
  const post = await getPost(slug);
  if (!post) return {};
  const title = post.seo?.metaTitle?.trim() || post.title;
  const description = post.seo?.metaDescription?.trim() || post.excerpt;
  const url = `/blogs/${post.slug}`;
  return {
    title,
    description,
    keywords: post.seo?.keywords,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title,
      description,
      url,
      publishedTime: post.date,
      images: post.detailImage ? [{ url: imageUrl(post.detailImage, 1200, 630) }] : undefined,
    },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  if (isOldPagination(slug)) permanentRedirect("/blogs");
  const post = await getPost(slug);
  if (!post) notFound();
  const related = await getRelatedPosts(post);
  return (
    <BlogShell>
      <PostView post={post} related={related} />
    </BlogShell>
  );
}
