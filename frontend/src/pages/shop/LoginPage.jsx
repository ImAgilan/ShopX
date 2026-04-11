import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff, LogIn, ShoppingBag } from "lucide-react";
import { login, clearError } from "../../redux/slices/authSlice";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error, isAuthenticated } = useSelector(s => s.auth);
  const { site } = useSelector(s => s.settings);
  const from = location.state?.from?.pathname || "/";

  useEffect(() => { if (isAuthenticated) navigate(from, { replace: true }); }, [isAuthenticated]);
  useEffect(() => { if (error) toast.error(error); return () => dispatch(clearError()); }, [error]);

  const handleSubmit = async e => {
    e.preventDefault();
    const r = await dispatch(login(form));
    if (login.fulfilled.match(r)) {
      toast.success("Welcome back!");
      const role = r.payload.user?.role;
      if (["admin","super_admin"].includes(role)) navigate("/admin");
      else navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#F8FAFC]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-[#F1F5F9] p-8 animate-fade-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "var(--orange-light)" }}>
              <ShoppingBag size={26} style={{ color: "var(--primary)" }} />
            </div>
            <h1 className="text-2xl font-black text-[#1F2937]">Welcome back</h1>
            <p className="text-sm text-[#6B7280] mt-1">Sign in to your {site?.siteName || "Shop‑X"} account</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#1F2937] mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                required className="input-field" placeholder="you@example.com" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1F2937] mb-1.5">Password</label>
              <div className="relative">
                <input type={showPwd ? "text" : "password"} value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required className="input-field pr-11" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]">
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full btn-lg mt-1">
              <LogIn size={17} /> {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <p className="text-center text-sm text-[#6B7280] mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="font-bold hover:underline" style={{ color: "var(--primary)" }}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
