import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchMe } from "../../redux/slices/authSlice";
import { authAPI } from "../../services/api";
import { User, MapPin, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "", avatar: user?.avatar || "" });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try { await authAPI.updateProfile(form); dispatch(fetchMe()); toast.success("Profile updated!"); }
    catch { toast.error("Update failed"); }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8" style={{ color: "#1F2937" }}>My Profile</h1>
      <div className="bg-white rounded-xl border border-[#F1F5F9] shadow-sm p-6 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white"
            style={{ backgroundColor: "var(--primary)" }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-lg" style={{ color: "#1F2937" }}>{user?.name}</p>
            <p className="text-sm capitalize" style={{ color: "#6B7280" }}>{user?.role?.replace("_"," ")}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[["name","Full Name"],["phone","Phone"]].map(([key, label]) => (
            <div key={key} className={key === "name" ? "col-span-2" : ""}>
              <label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>{label}</label>
              <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="input-field" />
            </div>
          ))}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>Email</label>
            <input value={user?.email} disabled className="input-field opacity-60" />
          </div>
        </div>
        <button onClick={handleSave} disabled={loading} className="btn-primary mt-5">
          <Save size={16} /> {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
