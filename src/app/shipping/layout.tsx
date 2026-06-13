import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping & Delivery Policy | Ziyakart Korean Fashion India",
  description: "Ziyakart shipping info: free delivery above ₹999, Tamil Nadu 2–3 days, pan-India up to 14 days. Authentic Korean fashion delivered to your door from Chennai.",
  alternates: { canonical: "https://www.ziyakart.com/shipping" },
  openGraph: {
    title: "Shipping & Delivery | Ziyakart Korean Fashion",
    description: "Free shipping above ₹999. Tamil Nadu: 2–3 days, South India: 2–5 days, North India: 5–8 days. Korean fashion delivered across India.",
    url: "https://www.ziyakart.com/shipping",
    images: [{ url: "https://www.ziyakart.com/ziya-logo.png", width: 1200, height: 630, alt: "Ziyakart Shipping – Korean Fashion India" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shipping Policy | Ziyakart Korean Fashion",
    description: "Free shipping above ₹999. Delivery across India in 2–14 days.",
  },
};

export default function ShippingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
