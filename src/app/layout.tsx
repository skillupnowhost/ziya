import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { NavbarProvider } from "@/context/NavbarContext";
import { WishlistProvider } from "@/context/WishlistContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MainWrapper from "@/components/MainWrapper";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Toaster } from "react-hot-toast";

const BASE_URL = "https://www.ziyakart.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Ziyakart – Korean Fashion & Accessories | Chennai, Tamil Nadu",
    template: "%s | Ziyakart",
  },
  description:
    "Ziyakart – Shop authentic Korean fashion, accessories, stationery & K-beauty in Chennai, Tamil Nadu. Free delivery on orders above ₹999. Trendy Korean series items delivered across India.",
  keywords: [
    "ziyakart",
    "ziya kart",
    "ziyakart korean series",
    "korean accessories tamil",
    "korean accessories chennai",
    "korean fashion india",
    "k-beauty india",
    "korean stationery",
    "korean series accessories",
    "ziya fashion closet",
    "korean fashion chennai",
    "korean products india",
    "k-fashion tamil nadu",
  ],
  authors: [{ name: "Ziyakart", url: BASE_URL }],
  creator: "Ziyakart",
  publisher: "Ziyakart",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "Ziyakart",
    title: "Ziyakart – Korean Fashion & Accessories | Chennai",
    description:
      "Shop authentic Korean fashion, accessories, stationery & K-beauty. Delivered across India. Free delivery above ₹999.",
    images: [
      {
        url: `${BASE_URL}/ziya-logo.png`,
        width: 1200,
        height: 630,
        alt: "Ziyakart – Korean Fashion & Accessories",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ziyakart – Korean Fashion & Accessories | Chennai",
    description:
      "Shop authentic Korean fashion, accessories & K-beauty delivered across India.",
    images: [`${BASE_URL}/ziya-logo.png`],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Ziyakart",
  alternateName: ["Ziya Kart", "Ziya - the Fashion Closet"],
  url: BASE_URL,
  logo: `${BASE_URL}/ziya-logo.png`,
  description:
    "Ziyakart sells authentic Korean fashion, accessories, stationery and K-beauty products in Chennai, Tamil Nadu and across India.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Chennai",
    addressRegion: "Tamil Nadu",
    addressCountry: "IN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["English", "Tamil"],
  },
  sameAs: [],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Ziyakart",
  url: BASE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/products?search={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" data-scroll-behavior="smooth">
      <head>
        <Script
          id="org-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <Script
          id="website-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
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
              <MobileBottomNav />
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
