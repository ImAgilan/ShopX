import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateSiteSettings, applyTheme } from "../../redux/slices/settingsSlice";
import { Save, Palette, Globe, Phone, Image } from "lucide-react";
import toast from "react-hot-toast";

const SRI_LANKA_PROVINCES = ["Western","Central","Southern","Northern","Eastern","North Western","North Central","Uva","Sabaragamuwa"];
const FONT_OPTIONS = ["Plus Jakarta Sans","Sora","Inter","Poppins","Nunito","Raleway","Montserrat"];

const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-xl border border-[#F1F5F9] shadow-sm p-6 mb-5">
    <h2 className="flex items-center gap-2 font-bold text-base mb-5" style={{ color: "#1F2937" }}>
      <Icon size={18} style={{ color: "var(--primary)" }} /> {title}
    </h2>
    {children}
  </div>
);

export default function AdminSiteSettings() {
  const dispatch = useDispatch();
  const { site } = useSelector((s) => s.settings);
  const [form, setForm] = useState({ ...site });
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm({ ...site }); }, [site]);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setSocial = (key, val) => setForm(f => ({ ...f, socialLinks: { ...f.socialLinks, [key]: val } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await dispatch(updateSiteSettings(form));
      dispatch(applyTheme());
      toast.success("Settings saved! Theme applied instantly.");
    } catch { toast.error("Save failed"); }
    setSaving(false);
  };

  const previewTheme = () => {
    document.documentElement.style.setProperty("--color-primary", form.primaryColor);
    document.documentElement.style.setProperty("--color-secondary", form.secondaryColor);
    document.documentElement.style.setProperty("--color-accent", form.accentColor || "#F4A261");
    if (form.themeMode === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    toast.success("Theme previewed!");
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#1F2937" }}>Site Settings</h1>
        <div className="flex gap-3">
          <button onClick={previewTheme} className="btn-outline text-sm px-4 py-2">Preview Theme</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
            <Save size={15} /> {saving ? "Saving..." : "Save All"}
          </button>
        </div>
      </div>

      {/* Branding */}
      <Section title="Branding" icon={Image}>
        <div className="grid grid-cols-2 gap-4">
          {[["siteName","Site Name"],["tagline","Tagline"]].map(([k,l]) => (
            <div key={k} className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium mb-1" style={{ color: "#1F2937" }}>{l}</label>
              <input value={form[k]||""} onChange={e => set(k, e.target.value)} className="input-field" />
            </div>
          ))}
          {[["logo","Logo URL"],["favicon","Favicon URL"]].map(([k,l]) => (
            <div key={k} className="col-span-2">
              <label className="block text-sm font-medium mb-1" style={{ color: "#1F2937" }}>{l}</label>
              <input value={form[k]||""} onChange={e => set(k, e.target.value)} className="input-field" placeholder="https://..." />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "#1F2937" }}>Font Family</label>
            <select value={form.fontFamily||"Plus Jakarta Sans"} onChange={e => set("fontFamily", e.target.value)} className="input-field">
              {FONT_OPTIONS.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "#1F2937" }}>Theme Mode</label>
            <select value={form.themeMode||"light"} onChange={e => set("themeMode", e.target.value)} className="input-field">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
        </div>
      </Section>

      {/* Colors */}
      <Section title="Theme Colors" icon={Palette}>
        <div className="grid grid-cols-3 gap-4">
          {[["primaryColor","Primary Color"],["secondaryColor","Secondary Color"],["accentColor","Accent Color"]].map(([k,l]) => (
            <div key={k}>
              <label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>{l}</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={form[k]||"#E63946"} onChange={e => set(k, e.target.value)}
                  className="w-12 h-10 rounded-lg cursor-pointer border-0 p-0.5" style={{ border: "2px solid #F1F5F9" }} />
                <input value={form[k]||""} onChange={e => set(k, e.target.value)} className="input-field font-mono text-sm" placeholder="#000000" />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Currency */}
      <Section title="Currency & Pricing" icon={Globe}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "#1F2937" }}>Default Currency</label>
            <select value={form.currency||"LKR"} onChange={e => set("currency", e.target.value)} className="input-field">
              <option value="LKR">LKR (Rs.)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "#1F2937" }}>USD Rate (1 USD = X LKR)</label>
            <input type="number" value={form.usdRate||320} onChange={e => set("usdRate", Number(e.target.value))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "#1F2937" }}>Shipping Fee (Rs.)</label>
            <input type="number" value={form.shippingFee||350} onChange={e => set("shippingFee", Number(e.target.value))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "#1F2937" }}>Free Shipping Threshold (Rs.)</label>
            <input type="number" value={form.freeShippingThreshold||5000} onChange={e => set("freeShippingThreshold", Number(e.target.value))} className="input-field" />
          </div>
        </div>
      </Section>

      {/* Contact */}
      <Section title="Contact Information" icon={Phone}>
        <div className="space-y-4">
          {[["companyEmail","Company Email","email"],["companyPhone","Company Phone","tel"],["companyAddress","Company Address","text"]].map(([k,l,t]) => (
            <div key={k}>
              <label className="block text-sm font-medium mb-1" style={{ color: "#1F2937" }}>{l}</label>
              <input type={t} value={form[k]||""} onChange={e => set(k, e.target.value)} className="input-field" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: "#1F2937" }}>Footer Text</label>
            <input value={form.footerText||""} onChange={e => set("footerText", e.target.value)} className="input-field" />
          </div>
        </div>
      </Section>

      {/* Social Links */}
      <Section title="Social Links" icon={Globe}>
        <div className="grid grid-cols-2 gap-4">
          {["facebook","instagram","twitter","youtube","whatsapp"].map(platform => (
            <div key={platform}>
              <label className="block text-sm font-medium mb-1 capitalize" style={{ color: "#1F2937" }}>{platform}</label>
              <input value={form.socialLinks?.[platform]||""} onChange={e => setSocial(platform, e.target.value)} className="input-field text-sm" placeholder={`https://${platform}.com/...`} />
            </div>
          ))}
        </div>
      </Section>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          <Save size={16} /> {saving ? "Saving..." : "Save All Settings"}
        </button>
      </div>
    </div>
  );
}
