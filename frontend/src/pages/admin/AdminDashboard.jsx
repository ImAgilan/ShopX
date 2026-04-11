import { useState, useEffect } from "react";
import { ordersAPI } from "../../services/api";
import { formatPrice } from "../../utils/currency";
import { useSelector } from "react-redux";
import { ShoppingBag, Users, Package, TrendingUp, Clock, CheckCircle, Truck } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getOrderStatusColor } from "../../utils/helpers";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Link } from "react-router-dom";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currency, site } = useSelector((s) => s.settings);

  useEffect(() => {
    ordersAPI.getDashboardStats().then(res => { setStats(res.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!stats) return null;

  const chartData = stats.monthlyRevenue?.map(m => ({
    name: MONTHS[(m._id.month || 1) - 1], revenue: m.revenue, orders: m.orders,
  })) || [];

  const statCards = [
    { label: "Total Revenue", value: formatPrice(stats.totalRevenue, currency, site?.usdRate), icon: TrendingUp, color: "#FF6A00" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "#3B82F6" },
    { label: "Products", value: stats.totalProducts, icon: Package, color: "#10B981" },
    { label: "Customers", value: stats.totalCustomers, icon: Users, color: "#8B5CF6" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#1F2937" }}>Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-[#F1F5F9] shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-[#6B7280]">{label}</p>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                <Icon size={20} style={{ color }} />
              </div>
            </div>
            <p className="text-2xl font-black text-[#1F2937]">{value}</p>
            {label === "Total Orders" && stats.pendingOrders > 0 && (
              <p className="text-xs mt-1 text-orange-500">{stats.pendingOrders} pending</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl border border-[#F1F5F9] shadow-sm p-6 lg:col-span-2">
          <h2 className="font-bold mb-5 text-[#1F2937]">Monthly Revenue</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6B7280" }} />
                <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
                <Tooltip formatter={(val) => [formatPrice(val, currency, site?.usdRate), "Revenue"]} contentStyle={{ backgroundColor: "#fff", border: "1px solid #F1F5F9", borderRadius: "12px" }} />
                <Bar dataKey="revenue" fill="#FF6A00" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-sm" style={{ color: "#6B7280" }}>No revenue data yet</div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-[#F1F5F9] shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-[#1F2937]">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs font-semibold hover:opacity-70" style={{ color: "var(--primary)" }}>View All</Link>
          </div>
          <div className="space-y-3">
            {stats.recentOrders?.slice(0,5).map(order => (
              <div key={order._id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: "#1F2937" }}>
                  {order.user?.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate" style={{ color: "#1F2937" }}>#{order.orderNumber}</p>
                  <p className="text-xs truncate" style={{ color: "#6B7280" }}>{order.user?.name}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getOrderStatusColor(order.orderStatus)}`}>
                  {order.orderStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
