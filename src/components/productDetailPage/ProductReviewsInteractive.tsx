"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";
import { useGetUserOrdersQuery } from "@/lib/redux/features/orders/ordersApi";
import type { Review } from "@/types/review.types";
import ReviewCard from "./ReviewCard";
import WriteReview from "./WriteReview";

export default function ProductReviewsInteractive({
  productId,
  extraReviews,
  reviewerIds,
}: {
  productId: number;
  /** Reviews beyond the first 10 (already rendered on the server). */
  extraReviews: Review[];
  /** userIds who have an approved review — used to gate the write form. */
  reviewerIds: number[];
}) {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);
  const [showAll, setShowAll] = useState(false);

  const { data: ordersData } = useGetUserOrdersQuery(
    { page: 1, limit: 200 },
    { skip: !isAuthenticated }
  );

  const hasPurchased =
    ordersData?.orders.some(
      (order) =>
        order.status !== "cancelled" &&
        order.items.some((item) => item.productId === productId)
    ) ?? false;

  const hasReviewed = user ? reviewerIds.includes(user.id) : false;

  return (
    <>
      {extraReviews.length > 0 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-6 font-inter font-medium text-[14px] lg:text-base leading-6 tracking-[0.02em] underline text-foreground hover:text-primary transition-colors"
        >
          Load More Reviews
        </button>
      )}

      {showAll && (
        <div className="flex flex-col gap-3.75 mt-3.75">
          {extraReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}

      {hasPurchased && (
        <div id="write-review" className="mt-12.5">
          <WriteReview
            productId={productId}
            isAuthenticated={isAuthenticated}
            onReviewSubmitted={() => router.refresh()}
            hasReviewed={hasReviewed}
          />
        </div>
      )}
    </>
  );
}
