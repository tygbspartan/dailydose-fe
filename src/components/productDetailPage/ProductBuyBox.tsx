"use client";

import { useRef, useState } from "react";
import { Icon } from "@iconify/react";
import type { Product } from "@/types/product.types";
import { useCart } from "@/lib/redux/features/cart/useCart";
import { useWishlist } from "@/lib/redux/features/wishlist/useWishlist";
import { useFly } from "@/components/providers/FlyProvider";
import { useToast } from "@/components/ui/ToastStack";
import { StarDisplay } from "./shared";

export default function ProductBuyBox({
  product,
  averageRating,
  totalReviews,
}: {
  product: Product;
  averageRating: number;
  totalReviews: number;
}) {
  const { addItem: addToCart } = useCart();
  const { isInWishlist: isInWishlistFn, addItem: addToWishlist } = useWishlist();
  const isInWishlist = isInWishlistFn(product.id);
  const { flyToCart, flyToWishlist } = useFly();
  const { showToast } = useToast();

  const cartBtnRef = useRef<HTMLButtonElement>(null);
  const wishBtnRef = useRef<HTMLButtonElement>(null);
  const [quantity, setQuantity] = useState(1);

  const primaryImg =
    product.images?.find((i) => i.isPrimary)?.imageUrl ??
    product.images?.[0]?.imageUrl;

  const isOOS = product.stockQuantity === 0;

  const handleAddToCart = async () => {
    const rect = cartBtnRef.current?.getBoundingClientRect();
    if (rect && primaryImg) flyToCart(rect, primaryImg);
    try {
      await addToCart(product, quantity);
      setQuantity(1);
      showToast({ icon: "hugeicons:shopping-cart-check-in-02", title: "Added to Cart!", variant: "positive" });
    } catch {}
  };

  const handleWishlist = async () => {
    if (isInWishlist) return;
    const rect = wishBtnRef.current?.getBoundingClientRect();
    if (rect && primaryImg) flyToWishlist(rect, primaryImg);
    try {
      await addToWishlist(product);
      showToast({ icon: "hugeicons:heart-add", title: "Added to Wishlist!", variant: "positive" });
    } catch {}
  };

  const handleShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({ title: product.name, url: window.location.href }).catch(() => {});
    } else if (typeof navigator !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      showToast({ icon: "mdi:link-variant", title: "Link copied!", variant: "positive" });
    }
  };

  return (
    <div className="flex flex-col gap-5 lg:gap-6.25">
      {/* Rating + share + wishlist */}
      <div className="flex items-center gap-3">
        <StarDisplay rating={averageRating} size={24} />
        <span className="font-inter font-medium text-[20px] leading-none text-[#4B4B4B]">
          ({totalReviews})
        </span>
        <div className="ml-auto flex items-center gap-4">
          <button onClick={handleShare} className="hover:opacity-60 transition-opacity" aria-label="Share">
            <Icon icon="tdesign:share-filled" width={24} height={24} />
          </button>
          <button ref={wishBtnRef} onClick={handleWishlist} className="group" aria-label="Add to wishlist">
            <span className="relative inline-block w-6 h-6">
              <Icon icon="fa:heart-o" width={24} height={24} className={`text-primary transition-opacity ${isInWishlist ? "opacity-0" : "group-hover:opacity-0"}`} />
              <Icon icon="fa:heart" width={24} height={24} className={`text-primary absolute inset-0 transition-opacity ${isInWishlist ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
            </span>
          </button>
        </div>
      </div>

      {/* Select Quantity + stepper + add to cart */}
      <div className="flex flex-col gap-2.5">
        <span className="font-inter font-normal text-[14px] lg:text-base leading-none capitalize text-[#4B4B4B]">
          Select Quantity
        </span>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={isOOS || quantity <= 1}
              className="w-10 h-10 border border-[#D4D4D4] rounded-[3px] flex items-center justify-center font-inter font-normal text-base uppercase disabled:opacity-40 disabled:cursor-not-allowed"
            >
              −
            </button>
            <div className="w-10 h-10 border border-[#D4D4D4] rounded-[3px] flex items-center justify-center font-inter font-normal text-base uppercase">
              {quantity}
            </div>
            <button
              onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
              disabled={isOOS || quantity >= product.stockQuantity}
              className="w-10 h-10 border border-[#D4D4D4] rounded-[3px] flex items-center justify-center font-inter font-normal text-base uppercase disabled:opacity-40 disabled:cursor-not-allowed"
            >
              +
            </button>
          </div>
          <button
            ref={cartBtnRef}
            onClick={handleAddToCart}
            disabled={isOOS}
            className="w-32.25 h-10 bg-black text-white font-inter font-medium text-[14px] lg:text-base leading-none uppercase rounded-[3px] px-2.5 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
          >
            {isOOS ? "OUT OF STOCK" : "ADD TO CART"}
          </button>
        </div>
      </div>
    </div>
  );
}
