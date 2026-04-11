import { useState, useEffect } from "react";
import { ordersAPI } from "../../services/api";
import { formatPrice } from "../../utils/currency";
import { useSelector } from "react-redux";
import { getOrderStatusColor } from "../../utils/helpers";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { ChevronDown, Search, X } from "lucide-react";
import toast from "react-hot-toast";

const STATUSES = ["pending","paid","processing","shipped","delivered","cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const { currency, site } = useSelector((s) => s.settings);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await ordersAPI.getAll(params);
      setOrders(res.data.data);
      setPagination(res.data.pagination);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadOrders(); }, [page, statusFilter, search]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      toast.success("Status updated");
      loadOrders();
      if (selectedOrder?._id === orderId) {
        const res = await ordersAPI.getAll({ limit: 1 });
        setSelectedOrder(null);
      }
    } catch { toast.error("Update failed"); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#1F2937" }}>Orders</h1>
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6B7280" }} />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search order #..." className="input-field pl-8 text-sm" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="input-field text-sm w-auto">
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white rounded-xl border border-[#F1F5F9] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
                <tr>
                  {["Order #","Customer","Items","Total","Payment","Status","Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "#6B7280" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} style={{ borderBottom: "1px solid #F1F5F9" }} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium" style={{ color: "#1F2937" }}>#{order.orderNumber}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-xs" style={{ color: "#1F2937" }}>{order.user?.name}</p>
                      <p className="text-xs" style={{ color: "#6B7280" }}>{order.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#6B7280" }}>{order.items?.length} item(s)</td>
                    <td className="px-4 py-3 font-bold text-xs" style={{ color: "var(--primary)" }}>{formatPrice(order.totalPrice, currency, site?.usdRate)}</td>
                    <td className="px-4 py-3 text-xs uppercase" style={{ color: "#6B7280" }}>{order.paymentMethod}</td>
                    <td className="px-4 py-3">
                      <select value={order.orderStatus} onChange={e => handleStatusUpdate(order._id, e.target.value)}
                        className={`text-xs font-bold px-2 py-1 rounded-full border-0 ${getOrderStatusColor(order.orderStatus)} cursor-pointer`}
                        style={{ outline: "none" }}>
                        {STATUSES.map(s => <option key={s} value={s} className="text-gray-800 bg-white capitalize">{s}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelectedOrder(order)}
                        className="text-xs font-semibold hover:opacity-70 transition-opacity" style={{ color: "var(--primary)" }}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <div className="text-center py-10" style={{ color: "#6B7280" }}>No orders found</div>}
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-5">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className="w-8 h-8 rounded-lg text-xs font-semibold transition-all"
              style={page === p ? { backgroundColor: "var(--primary)", color: "white" } : { border: "1px solid #F1F5F9", color: "#1F2937" }}>
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl border border-[#F1F5F9] shadow-sm p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h2 className="font-bold text-lg" style={{ color: "#1F2937" }}>Order #{selectedOrder.orderNumber}</h2>
              <button onClick={() => setSelectedOrder(null)} style={{ color: "#6B7280" }}><X size={18} /></button>
            </div>
            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between"><span style={{ color: "#6B7280" }}>Customer</span><span style={{ color: "#1F2937" }}>{selectedOrder.user?.name}</span></div>
              <div className="flex justify-between"><span style={{ color: "#6B7280" }}>Payment</span><span className="uppercase" style={{ color: "#1F2937" }}>{selectedOrder.paymentMethod}</span></div>
              <div className="flex justify-between"><span style={{ color: "#6B7280" }}>Status</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${getOrderStatusColor(selectedOrder.orderStatus)}`}>{selectedOrder.orderStatus}</span>
              </div>
            </div>
            <h3 className="font-semibold mb-2 text-sm" style={{ color: "#1F2937" }}>Items</h3>
            <div className="space-y-2 mb-4">
              {selectedOrder.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-xs" style={{ color: "#6B7280" }}>
                  <span>{item.name} × {item.quantity}</span>
                  <span>{formatPrice(item.price * item.quantity, currency, site?.usdRate)}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-3 flex justify-between font-bold" style={{ borderColor: "#F1F5F9" }}>
              <span style={{ color: "#1F2937" }}>Total</span>
              <span style={{ color: "var(--primary)" }}>{formatPrice(selectedOrder.totalPrice, currency, site?.usdRate)}</span>
            </div>
            <h3 className="font-semibold mt-4 mb-2 text-sm" style={{ color: "#1F2937" }}>Delivery Address</h3>
            <p className="text-xs" style={{ color: "#6B7280" }}>
              {selectedOrder.shippingAddress?.fullName}, {selectedOrder.shippingAddress?.addressLine1},
              {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.district}, Sri Lanka
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
