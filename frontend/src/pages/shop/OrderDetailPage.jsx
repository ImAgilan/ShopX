import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ordersAPI } from "../../services/api";
import { formatPrice } from "../../utils/currency";
import { useSelector } from "react-redux";
import { getOrderStatusColor, getImageUrl } from "../../utils/helpers";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { ChevronLeft } from "lucide-react";

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currency, site } = useSelector((s) => s.settings);

  useEffect(() => {
    ordersAPI.getOne(id).then(res => { setOrder(res.data.data); setLoading(false); }).catch(() => { setLoading(false); navigate("/orders"); });
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (!order) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <button onClick={() => navigate("/orders")} className="flex items-center gap-1 text-sm mb-6 hover:opacity-70" style={{ color: "#6B7280" }}>
        <ChevronLeft size={16} /> Back to Orders
      </button>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#1F2937" }}>Order #{order.orderNumber}</h1>
        <span className={`text-sm font-bold px-3 py-1.5 rounded-full ${getOrderStatusColor(order.orderStatus)}`}>
          {order.orderStatus}
        </span>
      </div>
      {/* Items */}
      <div className="bg-white rounded-xl border border-[#F1F5F9] shadow-sm p-5 mb-4">
        <h2 className="font-bold mb-4" style={{ color: "#1F2937" }}>Items</h2>
        <div className="space-y-3">
          {order.items?.map((item, i) => (
            <div key={i} className="flex gap-3 items-center">
              <img src={getImageUrl(item.image)} alt={item.name} className="w-14 h-14 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="font-medium text-sm" style={{ color: "#1F2937" }}>{item.name}</p>
                <p className="text-xs" style={{ color: "#6B7280" }}>Qty: {item.quantity}</p>
              </div>
              <span className="font-bold text-sm" style={{ color: "#1F2937" }}>
                {formatPrice(item.price * item.quantity, currency, site?.usdRate)}
              </span>
            </div>
          ))}
        </div>
        <div className="border-t mt-4 pt-3 space-y-2" style={{ borderColor: "#F1F5F9" }}>
          <div className="flex justify-between text-sm" style={{ color: "#6B7280" }}>
            <span>Subtotal</span><span>{formatPrice(order.itemsPrice, currency, site?.usdRate)}</span>
          </div>
          <div className="flex justify-between text-sm" style={{ color: "#6B7280" }}>
            <span>Shipping</span><span>{formatPrice(order.shippingPrice, currency, site?.usdRate)}</span>
          </div>
          <div className="flex justify-between font-bold" style={{ color: "#1F2937" }}>
            <span>Total</span><span style={{ color: "var(--primary)" }}>{formatPrice(order.totalPrice, currency, site?.usdRate)}</span>
          </div>
        </div>
      </div>
      {/* Address */}
      <div className="bg-white rounded-xl border border-[#F1F5F9] shadow-sm p-5">
        <h2 className="font-bold mb-3" style={{ color: "#1F2937" }}>Delivery Address</h2>
        <p className="text-sm" style={{ color: "#6B7280" }}>
          {order.shippingAddress?.fullName}<br/>
          {order.shippingAddress?.addressLine1}{order.shippingAddress?.addressLine2 && `, ${order.shippingAddress.addressLine2}`}<br/>
          {order.shippingAddress?.city}, {order.shippingAddress?.district}, {order.shippingAddress?.province}
          {order.shippingAddress?.postalCode && ` ${order.shippingAddress.postalCode}`}<br/>
          Sri Lanka · {order.shippingAddress?.phone}
        </p>
      </div>
    </div>
  );
}
