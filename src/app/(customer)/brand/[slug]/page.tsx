import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SITE_URL, buildBreadcrumbJsonLd, buildCollectionPageJsonLd } from "@/lib/seo/jsonld";
import { getBrandBySlug, getProductsPage } from "@/lib/server/catalog";
import CollectionView, { type Crumb } from "@/components/catalog/CollectionView";

const LIMIT = 12;

// Dynamically rendered (ƒ) — reads searchParams for pagination/sort/filters with
// per-URL canonical/robots. 1h ISR fetch cache keeps it fast.
type SP = Record<string, string | string[] | undefined>;
const str = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SP>;
}): Promise<Metadata> {
  const { slug } = await params;
  const sp = await searchParams;
  const brand = await getBrandBySlug(slug);
  if (!brand) return {};

  const cleanPath = `/brand/${slug}`;
  const pageNum = Math.max(1, Number(str(sp.page)) || 1);
  const hasFilterOrSort = Object.keys(sp).some(
    (k) => k !== "page" && sp[k] !== undefined && sp[k] !== ""
  );

  const description =
    brand.seoDescription?.trim().slice(0, 160) ||
    brand.metaDescription?.trim() ||
    `Shop genuine ${brand.name} products online in Nepal at Daily Dose — authentic, best prices, fast delivery.`;

  return {
    title: { absolute: `${brand.name} Products in Nepal — Genuine | Daily Dose` },
    description,
    robots: hasFilterOrSort ? { index: false, follow: true } : undefined,
    alternates: {
      canonical: hasFilterOrSort
        ? cleanPath
        : pageNum > 1
        ? `${cleanPath}?page=${pageNum}`
        : cleanPath,
    },
  };
}

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SP>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const page = Math.max(1, Number(str(sp.page)) || 1);
  const sortBy = str(sp.sortBy);
  const sortOrder = str(sp.sortOrder);

  const { data: products, pagination } = await getProductsPage({
    brandSlug: slug,
    page,
    limit: LIMIT,
    sortBy,
    sortOrder,
    minPrice: str(sp.minPrice),
    maxPrice: str(sp.maxPrice),
    inStock: str(sp.inStock),
  });

  const cleanPath = `/brand/${slug}`;
  const hrefForPage = (n: number) => {
    const qs = new URLSearchParams();
    if (n > 1) qs.set("page", String(n));
    if (sortBy) qs.set("sortBy", sortBy);
    if (sortOrder) qs.set("sortOrder", sortOrder);
    const s = qs.toString();
    return s ? `${cleanPath}?${s}` : cleanPath;
  };

  const breadcrumb: Crumb[] = [{ name: "Home", href: "/" }, { name: brand.name }];

  const collectionJsonLd = buildCollectionPageJsonLd({
    name: `${brand.name} — Daily Dose`,
    description:
      brand.seoDescription?.trim() ||
      brand.metaDescription?.trim() ||
      `Shop genuine ${brand.name} products online in Nepal at Daily Dose.`,
    url: `${SITE_URL}${cleanPath}`,
    total: pagination.total,
    items: products.map((p) => ({ name: p.name, slug: p.slug })),
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    { name: brand.name, url: `${SITE_URL}${cleanPath}` },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <CollectionView
        title={`${brand.name} Products in Nepal`}
        intro={brand.seoDescription}
        breadcrumb={breadcrumb}
        products={products}
        total={pagination.total}
        page={page}
        totalPages={pagination.totalPages}
        hrefForPage={hrefForPage}
      />
    </>
  );
}
