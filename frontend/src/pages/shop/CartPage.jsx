import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShoppingCart } from "lucide-react";
import { updateCartItem, removeFromCart } from "../../redux/slices/cartSlice";
import { formatPrice } from "../../utils/currency";
import { getImageUrl } from "../../utils/helpers";
import toast from "react-hot-toast";

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector(s => s.cart);
  const { currency, site } = useSelector(s => s.settings);
  const { isAuthenticated } = useSelector(s => s.auth);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = subtotal >= (site?.freeShippingThreshold || 5000) ? 0 : (site?.shippingFee || 350);
  const total = subtotal + shipping;

  if (!isAuthenticated) return (
    <div className="empty-state py-24">
      <ShoppingCart size={56} className="mx-auto mb-4" />
      <h2 className="text-xl font-bold text-[#1F2937] mb-2">Please sign in to view your cart</h2>
      <Link to="/login"><button className="btn btn-primary mt-4">Sign In</button></Link>
    </div>
  );

  if (items.length === 0) return (
    <div className="empty-state py-24">
      <ShoppingBag size={56} className="mx-auto mb-4" />
      <h2 className="text-xl font-bold text-[#1F2937] mb-2">Your cart is empty</h2>
      <p className="text-[#6B7280] mb-6">Looks like you haven't added anything yet</p>
      <Link to="/products"><button className="btn btn-primary">Start Shopping</button></Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-[#1F2937] mb-8">Shopping Cart <span className="text-[#6B7280] font-normal text-lg">({items.length} items)</span></h1>
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <div key={item._id} className="bg-white rounded-xl border border-[#F1F5F9] p-4 flex gap-4">
              <Link to={`/products/${item.product?._id || item.product}`}>
                <img src={getImageUrl(item.product?.images?.[0]?.url)} alt=""
                  className="w-20 h-20 rounded-xl object-cover border border-[#F1F5F9]" />
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.product?._id || item.product}`}>
                  <h3 className="font-semibold text-sm text-[#1F2937] hover:text-[#FF6A00] transition-colors mb-1 line-clamp-2">
                    {item.product?.name}
                  </h3>
                </Link>
                <p className="price-sm mb-3">{formatPrice(item.price, currency, site?.usdRate)}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 border border-[#E5E7EB] rounded-lg px-2 py-1">
                    <button onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity - 1 }))}
                      className="w-6 h-6 flex items-center justify-center text-[#6B7280] hover:text-[#FF6A00]"><Minus size={13} /></button>
                    <span className="w-6 text-center text-sm font-semibold text-[#1F2937]">{item.quantity}</span>
                    <button onClick={() => dispatch(updateCartItem({ itemId: item._id, quantity: item.quantity + 1 }))}
                      className="w-6 h-6 flex items-center justify-center text-[#6B7280] hover:text-[#FF6A00]"><Plus size={13} /></button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-[#1F2937]">{formatPrice(item.price * item.quantity, currency, site?.usdRate)}</span>
                    <button onClick={() => { dispatch(removeFromCart(item._id)); toast.success("Removed"); }}
                      className="text-red-400 hover:text-red-600 transition-colors p-1"><Trash2 size={15} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-white rounded-xl border border-[#F1F5F9] p-6 h-fit sticky top-20">
          <h2 className="font-bold text-[#1F2937] mb-5">Order Summary</h2>
          <div className="space-y-3 mb-5 text-sm">
            <div className="flex justify-between text-[#6B7280]">
              <span>Subtotal</span><span>{formatPrice(subtotal, currency, site?.usdRate)}</span>
            </div>
            <div className="flex justify-between text-[#6B7280]">
              <span>Shipping (est.)</span>
              <span>{shipping === 0 ? <span className="text-green-600 font-semibold">Free</span> : formatPrice(shipping, currency, site?.usdRate)}</span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-[#6B7280] bg-[#FFF4EC] rounded-lg p-2">
                Add {formatPrice((site?.freeShippingThreshold||5000)-subtotal, currency, site?.usdRate)} more for free shipping!
              </p>
            )}
            <div className="border-t border-[#F1F5F9] pt-3 flex justify-between font-bold text-[#1F2937]">
              <span>Estimated Total</span>
              <span style={{ color: "var(--primary)" }}>{formatPrice(total, currency, site?.usdRate)}</span>
            </div>
          </div>
          <button onClick={() => navigate("/checkout")} className="btn btn-primary w-full btn-lg">
            Checkout <ArrowRight size={17} />
          </button>
          <Link to="/products" className="block text-center mt-3 text-sm text-[#6B7280] hover:text-[#FF6A00] transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
