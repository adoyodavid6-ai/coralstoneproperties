import type { MetadataRoute } from "next";
import { PROPERTIES } from "@/lib/data/properties";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/search`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
  ];

  const listings: MetadataRoute.Sitemap = PROPERTIES.map((p) => ({
    url: `${SITE_URL}/property/${p.slug}`,
    lastModified: new Date(p.listedOn),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...listings];
}
