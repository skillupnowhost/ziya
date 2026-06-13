import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";

export const metadata: Metadata = {
  title: "Korean Dresses & Fashion Online | Chennai, Tamil Nadu – Ziyakart",
  description: "Shop Korean dresses, accessories, stationery & K-beauty online. Authentic Indo-Korean fashion curated for India — based in Chennai, Tamil Nadu. Free delivery above ₹999.",
  alternates: { canonical: "https://www.ziyakart.com" },
  openGraph: {
    title: "Korean Dresses & Fashion in Chennai | Ziyakart",
    description: "Authentic Korean dresses and K-fashion delivered across India. Curated in Chennai, Tamil Nadu. Free shipping above ₹999.",
    url: "https://www.ziyakart.com",
    images: [{ url: "https://www.ziyakart.com/ziya-logo.png", width: 1200, height: 630, alt: "Ziyakart – Korean Dresses & Fashion Chennai" }],
  },
};
import CategorySection from "@/components/home/CategorySection";
import TrendingSection from "@/components/home/TrendingSection";
import NewArrivalsSection from "@/components/home/NewArrivalsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <CategorySection />
      <TrendingSection />
      <NewArrivalsSection />
      <TestimonialsSection />
    </div>
  );
}
