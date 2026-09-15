import type { Review } from "@/types/review.types";
import StarsStatic from "./StarsStatic";

// Server-safe review card (no client hooks) — used to render the first reviews
// into the initial HTML. Uses an absolute formatted date (in a <time>) rather
// than relative "x days ago" so there's no server/client drift.
function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default function ReviewCard({ review }: { review: Review }) {
  const firstName = review.user?.firstName ?? "";
  const lastName = review.user?.lastName ?? "";
  const displayName =
    firstName || lastName
      ? `${firstName}${lastName ? " " + lastName : ""}`.trim()
      : review.user?.email?.split("@")[0] ?? "Anonymous";

  return (
    <div>
      <div className="flex flex-col">
        <div className="flex flex-wrap items-center gap-2.5">
          <svg width={24} height={24} viewBox="0 0 24 24" className="text-[#747373] shrink-0" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4 0-8 2-8 5v1h16v-1c0-3-4-5-8-5z"
            />
          </svg>
          <span className="font-montserrat font-semibold text-[14px] lg:text-base leading-none text-black">
            {displayName}
          </span>
          {review.isVerifiedPurchase && (
            <span className="flex items-center gap-1 rounded-full border border-[#9CA3AF] bg-[#F3F4F6] px-2.5 py-0.5">
              <span className="font-inter font-medium text-[12px] lg:text-[14px] leading-5.5 text-[#374151]">
                Verified Buyer
              </span>
            </span>
          )}
          <time
            dateTime={review.createdAt}
            className="font-montserrat font-normal text-[12px] lg:text-sm leading-none text-[#747373]"
          >
            {formatDate(review.createdAt)}
          </time>
          <div className="ml-auto shrink-0 hidden lg:block">
            <StarsStatic rating={review.rating} size={20} />
          </div>
        </div>
        <div className="lg:hidden mt-0.75">
          <StarsStatic rating={review.rating} size={20} />
        </div>
        {review.title && (
          <p className="mt-1.25 font-montserrat font-semibold text-[14px] lg:text-base leading-tight text-black">
            {review.title}
          </p>
        )}
        <p className="mt-1.25 font-inter font-normal text-[14px] lg:text-base leading-6 tracking-[0.02em] text-justify text-[#4B4B4B]">
          {review.comment}
        </p>

        {review.followupReview && (
          <div className="flex flex-col gap-2.5 mt-3.75">
            <div className="flex items-center gap-2.5">
              <span className="font-inter font-semibold text-[16px] leading-6 tracking-[0.02em] text-black">
                Follow up
              </span>
              <time
                dateTime={review.followupReview.createdAt}
                className="font-montserrat font-normal text-[14px] leading-none text-[#454545]"
              >
                {formatDate(review.followupReview.createdAt)}
              </time>
            </div>
            <p className="font-inter font-normal text-[16px] leading-6 tracking-[0.02em] text-justify text-[#4B4B4B]">
              {review.followupReview.comment}
            </p>
          </div>
        )}
      </div>
      <hr className="mt-3.75 border-[#AFAFAF]" />
    </div>
  );
}
