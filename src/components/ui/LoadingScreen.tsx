import Image from "next/image";
import { BRAND } from "@/config/brand";

/**
 * Full-screen loading state: the animated three-square loader centred, with the
 * company logo pinned to the bottom-right corner.
 */
export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-background">
      <div className="ddx-loader" role="status" aria-label="Loading">
        <span />
        <span />
        <span />
      </div>

      <div className="absolute bottom-6 right-6 lg:bottom-8 lg:right-8">
        <Image
          src={BRAND.logo.primary}
          alt={BRAND.name}
          width={200}
          height={55}
          quality={100}
          className="w-24 lg:w-32 h-auto"
          priority
        />
      </div>
    </div>
  );
}
