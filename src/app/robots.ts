import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Utility / private routes — no SEO value, keep out of search results.
      disallow: ["/admin", "/saved", "/bookings", "/compare"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
