/** Product routes, shared by the menu and the sitemap. */
export const productLinks = [
  { slug: "byte-bots", label: "Byte Bots" },
  { slug: "byte-suites", label: "Byte Suites" },
  { slug: "bytesgov", label: "BytesGov" },
  { slug: "bytesbilling", label: "BytesBilling" },
  { slug: "bytesagentic", label: "BytesAgentic" },
] as const;

export type ProductSlug = (typeof productLinks)[number]["slug"];
