import { useState, useEffect } from "react";
import { authAPI } from "../../services/api";
import { Search, User, Shield } from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import toast from "react-hot-toast";

export default function AdminCustomers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = { role: "customer", limit: 50 };
      if (search) params.search = search;
      const res = await authAPI.getAllUsers(params);
      setUsers(res.data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { const t = setTimeout(loadUsers, 300); return () => clearTimeout(t); }, [search]);

  const toggleStatus = async (id) => {
    await authAPI.toggleUserStatus(id);
    toast.success("Status updated");
    loadUsers();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6" style={{ color: "#1F2937" }}>Customers</h1>
      <div className="relative mb-5 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6B7280" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className="input-field pl-8 text-sm" />
      </div>
      {loading ? <LoadingSpinner /> : (
        <div className="bg-white rounded-xl border border-[#F1F5F9] shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
              <tr>
                {["Customer","Email","Phone","Joined","Status","Action"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "#6B7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} style={{ borderBottom: "1px solid #F1F5F9" }} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: "#1F2937" }}>
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium" style={{ color: "#1F2937" }}>{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#6B7280" }}>{user.email}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#6B7280" }}>{user.phone || "—"}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#6B7280" }}>
                    {new Date(user.createdAt).toLocaleDateString("en-LK")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleStatus(user._id)}
                      className="text-xs font-semibold hover:opacity-70" style={{ color: user.isActive ? "#EF4444" : "#10B981" }}>
                      {user.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <div className="text-center py-10" style={{ color: "#6B7280" }}>No customers found</div>}
        </div>
      )}
    </div>
  );
}
