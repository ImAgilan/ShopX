import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export default function Footer() {
  const { site } = useSelector(s => s.settings);
  return (
    <footer className="mt-20 bg-[#1F2937] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="text-2xl font-black mb-3" style={{ color: "var(--primary)" }}>
              {site?.siteName || "Shop‑X"}
            </div>
            <p className="text-sm text-gray-400 mb-5 max-w-xs leading-relaxed">
              {site?.tagline || "Sri Lanka's premium shopping destination."}
            </p>
            <div className="space-y-2 text-sm text-gray-400">
              {site?.companyEmail && <div className="flex items-center gap-2"><Mail size={13} /><span>{site.companyEmail}</span></div>}
              {site?.companyPhone && <div className="flex items-center gap-2"><Phone size={13} /><span>{site.companyPhone}</span></div>}
              {site?.companyAddress && <div className="flex items-center gap-2"><MapPin size={13} /><span>{site.companyAddress}</span></div>}
            </div>
            {/* Socials */}
            <div className="flex items-center gap-3 mt-5">
              {site?.socialLinks?.facebook  && <a href={site.socialLinks.facebook}  target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#FF6A00] transition-colors"><Facebook  size={14}/></a>}
              {site?.socialLinks?.instagram && <a href={site.socialLinks.instagram} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#FF6A00] transition-colors"><Instagram size={14}/></a>}
              {site?.socialLinks?.twitter   && <a href={site.socialLinks.twitter}   target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#FF6A00] transition-colors"><Twitter   size={14}/></a>}
              {site?.socialLinks?.youtube   && <a href={site.socialLinks.youtube}   target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#FF6A00] transition-colors"><Youtube   size={14}/></a>}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--primary)" }}>Quick Links</p>
            <ul className="space-y-2.5 text-sm text-gray-400">
              {[["Home","/"],["Products","/products"],["Cart","/cart"],["My Orders","/orders"],["Profile","/profile"]].map(([l,p]) => (
                <li key={p}><Link to={p} className="hover:text-white hover:translate-x-1 inline-block transition-all duration-150">{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Payment */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--primary)" }}>We Accept</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {["PayHere","Visa","Mastercard","Cash on Delivery"].map(m => (
                <span key={m} className="text-xs px-3 py-1.5 rounded-lg bg-white/10 font-medium">{m}</span>
              ))}
            </div>
            <p className="text-xs text-gray-500">🔒 All transactions are secure & encrypted</p>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-500">{site?.footerText || "© 2024 Shop‑X. All rights reserved."}</p>
          <p className="text-xs text-gray-600">Made with ❤️ in Sri Lanka</p>
        </div>
      </div>
    </footer>
  );
}
