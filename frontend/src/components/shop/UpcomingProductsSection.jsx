import { useState, useEffect } from "react";
import { productsAPI } from "../../services/api";
import { getImageUrl, truncate } from "../../utils/helpers";
import { Clock, Bell } from "lucide-react";
import { formatPrice } from "../../utils/currency";
import { useSelector } from "react-redux";

export default function UpcomingProductsSection() {
  const [products, setProducts] = useState([]);
  const { currency, site } = useSelector((s) => s.settings);

  useEffect(() => {
    productsAPI.getAll({ upcoming: true, limit: 4 })
      .then(res => setProducts(res.data.data))
      .catch(() => {});
  }, []);

  if (products.length === 0) return null;

  return (
    <section className="py-16 max-w-7xl mx-auto px-4">
      <div className="text-center mb-10">
        <h2 className="section-title">Coming Soon</h2>
        <p className="section-subtitle">Exciting new products launching soon — be the first to know</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product._id} className="card overflow-hidden group">
            <div className="relative aspect-square overflow-hidden bg-gray-50">
              <img src={getImageUrl(product.images?.[0]?.url)} alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <span className="text-white font-bold text-sm px-4 py-2 rounded-full border-2 border-white/50 backdrop-blur-sm">
                  Coming Soon
                </span>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-sm mb-2" style={{ color: "#1F2937" }}>{truncate(product.name, 50)}</h3>
              <p className="price-tag">{formatPrice(product.price, currency, site?.usdRate)}</p>
              {product.upcomingDate && (
                <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: "#6B7280" }}>
                  <Clock size={12} />
                  <span>Available {new Date(product.upcomingDate).toLocaleDateString("en-LK")}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
