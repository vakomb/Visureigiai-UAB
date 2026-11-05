import type { MetadataRoute } from "next";
import { SITE } from "@/lib/config";
import { LEGAL } from "@/lib/legal";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: SITE.url, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE.url}/apie-mus`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    ...LEGAL.map((d) => ({
      url: `${SITE.url}/teisine-informacija/${d.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
