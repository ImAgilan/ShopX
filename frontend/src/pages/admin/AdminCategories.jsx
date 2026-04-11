import { useState, useEffect } from "react";
import { productsAPI } from "../../services/api";
import { Plus, Edit, Trash2, X } from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import toast from "react-hot-toast";
import ImageSourcePicker from "../../components/admin/ImageSourcePicker";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", image: "", sortOrder: 0 });
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    try { const res = await productsAPI.getCategories(); setCategories(res.data.data); }
    finally { setLoading(false); }
  };
  useEffect(() => { loadCategories(); }, []);

  const openNew = () => { setForm({ name:"", description:"", image:"", sortOrder:0 }); setEditCat(null); setShowForm(true); };
  const openEdit = (c) => { setForm({ name:c.name, description:c.description||"", image:c.image||"", sortOrder:c.sortOrder||0 }); setEditCat(c._id); setShowForm(true); };

  const handleSave = async () => {
    if (!form.name) { toast.error("Name required"); return; }
    setSaving(true);
    try {
      if (editCat) await productsAPI.updateCategory(editCat, form);
      else await productsAPI.createCategory(form);
      toast.success(editCat ? "Category updated!" : "Category created!");
      setShowForm(false); loadCategories();
    } catch (err) { toast.error(err.response?.data?.message || "Error"); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this category?")) return;
    await productsAPI.deleteCategory(id);
    toast.success("Deleted"); loadCategories();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#1F2937" }}>Categories</h1>
        <button onClick={openNew} className="btn-primary text-sm"><Plus size={16} /> Add Category</button>
      </div>
      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(cat => (
            <div key={cat._id} className="bg-white rounded-xl border border-[#F1F5F9] shadow-sm p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                {cat.image ? <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" /> : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🏷️</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold" style={{ color: "#1F2937" }}>{cat.name}</p>
                {cat.description && <p className="text-xs truncate" style={{ color: "#6B7280" }}>{cat.description}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500"><Edit size={14} /></button>
                <button onClick={() => handleDelete(cat._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#F1F5F9] shadow-sm p-6 w-full max-w-md">
            <div className="flex justify-between mb-5">
              <h2 className="text-xl font-bold" style={{ color: "#1F2937" }}>{editCat ? "Edit" : "Add"} Category</h2>
              <button onClick={() => setShowForm(false)} style={{ color: "#6B7280" }}><X size={20} /></button>
            </div>
            <div className="space-y-4">
              {[["name","Name *","text"],["description","Description","text"]].map(([key,label,type]) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#1F2937" }}>{label}</label>
                  <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="input-field" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>Category Image</label>
                <ImageSourcePicker
                  images={form.image ? [{ url: form.image, source: "url", isPrimary: true }] : []}
                  onChange={(imgs) => setForm(f => ({ ...f, image: imgs[0]?.url || "" }))}
                  maxImages={1}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#1F2937" }}>Sort Order</label>
                <input type="number" value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))} className="input-field" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="btn-outline text-sm px-4 py-2">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">{saving ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
