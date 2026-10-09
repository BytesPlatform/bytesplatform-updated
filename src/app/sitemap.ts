import { site } from "@/data/site";
import { serviceLinks } from "@/data/services";
import { productLinks } from "@/data/products";
import type { MetadataRoute } from "next";

const BASE = site.url;

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    ...serviceLinks.map(({ slug }) => ({
      url: `${BASE}/services/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...productLinks.map(({ slug }) => ({
      url: `${BASE}/products/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
