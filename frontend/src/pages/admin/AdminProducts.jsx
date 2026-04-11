import { useState, useEffect, useRef } from "react";
import { productsAPI } from "../../services/api";
import { formatPrice } from "../../utils/currency";
import { useSelector } from "react-redux";
import { Plus, Edit, Trash2, Search, X, Star } from "lucide-react";
import { getImageUrl, truncate } from "../../utils/helpers";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import toast from "react-hot-toast";
import ImageSourcePicker from "../../components/admin/ImageSourcePicker";

const emptyProduct = {
  name:"", description:"", price:"", comparePrice:"", category:"",
  stock:"", brand:"", sku:"", isFeatured:false, isUpcoming:false,
  tags:"", images:[], video:{ url:"" },
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const { currency, site } = useSelector((s) => s.settings);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (search) params.search = search;
      const res = await productsAPI.getAll(params);
      setProducts(res.data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    productsAPI.getCategories().then(res => setCategories(res.data.data)).catch(() => {});
    loadProducts();
  }, []);

  useEffect(() => { const t = setTimeout(loadProducts, 400); return () => clearTimeout(t); }, [search]);

  const openNew = () => { setForm(emptyProduct); setEditProduct(null); setShowForm(true); };
  const openEdit = (p) => {
    setForm({ ...p, category: p.category?._id || p.category, tags: p.tags?.join(", ") || "", video: p.video || { url:"" } });
    setEditProduct(p._id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.category || !form.stock) { toast.error("Fill required fields"); return; }
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), comparePrice: Number(form.comparePrice || 0),
        stock: Number(form.stock), tags: form.tags ? form.tags.split(",").map(t => t.trim()) : [] };
      if (editProduct) await productsAPI.update(editProduct, payload);
      else await productsAPI.create(payload);
      toast.success(editProduct ? "Product updated!" : "Product created!");
      setShowForm(false); loadProducts();
    } catch (err) { toast.error(err.response?.data?.message || "Error saving product"); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    await productsAPI.delete(id);
    toast.success("Product deleted");
    loadProducts();
  };



  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#1F2937" }}>Products</h1>
        <button onClick={openNew} className="btn-primary text-sm"><Plus size={16} /> Add Product</button>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6B7280" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="input-field pl-9" />
      </div>

      {/* Table */}
      {loading ? <LoadingSpinner /> : (
        <div className="bg-white rounded-xl border border-[#F1F5F9] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
                <tr>
                  {["Product","Category","Price","Stock","Featured","Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wide" style={{ color: "#6B7280" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id} style={{ borderBottom: "1px solid #F1F5F9" }} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={getImageUrl(p.images?.[0]?.url)} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="font-medium" style={{ color: "#1F2937" }}>{truncate(p.name, 40)}</p>
                          <p className="text-xs" style={{ color: "#6B7280" }}>SKU: {p.sku || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ color: "#6B7280" }}>{p.category?.name || "—"}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: "var(--primary)" }}>{formatPrice(p.price, currency, site?.usdRate)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.stock > 10 ? "bg-green-100 text-green-700" : p.stock > 0 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {p.isFeatured && <Star size={14} className="text-yellow-400 fill-yellow-400" />}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(p._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && (
              <div className="text-center py-10" style={{ color: "#6B7280" }}>No products found</div>
            )}
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center z-50 overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-xl border border-[#F1F5F9] shadow-sm p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: "#1F2937" }}>{editProduct ? "Edit Product" : "Add Product"}</h2>
              <button onClick={() => setShowForm(false)} style={{ color: "#6B7280" }}><X size={20} /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1" style={{ color: "#1F2937" }}>Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1" style={{ color: "#1F2937" }}>Description *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="input-field resize-none" />
              </div>
              {[["price","Price (Rs.) *",1],["comparePrice","Compare Price",1],["stock","Stock *",1],["brand","Brand",1],["sku","SKU",1],].map(([key,label]) => (
                <div key={key}>
                  <label className="block text-sm font-medium mb-1" style={{ color: "#1F2937" }}>{label}</label>
                  <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="input-field" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: "#1F2937" }}>Category *</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field">
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1" style={{ color: "#1F2937" }}>Tags (comma separated)</label>
                <input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} className="input-field" placeholder="electronics, gadget, new" />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2" style={{ color: "#1F2937" }}>Images (up to 4)</label>
                <ImageSourcePicker
                  images={form.images || []}
                  onChange={(imgs) => setForm(f => ({ ...f, images: imgs }))}
                  maxImages={4}
                />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-1" style={{ color: "#1F2937" }}>Video URL (optional)</label>
                <input value={form.video?.url || ""} onChange={e => setForm(f => ({ ...f, video: { url: e.target.value } }))} className="input-field" placeholder="https://..." />
              </div>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="w-4 h-4 rounded" style={{ accentColor: "var(--primary)" }} />
                  <span className="text-sm font-medium" style={{ color: "#1F2937" }}>Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isUpcoming} onChange={e => setForm(f => ({ ...f, isUpcoming: e.target.checked }))} className="w-4 h-4 rounded" style={{ accentColor: "var(--primary)" }} />
                  <span className="text-sm font-medium" style={{ color: "#1F2937" }}>Upcoming</span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="btn-outline px-5 py-2.5 text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
                {saving ? "Saving..." : editProduct ? "Update Product" : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
