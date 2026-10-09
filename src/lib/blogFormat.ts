/**
 * Blog types and display helpers that are safe in client components — kept
 * apart from blog.ts so the posts data never ships to the browser.
 */

export type PortableSpan = { _type: "span"; _key?: string; text: string; marks?: string[] };
export type PortableBlock = {
  _type: string;
  _key?: string;
  style?: string;
  listItem?: "bullet" | "number";
  level?: number;
  children?: PortableSpan[];
  markDefs?: { _key: string; _type: string; href?: string }[];
};

export type PostSummary = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  image: string;
};

export type Post = PostSummary & {
  detailImage: string;
  seo?: { metaTitle?: string; metaDescription?: string; keywords?: string[] };
  body: { kind: "portable"; blocks: PortableBlock[] } | { kind: "markdown"; text: string };
};

/** Sanity image URLs take sizing parameters; local images are served as-is. */
export function imageUrl(src: string, width: number, height?: number) {
  if (!src.startsWith("https://cdn.sanity.io/")) return src;
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  if (height) {
    url.searchParams.set("h", String(height));
    url.searchParams.set("fit", "crop");
  }
  url.searchParams.set("auto", "format");
  return url.toString();
}

/** "ADVANCED SERVICES" → "Advanced Services"; short codes read better as words. */
export function categoryLabel(category: string) {
  const labels: Record<string, string> = { WEB: "Web", APP: "App", SEO: "SEO", MARKETING: "Marketing", "ADVANCED SERVICES": "Advanced Services" };
  return labels[category] ?? category;
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}
