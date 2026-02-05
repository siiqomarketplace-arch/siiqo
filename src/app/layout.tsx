import "./globals.css";
import ScrollToTop from "@/components/ui/ScrollToTop";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import ConditionalHeader from "@/components/ConditionalHeader";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import MainContentWrapper from "./home/MainContentWrapper";
import { CartModalProvider } from "@/context/cartModalContext";
import ToastProvider from "@/context/ToastProvider";
import { LocationProvider } from "@/context/LocationContext";

// Lazy load non-critical components
const ConditionalBottomNav = dynamic(
  () => import("@/components/ConditionalBottomNav"),
  { ssr: true, loading: () => null },
);

export const metadata: Metadata = {
  metadataBase: new URL("https://siiqo.com"),
  title: "Siiqo | Local Marketplace for Trusted Vendors in Nigeria",
  description:
    "Shop trusted local vendors, discover nearby deals, and grow your storefront with Siiqo — Nigeria’s community-first marketplace for buyers and sellers.",
  verification: {
    google: "VjXbfDnRbOuyWtoJsjwZcokMaSHsz6iVFZE1NnS0A_g",
  },
  alternates: {
    canonical: "https://siiqo.com/",
  },
  openGraph: {
    title: "Siiqo | Local Marketplace for Trusted Vendors in Nigeria",
    description:
      "Discover nearby deals, trusted vendors, and verified storefronts on Siiqo. Buy locally, sell smarter.",
    url: "https://siiqo.com/",
    siteName: "Siiqo",
    type: "website",
    images: [
      {
        url: "/images/siiqo.png",
        width: 1200,
        height: 630,
        alt: "Siiqo marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Siiqo | Local Marketplace for Trusted Vendors in Nigeria",
    description:
      "Discover nearby deals, trusted vendors, and verified storefronts on Siiqo.",
    images: ["/images/siiqo.png"],
  },
  icons: {
    icon: "/images/siiqo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Siiqo",
              url: "https://siiqo.com",
              logo: "https://siiqo.com/images/siiqo.png",
              sameAs: [
                "https://www.facebook.com",
                "https://www.instagram.com",
                "https://x.com",
                "https://www.linkedin.com",
              ],
            }),
          }}
        />
      </head>
      <body cz-shortcut-listen="true">
        <AuthProvider>
          <CartProvider>
            <CartModalProvider>
              <LocationProvider>
                <ErrorBoundary>
                  <ConditionalHeader />
                  <ToastProvider />
                  <MainContentWrapper>{children}</MainContentWrapper>
                  <ConditionalBottomNav />
                  <ScrollToTop />
                </ErrorBoundary>
              </LocationProvider>
            </CartModalProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
