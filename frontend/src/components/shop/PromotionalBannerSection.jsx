import { Link } from "react-router-dom";

export default function PromotionalBannerSection({ settings = {} }) {
  const {
    heading    = "Special Offer! Up to 50% Off",
    subheading = "Limited time deals on selected products. Don't miss out!",
    ctaText    = "Shop Now",
    ctaLink    = "/products",
    image      = "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1200",
  } = settings;

  return (
    <section className="my-16 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="relative rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--primary)", minHeight: "280px" }}>
        {/* BG image overlay */}
        <div className="absolute inset-0 opacity-15">
          <img src={image} alt="Promo" className="w-full h-full object-cover" />
        </div>
        {/* Decorative circle */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/10" />
        <div className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full bg-white/10" />

        <div className="relative z-10 flex items-center h-full min-h-[280px] px-8 md:px-14 py-10">
          <div className="text-white max-w-xl">
            <span className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
              ⏰ Limited Time
            </span>
            <h2 className="text-3xl md:text-4xl font-black mb-3 leading-tight">{heading}</h2>
            <p className="text-white/80 text-base mb-7 max-w-md">{subheading}</p>
            <Link to={ctaLink}>
              <button className="btn btn-lg bg-white text-[#FF6A00] font-bold hover:bg-[#FFF4EC] transition-all duration-150 shadow-lg">
                {ctaText} →
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
