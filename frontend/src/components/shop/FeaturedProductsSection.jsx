import { useState, useEffect } from "react";
import { productsAPI } from "../../services/api";
import ProductCard from "../common/ProductCard";
import LoadingSpinner from "../common/LoadingSpinner";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function FeaturedProductsSection() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsAPI.getAll({ featured: true, limit: 8 })
      .then(res => { setProducts(res.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section className="py-16" style={{ backgroundColor: "#F8FAFC" }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="section-title">Featured Products</h2>
            <p className="section-subtitle mb-0">Handpicked best sellers just for you</p>
          </div>
          <Link to="/products?featured=true" className="flex items-center gap-1 text-sm font-semibold transition-opacity hover:opacity-70"
            style={{ color: "var(--primary)" }}>
            View All <ArrowRight size={16} />
          </Link>
        </div>
        {loading ? <LoadingSpinner /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product, i) => (
              <div key={product._id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
