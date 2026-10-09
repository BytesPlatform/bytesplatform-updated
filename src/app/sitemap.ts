import { site } from "@/data/site";
import { serviceLinks } from "@/data/services";
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
  ];
}
