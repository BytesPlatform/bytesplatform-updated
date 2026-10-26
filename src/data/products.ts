/** Product routes, shared by the menu and the sitemap. */
export const productLinks = [
  { slug: "byte-bots", label: "Byte Bots" },
  { slug: "byte-suites", label: "Byte Suites" },
  { slug: "bytescon", label: "Bytescon" },
  { slug: "e-invoicing", label: "E-Invoicing" },
  { slug: "molarline-ai", label: "MolarLine AI" },
] as const;

export type ProductSlug = (typeof productLinks)[number]["slug"];
