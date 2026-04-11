import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { ordersAPI } from "../../services/api";
import { formatPrice } from "../../utils/currency";
import { useSelector } from "react-redux";
import { getOrderStatusColor } from "../../utils/helpers";

export default function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const { currency, site } = useSelector((s) => s.settings);

  useEffect(() => {
    ordersAPI.getOne(id).then(res => setOrder(res.data.data)).catch(() => {});
  }, [id]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-fade-in"
        style={{ backgroundColor: "rgba(34,197,94,0.1)" }}>
        <CheckCircle size={40} className="text-green-500" />
      </div>
      <h1 className="text-3xl font-black mb-3" style={{ color: "#1F2937" }}>Order Confirmed!</h1>
      <p className="text-lg mb-2" style={{ color: "#6B7280" }}>Thank you for your purchase.</p>
      {order && (
        <>
          <p className="text-sm mb-8" style={{ color: "#6B7280" }}>
            Order <span className="font-bold" style={{ color: "#1F2937" }}>#{order.orderNumber}</span>
          </p>
          <div className="bg-white rounded-xl border border-[#F1F5F9] shadow-sm p-6 text-left mb-6">
            <h3 className="font-bold mb-3" style={{ color: "#1F2937" }}>Order Details</h3>
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: "#6B7280" }}>Status</span>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${getOrderStatusColor(order.orderStatus)}`}>
                {order.orderStatus}
              </span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: "#6B7280" }}>Payment</span>
              <span className="font-semibold capitalize" style={{ color: "#1F2937" }}>{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "#6B7280" }}>Total</span>
              <span className="font-bold" style={{ color: "var(--primary)" }}>{formatPrice(order.totalPrice, currency, site?.usdRate)}</span>
            </div>
          </div>
        </>
      )}
      <div className="flex gap-4 justify-center">
        <Link to="/orders"><button className="btn-outline">My Orders</button></Link>
        <Link to="/products"><button className="btn-primary">Continue Shopping <ArrowRight size={16} /></button></Link>
      </div>
    </div>
  );
}
