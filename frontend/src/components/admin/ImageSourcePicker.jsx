import { useState } from "react";
import { Link2, AlertCircle, Loader, Image } from "lucide-react";
import { pricingAPI } from "../../services/api";
import { getImageUrl } from "../../utils/helpers";

export default function ImageSourcePicker({ images = [], onChange, maxImages = 4 }) {
  const [mode, setMode] = useState("url");
  const [inputVal, setInputVal] = useState("");
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState("");
  const canAdd = images.length < maxImages;

  const addUrlImage = () => {
    const url = inputVal.trim();
    if (!url) return;
    if (!url.startsWith("http")) { setError("Please enter a valid URL starting with http"); return; }
    onChange([...images, { url, source: "url", isPrimary: images.length === 0 }]);
    setInputVal(""); setError("");
  };

  const addDriveImage = async () => {
    const url = inputVal.trim();
    if (!url) return;
    setValidating(true); setError("");
    try {
      const { data } = await pricingAPI.validateDriveLink(url);
      if (!data.data.valid) { setError(data.data.error); setValidating(false); return; }
      const { directUrl, fileId } = data.data;
      onChange([...images, { url: directUrl, source: "gdrive", driveId: fileId, isPrimary: images.length === 0 }]);
      setInputVal(""); setError("");
    } catch { setError("Failed to validate link."); }
    setValidating(false);
  };

  const removeImage = (i) => {
    const updated = images.filter((_, idx) => idx !== i);
    if (images[i].isPrimary && updated.length > 0) updated[0] = { ...updated[0], isPrimary: true };
    onChange(updated);
  };

  const setPrimary = (i) => onChange(images.map((img, idx) => ({ ...img, isPrimary: idx === i })));

  const handleKey = (e) => {
    if (e.key === "Enter") { e.preventDefault(); mode === "gdrive" ? addDriveImage() : addUrlImage(); }
  };

  return (
    <div>
      {/* Mode selector */}
      <div className="flex gap-2 mb-3">
        {[{ id: "url", icon: Link2, label: "Image URL" }, { id: "gdrive", icon: Image, label: "Google Drive" }].map(({ id, icon: Icon, label }) => (
          <button key={id} type="button" onClick={() => { setMode(id); setInputVal(""); setError(""); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={mode === id
              ? { backgroundColor: "var(--primary)", color: "white", border: "2px solid transparent" }
              : { backgroundColor: "#F8FAFC", color: "#6B7280", border: "2px solid #F1F5F9" }}>
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 mb-2">
        <input value={inputVal} onChange={e => { setInputVal(e.target.value); setError(""); }}
          onKeyDown={handleKey} disabled={!canAdd} className="input-field flex-1 text-sm"
          placeholder={mode === "gdrive" ? "Paste Google Drive share link..." : "https://example.com/image.jpg"} />
        <button type="button" onClick={mode === "gdrive" ? addDriveImage : addUrlImage}
          disabled={!canAdd || !inputVal.trim() || validating} className="btn-primary px-4 text-sm disabled:opacity-50">
          {validating ? <Loader size={14} className="animate-spin" /> : "+ Add"}
        </button>
      </div>

      {/* Google Drive instructions */}
      {mode === "gdrive" && (
        <div className="mb-3 p-3 rounded-xl text-xs" style={{ backgroundColor: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
          <p className="font-semibold mb-1" style={{ color: "#3B82F6" }}>How to share a Google Drive image:</p>
          <ol className="list-decimal list-inside space-y-0.5" style={{ color: "#6B7280" }}>
            <li>Open the image in Google Drive → Right-click → <strong>Share</strong></li>
            <li>Set access to <strong>"Anyone with the link"</strong></li>
            <li>Copy the link and paste above</li>
          </ol>
        </div>
      )}

      {error && <div className="flex items-center gap-2 mb-2 text-sm text-red-500"><AlertCircle size={13} /> {error}</div>}

      <p className="text-xs mb-3" style={{ color: "#6B7280" }}>
        {images.length}/{maxImages} images {!canAdd && "— remove one to add more"}
      </p>

      {/* Previews */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div key={i} className="relative group w-24 h-24">
              <img src={getImageUrl(img.url)} alt=""
                className="w-full h-full object-cover rounded-xl border-2 transition-all"
                style={{ borderColor: img.isPrimary ? "var(--primary)" : "#F1F5F9" }}
                onError={e => { e.target.src = "https://placehold.co/96x96?text=Error"; }} />
              {img.source === "gdrive" && (
                <span className="absolute bottom-1 left-1 text-xs px-1.5 py-0.5 rounded-md font-bold text-white bg-blue-500">GD</span>
              )}
              {img.isPrimary && (
                <span className="absolute top-1 left-1 text-xs px-1.5 py-0.5 rounded-md font-bold text-white"
                  style={{ backgroundColor: "var(--primary)" }}>★ Primary</span>
              )}
              <div className="absolute inset-0 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center gap-1.5">
                {!img.isPrimary && (
                  <button type="button" onClick={() => setPrimary(i)}
                    className="text-xs bg-white/90 text-gray-800 px-2 py-1 rounded-lg font-semibold">Set Primary</button>
                )}
                <button type="button" onClick={() => removeImage(i)}
                  className="text-xs bg-red-500 text-white px-2 py-1 rounded-lg font-semibold">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
