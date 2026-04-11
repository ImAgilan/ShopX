import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowRight, ShieldCheck, Truck, RotateCcw } from "lucide-react";

export default function HeroSection({ settings = {} }) {
  const { site } = useSelector(s => s.settings);
  const {
    heading    = `Welcome to ${site?.siteName || "Shop‑X"}`,
    subheading = "Discover amazing products at unbeatable prices",
    ctaText    = "Shop Now",
    ctaLink    = "/products",
    image      = "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200",
  } = settings;

  return (
    <section className="relative overflow-hidden bg-[#FFF4EC]">
      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #FF6A00, transparent)" }} />
      <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #FF6A00, transparent)" }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left text */}
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6 border"
              style={{ backgroundColor: "var(--orange-subtle)", color: "var(--primary)", borderColor: "var(--orange-divider)" }}>
              🇱🇰 Sri Lanka's #1 Online Store
            </div>
            <h1 className="text-4xl md:text-5xl xl:text-6xl font-black text-[#1F2937] leading-tight mb-5">
              {heading}
            </h1>
            <p className="text-lg text-[#6B7280] mb-8 leading-relaxed max-w-lg">{subheading}</p>
            <div className="flex flex-wrap gap-3">
              <Link to={ctaLink}>
                <button className="btn btn-primary btn-xl">
                  {ctaText} <ArrowRight size={18} />
                </button>
              </Link>
              <Link to="/products">
                <button className="btn btn-ghost btn-xl">Browse All</button>
              </Link>
            </div>
          </div>

          {/* Right image */}
          <div className="relative animate-fade-up hidden md:block" style={{ animationDelay: "0.1s" }}>
            <div className="absolute inset-4 rounded-3xl opacity-20" style={{ background: "var(--primary)", filter: "blur(40px)" }} />
            <img src={image} alt="Shopping" className="relative rounded-2xl shadow-xl w-full h-80 object-cover" />
          </div>
        </div>

        {/* Feature pills */}
        <div className="grid grid-cols-3 gap-4 mt-14">
          {[
            { icon: Truck,       label: "Free Delivery",   sub: `Orders over Rs. ${site?.freeShippingThreshold?.toLocaleString() || "5,000"}` },
            { icon: ShieldCheck, label: "Secure Payment",  sub: "100% Protected" },
            { icon: RotateCcw,   label: "Easy Returns",    sub: "30‑day policy" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm border border-[#FFD2B3]">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--orange-subtle)" }}>
                <Icon size={18} style={{ color: "var(--primary)" }} />
              </div>
              <div>
                <p className="text-[#1F2937] text-xs font-bold">{label}</p>
                <p className="text-[#6B7280] text-xs">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
