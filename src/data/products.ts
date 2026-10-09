/** Product routes, shared by the menu and the sitemap. */
export const productLinks = [
  { slug: "byte-bots", label: "Byte Bots" },
  { slug: "byte-suites", label: "Byte Suites" },
] as const;

export type ProductSlug = (typeof productLinks)[number]["slug"];
