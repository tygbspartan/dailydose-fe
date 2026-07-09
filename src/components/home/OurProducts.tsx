"use client";

import { useMemo } from "react";
import { useGetProductsQuery } from "@/lib/redux/features/products/productsApi";
import ProductGridCard from "@/components/products/ProductGridCard";
import SectionTitle from "@/components/home/SectionTitle";
import Spinner from "@/components/ui/Spinner";

export default function OurProducts() {
  const { data, isLoading, error } = useGetProductsQuery({
    limit: 30,
    isActive: true,
  });

  // Pick 15 at random from the pool. Runs client-side after the query
  // resolves, so there's no SSR hydration mismatch.
  const products = useMemo(() => {
    const list = data?.data.data ?? [];
    return [...list].sort(() => Math.random() - 0.5).slice(0, 15);
  }, [data]);

  if (isLoading) return <Spinner />;
  if (error || products.length === 0) return null;

  return (
    <div>
      <SectionTitle>Our Products</SectionTitle>
      <div className="mt-5 lg:mt-8.75 home-product-grid">
        {products.map((product) => (
          <ProductGridCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
