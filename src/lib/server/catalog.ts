import { cache } from "react";
import { serverApiBase } from "@/lib/serverApi";
import type { Product } from "@/types/product.types";
import type { ProductReviewsResponse } from "@/types/review.types";

export type ProductReviewsData = ProductReviewsResponse["data"];

// react cache() dedupes within a single render pass, so generateMetadata and the
// page component share one network request per product.

export const getProductBySlug = cache(
  async (slug: string): Promise<Product | null> => {
    try {
      const base = await serverApiBase();
      const res = await fetch(
        `${base}/products/slug/${encodeURIComponent(slug)}`,
        { next: { revalidate: 3600, tags: [`product:${slug}`] } }
      );
      if (!res.ok) return null; // 404 (inactive/missing) or upstream error
      const json = await res.json();
      return (json?.data as Product) ?? null;
    } catch {
      return null;
    }
  }
);

const EMPTY_REVIEWS: ProductReviewsData = {
  reviews: [],
  summary: {
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  },
};

export const getProductReviews = cache(
  async (productId: number): Promise<ProductReviewsData> => {
    try {
      const base = await serverApiBase();
      const res = await fetch(`${base}/reviews/product/${productId}`, {
        next: { revalidate: 3600, tags: [`product-reviews:${productId}`] },
      });
      if (!res.ok) return EMPTY_REVIEWS;
      const json = await res.json();
      return (json?.data as ProductReviewsData) ?? EMPTY_REVIEWS;
    } catch {
      return EMPTY_REVIEWS;
    }
  }
);

// ── Category / Brand pages ────────────────────────────────────────────────

export interface CategoryDetail {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  seoDescription: string | null;
  level: number;
  parentId: number | null;
  parent?: { name: string; slug: string; parent?: CategoryDetail["parent"] } | null;
  productCount?: number;
}

export interface BrandDetail {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  metaDescription: string | null;
  seoDescription: string | null;
  logoUrl: string | null;
  productCount?: number;
}

export interface ProductsPage {
  data: Product[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export const getCategoryBySlug = cache(
  async (slug: string): Promise<CategoryDetail | null> => {
    try {
      const base = await serverApiBase();
      const res = await fetch(`${base}/categories/slug/${encodeURIComponent(slug)}`, {
        next: { revalidate: 3600, tags: [`category:${slug}`] },
      });
      if (!res.ok) return null;
      const json = await res.json();
      return (json?.data as CategoryDetail) ?? null;
    } catch {
      return null;
    }
  }
);

export const getBrandBySlug = cache(
  async (slug: string): Promise<BrandDetail | null> => {
    try {
      const base = await serverApiBase();
      const res = await fetch(`${base}/brands/slug/${encodeURIComponent(slug)}`, {
        next: { revalidate: 3600, tags: [`brand:${slug}`] },
      });
      if (!res.ok) return null;
      const json = await res.json();
      return (json?.data as BrandDetail) ?? null;
    } catch {
      return null;
    }
  }
);

const EMPTY_PAGE: ProductsPage = {
  data: [],
  pagination: { page: 1, limit: 12, total: 0, totalPages: 0 },
};

/** Server-side product list for a category/brand grid (paginated + sortable). */
export async function getProductsPage(query: Record<string, string | number | undefined>): Promise<ProductsPage> {
  try {
    const base = await serverApiBase();
    const sp = new URLSearchParams();
    sp.set("isActive", "true");
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== "") sp.set(k, String(v));
    }
    const res = await fetch(`${base}/products?${sp.toString()}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return EMPTY_PAGE;
    const json = await res.json();
    return (json?.data as ProductsPage) ?? EMPTY_PAGE;
  } catch {
    return EMPTY_PAGE;
  }
}

/** All active slugs for generateStaticParams + sitemap. */
async function getAllSlugs(
  path: string,
  extract: (json: any) => { slug: string; updatedAt?: string }[]
): Promise<{ slug: string; updatedAt?: string }[]> {
  try {
    const base = await serverApiBase();
    const res = await fetch(`${base}${path}`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return extract(await res.json());
  } catch {
    return [];
  }
}

export const getAllCategorySlugs = () =>
  getAllSlugs("/categories", (j) =>
    (j?.data ?? [])
      .filter((c: any) => c?.slug && c?.isActive !== false)
      .map((c: any) => ({ slug: c.slug, updatedAt: c.updatedAt }))
  );

export const getAllBrandSlugs = () =>
  getAllSlugs("/brands", (j) =>
    (j?.data ?? [])
      .filter((b: any) => b?.slug)
      .map((b: any) => ({ slug: b.slug, updatedAt: b.updatedAt }))
  );

export const getAllProductSlugs = () =>
  getAllSlugs("/products?limit=5000&isActive=true", (j) =>
    (j?.data?.data ?? [])
      .filter((p: any) => p?.slug)
      .map((p: any) => ({ slug: p.slug, updatedAt: p.updatedAt }))
  );

// Related products for the "Similar Products" grid: same L3 category, falling
// back to the L2 parent, excluding the current product.
export const getRelatedProducts = cache(
  async (
    categorySlug: string | null,
    parentSlug: string | null,
    currentProductId: number
  ): Promise<Product[]> => {
    const base = await serverApiBase();

    const fetchBy = async (slug: string): Promise<Product[]> => {
      try {
        const res = await fetch(
          `${base}/products?categorySlug=${encodeURIComponent(slug)}&limit=5&isActive=true`,
          { next: { revalidate: 3600 } }
        );
        if (!res.ok) return [];
        const json = await res.json();
        const list: Product[] = json?.data?.data ?? [];
        return list.filter((p) => p.id !== currentProductId).slice(0, 4);
      } catch {
        return [];
      }
    };

    let related = categorySlug ? await fetchBy(categorySlug) : [];
    if (related.length === 0 && parentSlug) related = await fetchBy(parentSlug);
    return related;
  }
);
