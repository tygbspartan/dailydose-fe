import type { MetadataRoute } from "next";

const SITE = "https://dailydose.skin";

// Regenerate at most once an hour so newly-added products show up without a
// redeploy.
export const revalidate = 3600;

// API base for the server-side product fetch: dev uses the absolute
// NEXT_PUBLIC_API_URL; the merged prod deploy serves the API on the same origin.
function apiBase(): string {
  const env = process.env.NEXT_PUBLIC_API_URL || "/api";
  return /^https?:\/\//.test(env) ? env : `${SITE}${env}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE}/policies`, changeFrequency: "yearly", priority: 0.3 },
  ];

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${apiBase()}/products?limit=1000&isActive=true`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const json = await res.json();
      const products: Array<{ slug?: string; updatedAt?: string }> =
        json?.data?.data ?? [];
      productRoutes = products
        .filter((p) => !!p.slug)
        .map((p) => ({
          url: `${SITE}/product/${p.slug}`,
          lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
          changeFrequency: "weekly",
          priority: 0.8,
        }));
    }
  } catch {
    // API unreachable — still return the static routes so the sitemap is valid.
  }

  return [...staticRoutes, ...productRoutes];
}
