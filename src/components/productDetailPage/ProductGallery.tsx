"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/types/product.types";

export default function ProductGallery({
  images,
  name,
}: {
  images: ProductImage[];
  name: string;
}) {
  const sorted = useMemo(
    () =>
      [...(images ?? [])].sort((a, b) => {
        if (a.isPrimary && !b.isPrimary) return -1;
        if (!a.isPrimary && b.isPrimary) return 1;
        return a.displayOrder - b.displayOrder;
      }),
    [images]
  );

  const [selected, setSelected] = useState(0);
  const mainImage = sorted[selected];

  return (
    <div className="w-full lg:w-[60%] flex flex-col lg:flex-row gap-3">
      {/* Main image — top on mobile, right on desktop */}
      <div className="order-1 lg:order-2 w-full lg:flex-1 relative aspect-square overflow-hidden bg-[#F8F8F8]">
        {mainImage ? (
          <Image
            src={mainImage.imageUrl}
            alt={mainImage.altText ?? name}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            quality={90}
            className="object-contain"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="font-inter text-sm text-gray-400">No image</span>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {sorted.length > 0 && (
        <div className="order-2 lg:order-1 flex flex-row lg:flex-col gap-2.5 lg:gap-6.25 shrink-0 lg:w-1/6 mt-3.75 lg:mt-0 overflow-x-auto lg:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sorted.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setSelected(idx)}
              aria-label={`View image ${idx + 1}`}
              className={`relative thumb-strip-item aspect-square overflow-hidden bg-[#F8F8F8] border-[0.5px] border-[#C9C9C9] transition-all ${
                selected === idx
                  ? "shadow-[0px_2px_4px_0px_#00000026]"
                  : "opacity-60 hover:opacity-90"
              }`}
            >
              <Image
                src={img.imageUrl}
                alt={img.altText ?? name}
                fill
                sizes="(min-width: 1024px) 160px, 33vw"
                quality={90}
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
