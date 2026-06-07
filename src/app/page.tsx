import HeroSection from "@/components/home/HeroSection";
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
