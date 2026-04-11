import { useSelector } from "react-redux";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import HeroSection from "../../components/shop/HeroSection";
import CategoriesSection from "../../components/shop/CategoriesSection";
import FeaturedProductsSection from "../../components/shop/FeaturedProductsSection";
import UpcomingProductsSection from "../../components/shop/UpcomingProductsSection";
import PromotionalBannerSection from "../../components/shop/PromotionalBannerSection";

const SECTION_MAP = {
  hero: HeroSection,
  categories: CategoriesSection,
  featured_products: FeaturedProductsSection,
  upcoming_products: UpcomingProductsSection,
  promotional_banner: PromotionalBannerSection,
  footer: null,
};

export default function HomePage() {
  const { layout, loading } = useSelector((s) => s.settings);

  if (loading) return <LoadingSpinner fullPage />;

  if (!layout) {
    return (
      <>
        <HeroSection />
        <CategoriesSection />
        <FeaturedProductsSection />
        <UpcomingProductsSection />
        <PromotionalBannerSection />
      </>
    );
  }

  const enabledSections = [...layout.sections]
    .filter(s => s.isEnabled && SECTION_MAP[s.id] !== null && SECTION_MAP[s.id] !== undefined)
    .sort((a, b) => a.order - b.order);

  return (
    <div>
      {enabledSections.map((section) => {
        const Component = SECTION_MAP[section.id];
        if (!Component) return null;
        return <Component key={section.id} settings={section.settings} />;
      })}
    </div>
  );
}
