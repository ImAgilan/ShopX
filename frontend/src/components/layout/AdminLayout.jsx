import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  LayoutDashboard, Package, ShoppingBag, Users, Settings,
  Layout, Tag, Shield, DollarSign, LogOut, Menu, X, ChevronRight,
} from "lucide-react";
import { logout } from "../../redux/slices/authSlice";
import toast from "react-hot-toast";

const NAV = [
  { path: "/admin",            label: "Dashboard",        icon: LayoutDashboard, roles: ["admin","super_admin"] },
  { path: "/admin/products",   label: "Products",         icon: Package,         roles: ["admin","super_admin"] },
  { path: "/admin/categories", label: "Categories",       icon: Tag,             roles: ["admin","super_admin"] },
  { path: "/admin/orders",     label: "Orders",           icon: ShoppingBag,     roles: ["admin","super_admin"] },
  { path: "/admin/customers",  label: "Customers",        icon: Users,           roles: ["admin","super_admin"] },
  { path: "/admin/pricing",    label: "Pricing",          icon: DollarSign,      roles: ["super_admin"] },
  { path: "/admin/roles",      label: "Roles",            icon: Shield,          roles: ["super_admin"] },
  { path: "/admin/settings",   label: "Site Settings",    icon: Settings,        roles: ["super_admin"] },
  { path: "/admin/layout",     label: "Layout Builder",   icon: Layout,          roles: ["super_admin"] },
];

export default function AdminLayout() {
  const [open, setOpen] = useState(true);
  const { user } = useSelector(s => s.auth);
  const { site } = useSelector(s => s.settings);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = () => { dispatch(logout()); toast.success("Logged out"); navigate("/"); };
  const allowed = NAV.filter(n => n.roles.includes(user?.role));

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      {/* Sidebar */}
      <aside className={`${open ? "w-60" : "w-16"} transition-all duration-300 flex flex-col bg-white border-r border-[#F1F5F9] shrink-0`}>
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#F1F5F9]">
          {open && (
            <Link to="/" className="text-xl font-black" style={{ color: "var(--primary)" }}>
              {site?.siteName || "Shop‑X"}
            </Link>
          )}
          <button onClick={() => setOpen(!open)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#FFF4EC] transition-colors ml-auto text-[#6B7280]">
            {open ? <X size={15} /> : <Menu size={15} />}
          </button>
        </div>

        {/* User info */}
        {open && (
          <div className="px-4 py-3 border-b border-[#F1F5F9]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold shrink-0"
                style={{ backgroundColor: "var(--primary)" }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm text-[#1F2937] truncate">{user?.name}</p>
                <p className="text-xs text-[#6B7280] capitalize">{user?.role?.replace("_"," ")}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {allowed.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path} title={!open ? label : ""}
                className={`admin-nav-link ${active ? "active" : ""}`}>
                <Icon size={17} className="shrink-0" />
                {open && <span>{label}</span>}
                {open && active && <ChevronRight size={13} className="ml-auto opacity-70" />}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-[#F1F5F9]">
          <button onClick={handleLogout}
            className="admin-nav-link w-full text-red-500 hover:bg-red-50 hover:text-red-600">
            <LogOut size={17} className="shrink-0" />
            {open && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-[#F1F5F9]">
          <h1 className="font-bold text-[#1F2937]">Admin Panel</h1>
          <Link to="/" className="text-sm text-[#6B7280] hover:text-[#FF6A00] transition-colors">
            ← View Store
          </Link>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
