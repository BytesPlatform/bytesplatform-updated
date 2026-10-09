/** Service routes, shared by the menu, the home page cards and the sitemap. */
export const serviceLinks = [
  { slug: "web", label: "Web Development" },
  { slug: "seo", label: "SEO" },
  { slug: "app", label: "App Development" },
  { slug: "marketing", label: "Marketing" },
  { slug: "advanced-services", label: "Advanced Services" },
] as const;

export type ServiceSlug = (typeof serviceLinks)[number]["slug"];
