import type { MetadataRoute } from "next";

const SITE = "https://dailydose.skin";

// Generates /robots.txt — tells crawlers what to index and where the sitemap is.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep private / functional pages out of search results.
      disallow: [
        "/admin",
        "/checkout",
        "/profile",
        "/order-confirmation",
        "/login",
        "/register",
        "/verify-email",
        "/forgot-password",
        "/reset-password",
        "/auth",
      ],
    },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
