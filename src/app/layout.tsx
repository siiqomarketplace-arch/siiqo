import "./globals.css";
import ScrollToTop from "@/components/ui/ScrollToTop";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import type { Metadata } from "next";
import ConditionalHeader from "@/components/ConditionalHeader";
import ConditionalBottomNav from "@/components/ConditionalBottomNav";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import MainContentWrapper from "./home/MainContentWrapper";
import { CartModalProvider } from "@/context/cartModalContext";
import ToastProvider from "@/context/ToastProvider";

export const metadata: Metadata = {
  title: "Citymart | Roots & Squares",
  description:
    "Find products all over the country, find stores, place orders, and receive them quickly",
  icons: {
    icon: "/images/favicon.png",
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
              <ErrorBoundary>
                <ConditionalHeader />
                <ToastProvider/>
                <MainContentWrapper>{children}</MainContentWrapper>
                <ConditionalBottomNav />
                <ScrollToTop />
              </ErrorBoundary>
            </CartModalProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
