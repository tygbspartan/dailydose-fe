import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.imgur.com",
      },
      {
        protocol: "https",
        hostname: "imgur.com",
      },
      {
        protocol: "http",
        hostname: "i.imgur.com",
      },
      {
        protocol: "http",
        hostname: "imgur.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      // Merged prod: backend serves uploads from the SAME origin. It returns
      // ABSOLUTE URLs (`${PUBLIC_BASE_URL}/uploads/...`), so next/image still
      // needs the host whitelisted (only fully-relative "/uploads/..." paths
      // would skip this). Set backend PUBLIC_BASE_URL=https://dailydose.skin so
      // the URLs match this pattern.
      {
        protocol: "https",
        hostname: "dailydose.skin",
        pathname: "/uploads/**",
      },
      // Kept transitional in case PUBLIC_BASE_URL still points at the old
      // api subdomain — remove once fully merged.
      {
        protocol: "https",
        hostname: "api.dailydose.skin",
        pathname: "/uploads/**",
      },
      // Local dev: images come back as http://localhost:5000/uploads/...
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/uploads/**",
      },
    ],
  },
  // 301 the old query-filter URLs to the clean, indexable category/brand routes.
  async redirects() {
    return [
      {
        source: "/products",
        has: [{ type: "query", key: "category", value: "(?<slug>[^&]+)" }],
        destination: "/category/:slug",
        permanent: true,
      },
      {
        source: "/products",
        has: [{ type: "query", key: "brand", value: "(?<slug>[^&]+)" }],
        destination: "/brand/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
