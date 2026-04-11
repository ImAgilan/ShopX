import { useState, useEffect } from "react";
import { authAPI } from "../../services/api";
import { Shield, Search } from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import toast from "react-hot-toast";

const ROLES = ["super_admin","admin","customer"];

export default function AdminRoles() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = { limit: 100 };
      if (search) params.search = search;
      const res = await authAPI.getAllUsers(params);
      setUsers(res.data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { const t = setTimeout(loadUsers, 300); return () => clearTimeout(t); }, [search]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await authAPI.updateUserRole(userId, newRole);
      toast.success("Role updated");
      loadUsers();
    } catch (err) { toast.error(err.response?.data?.message || "Failed"); }
  };

  const getRoleBadgeColor = (role) => {
    return { super_admin: "bg-purple-100 text-purple-800", admin: "bg-blue-100 text-blue-800", customer: "bg-gray-100 text-gray-800" }[role] || "";
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Shield size={24} style={{ color: "var(--primary)" }} />
        <h1 className="text-2xl font-bold" style={{ color: "#1F2937" }}>Role Management</h1>
      </div>
      <div className="bg-white rounded-xl border border-[#F1F5F9] shadow-sm p-4 mb-5 border-l-4" style={{ borderLeftColor: "#F59E0B", backgroundColor: "#F8FAFC" }}>
        <p className="text-sm font-medium" style={{ color: "#1F2937" }}>⚠️ Caution: Changing roles affects system access permissions. Only promote trusted users.</p>
      </div>
      <div className="relative mb-5 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "#6B7280" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="input-field pl-8 text-sm" />
      </div>
      {loading ? <LoadingSpinner /> : (
        <div className="bg-white rounded-xl border border-[#F1F5F9] shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
              <tr>
                {["User","Email","Current Role","Change Role","Status"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: "#6B7280" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} style={{ borderBottom: "1px solid #F1F5F9" }} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: "var(--primary)" }}>{user.name?.[0]?.toUpperCase()}</div>
                      <span className="font-medium" style={{ color: "#1F2937" }}>{user.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#6B7280" }}>{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${getRoleBadgeColor(user.role)}`}>{user.role?.replace("_"," ")}</span>
                  </td>
                  <td className="px-4 py-3">
                    <select value={user.role} onChange={e => handleRoleChange(user._id, e.target.value)}
                      className="input-field text-xs py-1.5 w-auto">
                      {ROLES.map(r => <option key={r} value={r}>{r.replace("_"," ")}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
