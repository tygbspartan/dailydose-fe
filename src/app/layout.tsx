import type { Metadata } from "next";
import { Poppins, Inter, Montserrat } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/lib/redux/provider";
import { BRAND } from "@/config/brand";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

const SITE_TITLE = "Daily Dose | Skincare & Personal Care Products in Nepal";
const SITE_DESCRIPTION =
  "Shop authentic skincare & personal care products online in Nepal — cleansers, serums, sunscreen & more from trusted brands, delivered to your door.";

export const metadata: Metadata = {
  metadataBase: new URL("https://dailydose.skin"),
  title: {
    default: SITE_TITLE,
    // Per-page titles (e.g. a product name) render as "Name | Daily Dose".
    template: "%s | Daily Dose",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "skincare Nepal",
    "personal care Nepal",
    "buy skincare online Nepal",
    "cosmetics Nepal",
    "Daily Dose",
  ],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    siteName: "Daily Dose",
    url: "https://dailydose.skin",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ "--color-primary": BRAND.primaryColor, "--color-ring": BRAND.primaryColor } as React.CSSProperties}>
      <body className={`${poppins.className} ${inter.variable} ${montserrat.variable}`}>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
