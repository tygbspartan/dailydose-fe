import type { Metadata } from "next";
import { serverApiBase } from "@/lib/serverApi";
import ProductDetailClient from "./ProductDetailClient";

// Per-product SEO: uses the admin-entered metaTitle/metaDescription when set,
// otherwise falls back to the product name / short description. Runs on the
// server so search engines and social crawlers actually see it.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const base = await serverApiBase();
    const res = await fetch(
      `${base}/products/slug/${encodeURIComponent(slug)}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return {};
    const json = await res.json();
    const p = json?.data;
    if (!p) return {};

    const title: string = p.metaTitle?.trim() || p.name;
    const description: string =
      p.metaDescription?.trim() ||
      p.shortDescription?.trim() ||
      `Buy ${p.name} online at Daily Dose — authentic skincare & personal care in Nepal.`;
    const primaryImage: string | undefined =
      p.images?.find((i: { isPrimary?: boolean }) => i.isPrimary)?.imageUrl ??
      p.images?.[0]?.imageUrl;

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
  } catch {
    return {};
  }
}

export default function ProductDetailPage() {
  return <ProductDetailClient />;
}
