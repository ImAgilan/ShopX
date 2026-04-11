import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { settingsAPI } from "../../services/api";
import { updateLayoutConfig } from "../../redux/slices/settingsSlice";
import { Eye, EyeOff, ArrowUp, ArrowDown, Save, Layout, RotateCcw } from "lucide-react";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/common/LoadingSpinner";

const SECTION_ICONS = {
  hero: "🦸", categories: "🏷️", featured_products: "⭐", upcoming_products: "🔜",
  promotional_banner: "📣", footer: "🦶",
};
const SECTION_DESCRIPTIONS = {
  hero: "Main hero banner with CTA button and background image",
  categories: "Product category grid for easy browsing",
  featured_products: "Showcase handpicked featured products",
  upcoming_products: "Display upcoming/coming soon products",
  promotional_banner: "Full-width promotional banner with CTA",
  footer: "Site footer (always visible in layout)",
};

export default function AdminLayoutBuilder() {
  const dispatch = useDispatch();
  const { layout } = useSelector((s) => s.settings);
  const [sections, setSections] = useState([]);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (layout?.sections) {
      setSections([...layout.sections].sort((a, b) => a.order - b.order));
    }
  }, [layout]);

  const toggleSection = (id) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, isEnabled: !s.isEnabled } : s));
    setHasChanges(true);
  };

  const moveSection = (id, direction) => {
    setSections(prev => {
      const idx = prev.findIndex(s => s.id === id);
      if (direction === "up" && idx === 0) return prev;
      if (direction === "down" && idx === prev.length - 1) return prev;
      const newArr = [...prev];
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      [newArr[idx], newArr[swapIdx]] = [newArr[swapIdx], newArr[idx]];
      return newArr.map((s, i) => ({ ...s, order: i }));
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const ordered = sections.map((s, i) => ({ ...s, order: i }));
      await dispatch(updateLayoutConfig(ordered));
      toast.success("Layout saved! Homepage updated.");
      setHasChanges(false);
    } catch { toast.error("Save failed"); }
    setSaving(false);
  };

  const resetToDefault = async () => {
    if (!confirm("Reset layout to default order?")) return;
    try {
      const res = await settingsAPI.getLayout();
      setSections([...res.data.data.sections].sort((a, b) => a.order - b.order));
      setHasChanges(false);
      toast.success("Reset to default");
    } catch { toast.error("Reset failed"); }
  };

  if (!sections.length) return <LoadingSpinner />;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Layout size={24} style={{ color: "var(--primary)" }} />
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#1F2937" }}>Layout Builder</h1>
            <p className="text-sm" style={{ color: "#6B7280" }}>Drag to reorder homepage sections</p>
          </div>
        </div>
        <div className="flex gap-3">
          {hasChanges && (
            <button onClick={resetToDefault} className="btn-outline text-sm px-4 py-2">
              <RotateCcw size={14} /> Reset
            </button>
          )}
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
            <Save size={15} /> {saving ? "Saving..." : "Save Layout"}
          </button>
        </div>
      </div>

      {hasChanges && (
        <div className="bg-white rounded-xl border border-[#F1F5F9] shadow-sm p-3 mb-4 border-l-4 text-sm font-medium animate-fade-in"
          style={{ borderLeftColor: "#F59E0B", color: "#1F2937", backgroundColor: "#F8FAFC" }}>
          ⚠️ You have unsaved changes. Click "Save Layout" to apply.
        </div>
      )}

      {/* Preview strip */}
      <div className="bg-white rounded-xl border border-[#F1F5F9] shadow-sm p-4 mb-5" style={{ backgroundColor: "#F8FAFC" }}>
        <p className="text-xs font-semibold mb-3" style={{ color: "#6B7280" }}>CURRENT HOMEPAGE ORDER</p>
        <div className="flex flex-wrap gap-2">
          {sections.filter(s => s.isEnabled).map((s, i) => (
            <div key={s.id} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full text-white"
              style={{ backgroundColor: "var(--primary)" }}>
              <span>{i + 1}.</span>
              <span>{SECTION_ICONS[s.id]}</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {sections.map((section, idx) => (
          <div key={section.id}
            className={`card p-4 transition-all duration-200 ${section.isEnabled ? "" : "opacity-60"}`}
            style={{ borderLeft: `4px solid ${section.isEnabled ? "var(--primary)" : "#F1F5F9"}` }}>
            <div className="flex items-center gap-4">
              {/* Order Handle & Move */}
              <div className="flex flex-col gap-1">
                <button onClick={() => moveSection(section.id, "up")} disabled={idx === 0}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-20 transition-all"
                  style={{ color: "#6B7280" }}>
                  <ArrowUp size={12} />
                </button>
                <button onClick={() => moveSection(section.id, "down")} disabled={idx === sections.length - 1}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-20 transition-all"
                  style={{ color: "#6B7280" }}>
                  <ArrowDown size={12} />
                </button>
              </div>

              {/* Order Badge */}
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black text-white shrink-0"
                style={{ backgroundColor: section.isEnabled ? "#1F2937" : "#F1F5F9" }}>
                {idx + 1}
              </div>

              {/* Icon */}
              <span className="text-2xl">{SECTION_ICONS[section.id] || "📄"}</span>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: "#1F2937" }}>{section.label}</p>
                <p className="text-xs" style={{ color: "#6B7280" }}>{SECTION_DESCRIPTIONS[section.id] || ""}</p>
              </div>

              {/* Toggle */}
              <button onClick={() => toggleSection(section.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${section.isEnabled ? "text-green-700 bg-green-100 hover:bg-green-200" : "text-gray-500 bg-gray-100 hover:bg-gray-200"}`}>
                {section.isEnabled ? <><Eye size={12} /> Visible</> : <><EyeOff size={12} /> Hidden</>}
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-center mt-6" style={{ color: "#6B7280" }}>
        Changes are applied to the live homepage immediately after saving.
      </p>
    </div>
  );
}
