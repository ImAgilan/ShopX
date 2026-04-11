import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff, UserPlus, ShoppingBag } from "lucide-react";
import { register as registerAction, clearError } from "../../redux/slices/authSlice";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [showPwd, setShowPwd] = useState(false);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(s => s.auth);
  const { site } = useSelector(s => s.settings);

  useEffect(() => { if (isAuthenticated) navigate("/"); }, [isAuthenticated]);
  useEffect(() => { if (error) toast.error(error); return () => dispatch(clearError()); }, [error]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    const r = await dispatch(registerAction(form));
    if (registerAction.fulfilled.match(r)) { toast.success("Account created!"); navigate("/"); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-[#F8FAFC]">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm border border-[#F1F5F9] p-8 animate-fade-up">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "var(--orange-light)" }}>
              <ShoppingBag size={26} style={{ color: "var(--primary)" }} />
            </div>
            <h1 className="text-2xl font-black text-[#1F2937]">Create Account</h1>
            <p className="text-sm text-[#6B7280] mt-1">Join {site?.siteName || "Shop‑X"} today</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {[["name","Full Name","text","John Perera"],["email","Email","email","you@example.com"],["phone","Phone","tel","+94 77 123 4567"]].map(([k,l,t,p]) => (
              <div key={k}>
                <label className="block text-sm font-semibold text-[#1F2937] mb-1.5">{l}</label>
                <input type={t} value={form[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))}
                  className="input-field" placeholder={p} required={k !== "phone"} />
              </div>
            ))}
            <div>
              <label className="block text-sm font-semibold text-[#1F2937] mb-1.5">Password</label>
              <div className="relative">
                <input type={showPwd ? "text" : "password"} value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  required className="input-field pr-11" placeholder="Min. 6 characters" />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]">
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full btn-lg mt-1">
              <UserPlus size={17} /> {loading ? "Creating..." : "Create Account"}
            </button>
          </form>
          <p className="text-center text-sm text-[#6B7280] mt-6">
            Already have an account?{" "}
            <Link to="/login" className="font-bold hover:underline" style={{ color: "var(--primary)" }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
