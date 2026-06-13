import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Korean Dresses, Accessories & Fashion | Shop Online – Ziyakart",
  description: "Browse authentic Korean dresses, accessories, stationery & K-beauty at Ziyakart. Trendy Indo-Korean fashion shipped across India from Chennai, Tamil Nadu.",
  alternates: { canonical: "https://www.ziyakart.com/products" },
  openGraph: {
    title: "Shop Korean Fashion – Dresses, Accessories & More | Ziyakart",
    description: "Curated Korean dresses, accessories and stationery. Free delivery above ₹999. Chennai-based Korean fashion store delivering across India.",
    url: "https://www.ziyakart.com/products",
    images: [{ url: "https://www.ziyakart.com/ziya-logo.png", width: 1200, height: 630, alt: "Ziyakart – Korean Fashion Collection" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop Korean Fashion | Ziyakart",
    description: "Korean dresses, accessories & K-beauty delivered across India.",
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
