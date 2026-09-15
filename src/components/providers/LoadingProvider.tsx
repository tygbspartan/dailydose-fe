"use client";

import { useState, useEffect } from "react";
import PageLoader from "@/components/ui/PageLoader";
import { useGetCategoriesQuery } from "@/lib/redux/features/categories/categoriesApi";
import { useGetBrandsQuery } from "@/lib/redux/features/brands/brandsApi";
import { useGetFeaturedProductsQuery } from "@/lib/redux/features/products/productsApi";

export default function LoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isReady, setIsReady] = useState(false);

  // Preload critical data
  const { isLoading: categoriesLoading } = useGetCategoriesQuery();
  const { isLoading: brandsLoading } = useGetBrandsQuery();
  const { isLoading: productsLoading } = useGetFeaturedProductsQuery();

  useEffect(() => {
    // Wait for critical data to load
    if (!categoriesLoading && !brandsLoading && !productsLoading) {
      // Add a small delay for smooth transition
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [categoriesLoading, brandsLoading, productsLoading]);

  // Render children immediately so their content is in the server HTML (SEO),
  // and show the loader as an overlay on top until the preloaded data is ready.
  // Replacing children with the loader (the old behavior) meant every page's
  // SSR output was just the spinner — invisible to crawlers.
  return (
    <>
      {children}
      {!isReady && <PageLoader />}
    </>
  );
}
