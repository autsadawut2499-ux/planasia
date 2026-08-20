import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo/site-url";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/store", "/plans", "/draftsmen", "/articles", "/about"],
        disallow: ["/api/", "/admin", "/dashboard", "/workspace"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
