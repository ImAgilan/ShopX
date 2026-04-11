import { Link } from "react-router-dom";
import { ShoppingCart, Star } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../../redux/slices/cartSlice";
import { formatPrice } from "../../utils/currency";
import { getImageUrl, truncate } from "../../utils/helpers";
import toast from "react-hot-toast";

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(s => s.auth);
  const { currency, site } = useSelector(s => s.settings);
  const primaryImg = product.images?.find(i => i.isPrimary)?.url || product.images?.[0]?.url;
  const discount = product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;

  const handleCart = async e => {
    e.preventDefault(); e.stopPropagation();
    if (!isAuthenticated) { toast.error("Please sign in to add to cart"); return; }
    const r = await dispatch(addToCart({ productId: product._id, quantity: 1 }));
    if (addToCart.fulfilled.match(r)) toast.success("Added to cart!");
    else toast.error(r.payload || "Failed");
  };

  return (
    <Link to={`/products/${product._id}`}
      className="group block bg-white rounded-xl border border-[#F1F5F9] overflow-hidden transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-[#FFD2B3]">

      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-[#F8FAFC] img-zoom">
        <img src={getImageUrl(primaryImg)} alt={product.name}
          className="w-full h-full object-cover" />
        {/* Badges */}
        {discount > 0 && !product.isUpcoming && (
          <span className="absolute top-3 left-3 badge badge-primary text-xs">-{discount}%</span>
        )}
        {product.isUpcoming && (
          <span className="absolute top-3 left-3 badge bg-[#1F2937] text-white text-xs">Coming Soon</span>
        )}
        {product.stock === 0 && !product.isUpcoming && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-sm">
            <span className="badge bg-[#1F2937] text-white text-xs px-3 py-1.5">Out of Stock</span>
          </div>
        )}
        {/* Cart button — appears on hover */}
        {!product.isUpcoming && product.stock > 0 && (
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
            <button onClick={handleCart}
              className="w-9 h-9 rounded-lg bg-white shadow-md flex items-center justify-center hover:bg-[#FF6A00] hover:text-white transition-all duration-150 text-[#FF6A00]">
              <ShoppingCart size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-[#6B7280] mb-1">{product.category?.name || ""}</p>
        <h3 className="text-sm font-semibold text-[#1F2937] leading-snug mb-2 line-clamp-2">
          {truncate(product.name, 65)}
        </h3>
        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-2.5">
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={11} fill={s <= Math.round(product.rating) ? "#F59E0B" : "none"}
                  className={s <= Math.round(product.rating) ? "text-amber-400" : "text-gray-200"} />
              ))}
            </div>
            <span className="text-xs text-[#6B7280]">({product.numReviews})</span>
          </div>
        )}
        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="price-sm">{formatPrice(product.price, currency, site?.usdRate)}</span>
          {discount > 0 && <span className="price-compare">{formatPrice(product.comparePrice, currency, site?.usdRate)}</span>}
        </div>
      </div>
    </Link>
  );
}
