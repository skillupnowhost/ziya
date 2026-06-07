import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { NavbarProvider } from "@/context/NavbarContext";
import { WishlistProvider } from "@/context/WishlistContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MainWrapper from "@/components/MainWrapper";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: {
    default: "Ziya - the Fashion Closet | Korean Fashion & Accessories",
    template: "%s | Ziya - the Fashion Closet",
  },
  description:
    "Ziya - the Fashion Closet. Discover premium Korean-inspired fashion, accessories, stationery & beauty. Authentic Korean products delivered across India.",
  keywords: "Ziya, Korean fashion, the fashion closet, accessories, stationery, beauty, gifts, K-beauty, Korean style India",
  openGraph: {
    siteName: "Ziya - the Fashion Closet",
    images: [{ url: "/ziya-logo.png" }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col antialiased">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
            <NavbarProvider>
              <Suspense fallback={null}>
                <Navbar />
              </Suspense>
              <MainWrapper>{children}</MainWrapper>
              <Footer />
              <Toaster
                position="bottom-right"
                toastOptions={{
                  style: {
                    borderRadius: "12px",
                    background: "#fff",
                    color: "#1a1a2e",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  },
                }}
              />
            </NavbarProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
