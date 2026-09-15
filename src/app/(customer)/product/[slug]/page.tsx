import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { getProductBySlug, getProductReviews, getRelatedProducts } from "@/lib/server/catalog";
import { buildProductJsonLd, buildBreadcrumbJsonLd, SITE_URL } from "@/lib/seo/jsonld";
import ProductGallery from "@/components/productDetailPage/ProductGallery";
import ProductBuyBox from "@/components/productDetailPage/ProductBuyBox";
import ReviewCard from "@/components/productDetailPage/ReviewCard";
import StarsStatic from "@/components/productDetailPage/StarsStatic";
import ProductReviewsInteractive from "@/components/productDetailPage/ProductReviewsInteractive";
import SimilarProducts from "@/components/productDetailPage/SimilarProducts";

// ── SEO metadata (shares the cached product fetch with the page) ──────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const title = product.metaTitle?.trim() || product.name;
  const description =
    product.metaDescription?.trim() ||
    product.longDescription?.trim() ||
    `Buy ${product.name} online at Daily Dose — authentic skincare & personal care in Nepal.`;
  const primaryImage =
    product.images?.find((i) => i.isPrimary)?.imageUrl ?? product.images?.[0]?.imageUrl;

  return {
    title,
    description,
    alternates: { canonical: `/product/${slug}` },
    openGraph: {
      title,
      description,
      url: `/product/${slug}`,
      type: "website",
      images: primaryImage ? [{ url: primaryImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: primaryImage ? [primaryImage] : undefined,
    },
  };
}

// Category chain (L1 → L2 → L3) from the product's category parent chain.
type CatNode = { name: string; slug: string; parent?: CatNode | null };
function buildChain(cat: CatNode | null | undefined) {
  const chain: { name: string; slug: string }[] = [];
  let c = cat;
  while (c) {
    chain.unshift({ name: c.name, slug: c.slug });
    c = c.parent ?? null;
  }
  return chain;
}

const fmt = (n: number) => `Rs. ${n.toLocaleString("en-NP")}`;

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [reviewData, related] = await Promise.all([
    getProductReviews(product.id),
    getRelatedProducts(
      product.category?.slug ?? null,
      (product.category as unknown as CatNode)?.parent?.slug ?? null,
      product.id
    ),
  ]);

  const { reviews, summary } = reviewData;
  const firstReviews = reviews.slice(0, 10);
  const extraReviews = reviews.slice(10);
  const reviewerIds = reviews.map((r) => r.userId);

  const price = Number(product.price);
  const originalPrice = product.originalPrice != null ? Number(product.originalPrice) : null;
  const hasDiscount = originalPrice != null && originalPrice > price;
  const saveAmount = hasDiscount ? originalPrice! - price : 0;

  const isOOS = product.stockQuantity === 0;
  const isLowStock = !isOOS && product.stockQuantity <= product.lowStockThreshold;
  const stockLabel = isOOS
    ? "Out of Stock"
    : isLowStock
    ? `Low Stock — Only ${product.stockQuantity} left`
    : "In Stock";

  const chain = buildChain(product.category as unknown as CatNode);
  const productUrl = `${SITE_URL}/product/${slug}`;

  const productJsonLd = buildProductJsonLd(product, {
    url: productUrl,
    averageRating: summary.averageRating,
    reviewCount: summary.totalReviews,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: "Home", url: SITE_URL },
    ...chain.map((c) => ({
      name: c.name,
      url: `${SITE_URL}${ROUTES.CATEGORY}/${c.slug}`,
    })),
    { name: product.name, url: productUrl },
  ]);

  const specs = product.specifications ?? [];

  return (
    <div className="page-wrapper space-y-12.5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="font-inter text-[12px] lg:text-sm text-[#747373]">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href={ROUTES.HOME} className="hover:text-primary">Home</Link>
          </li>
          {chain.map((c) => (
            <li key={c.slug} className="flex items-center gap-1.5">
              <span aria-hidden>/</span>
              <Link href={`${ROUTES.CATEGORY}/${c.slug}`} className="hover:text-primary">
                {c.name}
              </Link>
            </li>
          ))}
          <li className="flex items-center gap-1.5">
            <span aria-hidden>/</span>
            <span className="text-[#4B4B4B] line-clamp-1" aria-current="page">{product.name}</span>
          </li>
        </ol>
      </nav>

      {/* Top: gallery + details */}
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        <ProductGallery images={product.images ?? []} name={product.name} />

        <div className="w-full lg:w-[40%] flex flex-col gap-5 lg:gap-6.25">
          <p className="font-inter font-normal text-[14px] lg:text-base leading-none uppercase tracking-normal text-[#4B4B4B]">
            {stockLabel}
          </p>

          <div className="flex flex-col gap-1.5">
            <h1 className="font-montserrat font-normal text-[18px] lg:text-2xl leading-tight text-black">
              {product.name}
            </h1>
            <div className="flex items-center gap-2.5 flex-wrap">
              {hasDiscount && (
                <span className="font-montserrat font-medium text-[14px] lg:text-[22px] leading-none text-[#B1A6A6] line-through">
                  {fmt(originalPrice!)}
                </span>
              )}
              <span className="font-montserrat font-medium text-[20px] lg:text-[22px] leading-none text-black">
                {fmt(price)}
              </span>
              {hasDiscount && (
                <span className="bg-[#15792B] rounded-xs text-white font-inter font-semibold text-[14px] leading-5.5 text-center px-2">
                  Save {fmt(saveAmount)}
                </span>
              )}
            </div>
          </div>

          <ProductBuyBox
            product={product}
            averageRating={summary.averageRating}
            totalReviews={summary.totalReviews}
          />

          {/* Product Overview */}
          <div className="flex flex-col gap-2.5">
            <p className="font-inter font-normal text-[14px] lg:text-base leading-none uppercase text-primary">
              Product Overview
            </p>
            {product.brand && (
              <div className="flex flex-col gap-1.25">
                <p className="font-inter font-normal text-[14px] lg:text-base leading-none capitalize text-black">Brand</p>
                <Link
                  href={`${ROUTES.BRAND}/${product.brand.slug}`}
                  className="font-inter font-normal text-[14px] lg:text-base leading-5 tracking-[0.02em] text-[#4B4B4B] hover:text-primary w-fit"
                >
                  {product.brand.name}
                </Link>
              </div>
            )}
            {product.category && (
              <div className="flex flex-col gap-1.25">
                <p className="font-inter font-normal text-[14px] lg:text-base leading-none capitalize text-black">Product Type</p>
                <Link
                  href={`${ROUTES.CATEGORY}/${product.category.slug}`}
                  className="font-inter font-normal text-[14px] lg:text-base leading-5 tracking-[0.02em] text-[#4B4B4B] hover:text-primary w-fit"
                >
                  {product.category.name}
                </Link>
              </div>
            )}
            {product.countryOfOrigin && (
              <div className="flex flex-col gap-1.25">
                <p className="font-inter font-normal text-[14px] lg:text-base leading-none capitalize text-black">Country of Origin</p>
                <p className="font-inter font-normal text-[14px] lg:text-base leading-5 tracking-[0.02em] text-justify text-[#4B4B4B]">
                  {product.countryOfOrigin}
                </p>
              </div>
            )}
            {product.longDescription && (
              <div className="flex flex-col gap-1.25">
                <p className="font-inter font-normal text-[14px] lg:text-base leading-none capitalize text-black">Description</p>
                <p className="font-inter font-normal text-[14px] lg:text-base leading-5 tracking-[0.02em] text-justify text-[#4B4B4B] whitespace-pre-line">
                  {product.longDescription}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Specifications */}
      {specs.length > 0 && (
        <section>
          <h2 className="font-montserrat font-medium text-[18px] lg:text-2xl leading-none text-black w-fit border-b-2 border-primary pb-1 mb-5">
            Specifications
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <tbody>
                {specs.map((s) => (
                  <tr key={s.id} className="border-b border-[#E5E5E5]">
                    <th scope="row" className="py-2.5 pr-6 align-top font-montserrat font-medium text-[14px] lg:text-base text-black w-1/3">
                      {s.key}
                    </th>
                    <td className="py-2.5 font-inter font-normal text-[14px] lg:text-base text-[#4B4B4B]">
                      {s.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Similar products */}
      <SimilarProducts products={related} />

      {/* Reviews */}
      <section>
        <h2 className="font-montserrat font-medium text-[18px] lg:text-2xl leading-none text-black w-fit mx-auto lg:mx-0 text-center border-b-2 border-primary pb-1 mb-5">
          Reviews
        </h2>

        {summary.totalReviews > 0 ? (
          <>
            <div className="flex items-center gap-3 mb-5">
              <StarsStatic rating={summary.averageRating} size={22} />
              <span className="font-inter font-medium text-[16px] leading-none text-[#4B4B4B]">
                {summary.averageRating.toFixed(1)} ({summary.totalReviews})
              </span>
            </div>
            <div className="flex flex-col gap-3.75">
              {firstReviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </>
        ) : (
          <p className="font-inter font-normal text-[14px] lg:text-base text-[#4B4B4B]">
            No reviews yet. Have you tried this product? Share your experience and help others decide.
          </p>
        )}

        <ProductReviewsInteractive
          productId={product.id}
          extraReviews={extraReviews}
          reviewerIds={reviewerIds}
        />
      </section>
    </div>
  );
}
