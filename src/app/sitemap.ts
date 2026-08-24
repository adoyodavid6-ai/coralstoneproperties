import type { MetadataRoute } from "next";
import { PROPERTIES } from "@/lib/data/properties";
import { SITE_URL } from "@/lib/site";

// Public marketing / info pages, in rough priority order. Admin, saved,
// bookings and compare are intentionally excluded — they are utility routes
// with no SEO value.
const STATIC_PATHS: { path: string; priority: number }[] = [
  { path: "/search", priority: 0.9 },
  { path: "/pricing", priority: 0.8 },
  { path: "/list", priority: 0.8 },
  { path: "/verification", priority: 0.7 },
  { path: "/valuation", priority: 0.7 },
  { path: "/mortgage", priority: 0.7 },
  { path: "/diaspora", priority: 0.7 },
  { path: "/sacco", priority: 0.6 },
  { path: "/area-guides", priority: 0.6 },
  { path: "/conveyancers", priority: 0.6 },
  { path: "/about", priority: 0.5 },
  { path: "/contact", priority: 0.5 },
  { path: "/anti-fraud", priority: 0.5 },
  { path: "/report", priority: 0.4 },
  { path: "/terms", priority: 0.3 },
  { path: "/data-protection", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const home: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
  ];

  const staticRoutes: MetadataRoute.Sitemap = STATIC_PATHS.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority,
  }));

  const listings: MetadataRoute.Sitemap = PROPERTIES.map((p) => ({
    url: `${SITE_URL}/property/${p.slug}`,
    lastModified: new Date(p.listedOn),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...home, ...staticRoutes, ...listings];
}
