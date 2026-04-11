import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { productsAPI } from "../../services/api";
import ProductCard from "../../components/common/ProductCard";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Search, Filter, ChevronDown, SlidersHorizontal } from "lucide-react";
import { debounce } from "../../utils/helpers";

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    sort: searchParams.get("sort") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    page: 1,
  });

  useEffect(() => {
    productsAPI.getCategories().then(res => setCategories(res.data.data)).catch(() => {});
  }, []);

  const loadProducts = useCallback(async (f) => {
    setLoading(true);
    try {
      const params = {};
      if (f.search) params.search = f.search;
      if (f.category) params.category = f.category;
      if (f.sort) params.sort = f.sort;
      if (f.minPrice) params.minPrice = f.minPrice;
      if (f.maxPrice) params.maxPrice = f.maxPrice;
      params.page = f.page;
      params.limit = 12;
      const { data } = await productsAPI.getAll(params);
      setProducts(data.data);
      setPagination(data.pagination);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadProducts(filters); }, [filters]);

  const debouncedSearch = useCallback(debounce((val) => setFilters(f => ({ ...f, search: val, page: 1 })), 400), []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold" style={{ color: "#1F2937" }}>All Products</h1>
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6B7280" }} />
            <input
              defaultValue={filters.search}
              onChange={e => debouncedSearch(e.target.value)}
              placeholder="Search products..."
              className="input-field pl-9" />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border font-medium text-sm transition-all"
            style={{ borderColor: "#F1F5F9", color: "#1F2937" }}>
            <SlidersHorizontal size={16} /> Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-[#F1F5F9] shadow-sm p-5 mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: "#1F2937" }}>Category</label>
            <select value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value, page: 1 }))} className="input-field">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: "#1F2937" }}>Sort By</label>
            <select value={filters.sort} onChange={e => setFilters(f => ({ ...f, sort: e.target.value, page: 1 }))} className="input-field">
              <option value="">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: "#1F2937" }}>Min Price (Rs.)</label>
            <input type="number" value={filters.minPrice}
              onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value, page: 1 }))}
              placeholder="0" className="input-field" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block" style={{ color: "#1F2937" }}>Max Price (Rs.)</label>
            <input type="number" value={filters.maxPrice}
              onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value, page: 1 }))}
              placeholder="Any" className="input-field" />
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? <LoadingSpinner /> : products.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🔍</p>
          <h3 className="text-xl font-bold mb-2" style={{ color: "#1F2937" }}>No products found</h3>
          <p style={{ color: "#6B7280" }}>Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <p className="text-sm mb-4" style={{ color: "#6B7280" }}>
            Showing {products.length} of {pagination.total} products
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p, i) => (
              <div key={p._id} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.04}s` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                <button key={page} onClick={() => setFilters(f => ({ ...f, page }))}
                  className={`w-10 h-10 rounded-xl font-semibold text-sm transition-all ${filters.page === page ? "text-white" : "border"}`}
                  style={filters.page === page ? { backgroundColor: "var(--primary)" } : { borderColor: "#F1F5F9", color: "#1F2937" }}>
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
