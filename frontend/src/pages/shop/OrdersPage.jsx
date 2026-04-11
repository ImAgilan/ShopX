import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ordersAPI } from "../../services/api";
import { formatPrice } from "../../utils/currency";
import { useSelector } from "react-redux";
import { getOrderStatusColor } from "../../utils/helpers";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Package } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currency, site } = useSelector((s) => s.settings);

  useEffect(() => {
    ordersAPI.getMy().then(res => { setOrders(res.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8" style={{ color: "#1F2937" }}>My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Package size={64} className="mx-auto mb-4 opacity-30" style={{ color: "#1F2937" }} />
          <h3 className="text-xl font-bold mb-2" style={{ color: "#1F2937" }}>No orders yet</h3>
          <Link to="/products"><button className="btn-primary mt-4">Start Shopping</button></Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Link key={order._id} to={`/orders/${order._id}`} className="card card-hover p-5 block">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold" style={{ color: "#1F2937" }}>#{order.orderNumber}</p>
                  <p className="text-xs mt-1" style={{ color: "#6B7280" }}>
                    {new Date(order.createdAt).toLocaleDateString("en-LK")} · {order.items?.length} item(s)
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${getOrderStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                  <span className="font-bold" style={{ color: "var(--primary)" }}>
                    {formatPrice(order.totalPrice, currency, site?.usdRate)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
