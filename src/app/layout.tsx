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
  { ssr: true, loading: () => null }
);

export const metadata: Metadata = {
  title: "Siiqo",
  description: "Your local Marketplace",
  verification: {
    google: "B1hcioL2LHc1exAvGJa46CzyUSQDVBwhbtk9VLkPKOo",
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
