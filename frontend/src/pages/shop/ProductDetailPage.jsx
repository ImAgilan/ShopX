import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ShoppingCart, Heart, Share2, ChevronLeft, ChevronRight, Play, Star, Send } from "lucide-react";
import { productsAPI } from "../../services/api";
import { addToCart } from "../../redux/slices/cartSlice";
import { formatPrice } from "../../utils/currency";
import { getImageUrl } from "../../utils/helpers";
import StarRating from "../../components/common/StarRating";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((s) => s.auth);
  const { currency, site } = useSelector((s) => s.settings);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [showVideo, setShowVideo] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    productsAPI.getOne(id).then(res => { setProduct(res.data.data); setLoading(false); }).catch(() => { setLoading(false); navigate("/products"); });
  }, [id]);

  if (loading) return <LoadingSpinner fullPage />;
  if (!product) return null;

  const primaryImage = product.images?.find(i => i.isPrimary)?.url || product.images?.[0]?.url;
  const discount = product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100) : 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error("Please login to add to cart"); navigate("/login"); return; }
    setAddingToCart(true);
    const result = await dispatch(addToCart({ productId: product._id, quantity: qty }));
    setAddingToCart(false);
    if (addToCart.fulfilled.match(result)) toast.success("Added to cart! 🛒");
    else toast.error(result.payload || "Failed");
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error("Login to review"); return; }
    setSubmittingReview(true);
    try {
      await productsAPI.addReview(product._id, reviewForm);
      const res = await productsAPI.getOne(id);
      setProduct(res.data.data);
      setReviewForm({ rating: 5, comment: "" });
      toast.success("Review submitted!");
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
    setSubmittingReview(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm mb-6 hover:opacity-70 transition-opacity" style={{ color: "#6B7280" }}>
        <ChevronLeft size={16} /> Back
      </button>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Images */}
        <div>
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-4">
            {showVideo && product.video?.url ? (
              <video src={product.video.url} controls autoPlay className="w-full h-full object-contain" />
            ) : (
              <img src={getImageUrl(product.images?.[activeImg]?.url || primaryImage)} alt={product.name} className="w-full h-full object-cover" />
            )}
            {discount > 0 && <span className="absolute top-4 left-4 badge-primary text-sm">-{discount}%</span>}
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {product.images?.map((img, i) => (
              <button key={i} onClick={() => { setActiveImg(i); setShowVideo(false); }}
                className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${activeImg === i && !showVideo ? "border-primary shadow-md" : "border-transparent"}`}
                style={activeImg === i && !showVideo ? { borderColor: "var(--primary)" } : {}}>
                <img src={getImageUrl(img.url)} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
            {product.video?.url && (
              <button onClick={() => setShowVideo(true)}
                className={`w-20 h-20 rounded-xl overflow-hidden shrink-0 border-2 flex items-center justify-center bg-gray-900 ${showVideo ? "border-primary" : "border-transparent"}`}
                style={showVideo ? { borderColor: "var(--primary)" } : {}}>
                <Play size={24} className="text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-sm mb-2" style={{ color: "var(--primary)" }}>{product.category?.name}</p>
          <h1 className="text-3xl font-bold mb-3 leading-tight" style={{ color: "#1F2937" }}>{product.name}</h1>
          <div className="flex items-center gap-3 mb-4">
            <StarRating rating={product.rating} numReviews={product.numReviews} size="md" />
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-black" style={{ color: "var(--primary)" }}>
              {formatPrice(product.price, currency, site?.usdRate)}
            </span>
            {discount > 0 && <span className="price-compare text-lg">{formatPrice(product.comparePrice, currency, site?.usdRate)}</span>}
          </div>

          <p className="text-sm leading-relaxed mb-6" style={{ color: "#6B7280" }}>{product.description}</p>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? "bg-green-500" : "bg-red-500"}`} />
            <span className="text-sm font-medium" style={{ color: "#1F2937" }}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
            </span>
          </div>

          {/* Qty + Cart */}
          {!product.isUpcoming && product.stock > 0 && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-3 border rounded-xl px-4 py-2" style={{ borderColor: "#F1F5F9" }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-6 h-6 flex items-center justify-center font-bold text-lg" style={{ color: "#1F2937" }}>−</button>
                <span className="w-8 text-center font-semibold" style={{ color: "#1F2937" }}>{qty}</span>
                <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-6 h-6 flex items-center justify-center font-bold text-lg" style={{ color: "#1F2937" }}>+</button>
              </div>
              <button onClick={handleAddToCart} disabled={addingToCart} className="btn-primary flex-1">
                <ShoppingCart size={18} />
                {addingToCart ? "Adding..." : "Add to Cart"}
              </button>
            </div>
          )}

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {product.tags.map(tag => (
                <span key={tag} className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "#F8FAFC", color: "#6B7280", border: "1px solid #F1F5F9" }}>#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6" style={{ color: "#1F2937" }}>Customer Reviews ({product.numReviews})</h2>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Review List */}
          <div className="lg:col-span-2 space-y-4">
            {product.reviews?.length === 0 ? (
              <p style={{ color: "#6B7280" }}>No reviews yet. Be the first!</p>
            ) : product.reviews?.map((review) => (
              <div key={review._id} className="bg-white rounded-xl border border-[#F1F5F9] shadow-sm p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#1F2937" }}>{review.name}</p>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                  <span className="text-xs" style={{ color: "#6B7280" }}>
                    {new Date(review.createdAt).toLocaleDateString("en-LK")}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "#6B7280" }}>{review.comment}</p>
              </div>
            ))}
          </div>

          {/* Review Form */}
          {isAuthenticated && (
            <div className="bg-white rounded-xl border border-[#F1F5F9] shadow-sm p-6">
              <h3 className="font-bold mb-4" style={{ color: "#1F2937" }}>Write a Review</h3>
              <form onSubmit={handleReview} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: "#1F2937" }}>Rating</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map(s => (
                      <button type="button" key={s} onClick={() => setReviewForm(f => ({ ...f, rating: s }))}>
                        <Star size={24} fill={s <= reviewForm.rating ? "#FBBF24" : "none"} className={s <= reviewForm.rating ? "text-yellow-400" : "text-gray-300"} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block" style={{ color: "#1F2937" }}>Your Review</label>
                  <textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                    required rows={4} placeholder="Share your experience..." className="input-field resize-none" />
                </div>
                <button type="submit" disabled={submittingReview} className="btn-primary w-full">
                  <Send size={16} /> {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
