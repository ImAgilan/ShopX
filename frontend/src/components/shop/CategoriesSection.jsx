import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { productsAPI } from "../../services/api";
import { getImageUrl } from "../../utils/helpers";
import LoadingSpinner from "../common/LoadingSpinner";

export default function CategoriesSection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsAPI.getCategories().then(res => { setCategories(res.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <section className="py-16 max-w-7xl mx-auto px-4">
      <div className="text-center mb-10">
        <h2 className="section-title">Shop by Category</h2>
        <p className="section-subtitle">Explore our wide range of product categories</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <Link key={cat._id} to={`/products?category=${cat._id}`}
            className="group flex flex-col items-center gap-3 p-6 rounded-2xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            style={{ backgroundColor: "#F8FAFC", border: "1px solid #F1F5F9" }}>
            <div className="w-16 h-16 rounded-2xl overflow-hidden">
              <img src={getImageUrl(cat.image)} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="font-semibold text-sm text-center" style={{ color: "#1F2937" }}>{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
