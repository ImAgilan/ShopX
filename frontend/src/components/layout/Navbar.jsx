import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { ShoppingCart, Search, Menu, X, ChevronDown, Globe, User, Heart } from "lucide-react";
import { logout } from "../../redux/slices/authSlice";
import { selectCartItemCount } from "../../redux/slices/cartSlice";
import { setCurrency } from "../../redux/slices/settingsSlice";
import toast from "react-hot-toast";

export default function Navbar() {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [userOpen, setUserOpen]   = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery]         = useState("");
  const [scrolled, setScrolled]   = useState(false);
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { user, isAuthenticated } = useSelector(s => s.auth);
  const cartCount = useSelector(selectCartItemCount);
  const { site, currency } = useSelector(s => s.settings);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setMenuOpen(false); setUserOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    dispatch(logout()); toast.success("Logged out"); navigate("/"); setUserOpen(false);
  };
  const handleSearch = e => {
    e.preventDefault();
    if (query.trim()) { navigate(`/products?search=${encodeURIComponent(query)}`); setSearchOpen(false); setQuery(""); }
  };

  const isActive = path => location.pathname === path;

  return (
    <header className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${scrolled ? "shadow-md" : "border-b border-[#F1F5F9]"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 mr-4">
          {site?.logo
            ? <img src={site.logo} alt={site.siteName} className="h-8 w-auto" />
            : <span className="text-2xl font-black tracking-tight" style={{ color: "var(--primary)" }}>
                {site?.siteName || "Shop‑X"}
              </span>
          }
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {[["Home","/"],["Products","/products"]].map(([label, path]) => (
            <Link key={path} to={path}
              className={`px-4 py-2 rounded-lg text-sm font-600 transition-all duration-150 relative
                ${isActive(path) ? "text-[#FF6A00] font-bold" : "text-[#1F2937] hover:text-[#FF6A00] hover:bg-[#FFF4EC]"}`}>
              {label}
              {isActive(path) && <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-[#FF6A00]" />}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Currency */}
          <button onClick={() => dispatch(setCurrency(currency === "LKR" ? "USD" : "LKR"))}
            className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border border-[#E5E7EB] text-[#6B7280] hover:border-[#FF6A00] hover:text-[#FF6A00] hover:bg-[#FFF4EC] transition-all">
            <Globe size={12} />{currency}
          </button>

          {/* Search */}
          <button onClick={() => setSearchOpen(!searchOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-[#6B7280] hover:text-[#FF6A00] hover:bg-[#FFF4EC] transition-all">
            <Search size={18} />
          </button>

          {/* Wishlist */}
          {isAuthenticated && (
            <Link to="/wishlist"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-[#6B7280] hover:text-[#FF6A00] hover:bg-[#FFF4EC] transition-all">
              <Heart size={18} />
            </Link>
          )}

          {/* Cart */}
          <Link to="/cart"
            className="relative w-9 h-9 flex items-center justify-center rounded-lg text-[#6B7280] hover:text-[#FF6A00] hover:bg-[#FFF4EC] transition-all">
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center rounded-full text-white text-[10px] font-black"
                style={{ backgroundColor: "var(--primary)", fontSize: "10px", padding: "2px 4px" }}>
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>

          {/* User */}
          {isAuthenticated ? (
            <div className="relative">
              <button onClick={() => setUserOpen(!userOpen)}
                className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-[#FFF4EC] transition-all">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                  style={{ backgroundColor: "var(--primary)" }}>
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <ChevronDown size={13} className="text-[#9CA3AF] hidden md:block" />
              </button>
              {userOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-[#F1F5F9] py-1 animate-fade-in z-50">
                  <div className="px-4 py-2.5 border-b border-[#F1F5F9]">
                    <p className="font-semibold text-sm text-[#1F2937]">{user?.name}</p>
                    <p className="text-xs text-[#6B7280] truncate">{user?.email}</p>
                  </div>
                  {["admin","super_admin"].includes(user?.role) && (
                    <Link to="/admin" className="block px-4 py-2 text-sm font-semibold hover:bg-[#FFF4EC] transition-colors" style={{ color: "var(--primary)" }}>
                      ⚙️ Admin Panel
                    </Link>
                  )}
                  <Link to="/profile" className="block px-4 py-2 text-sm text-[#1F2937] hover:bg-[#FFF4EC] transition-colors">My Profile</Link>
                  <Link to="/orders"  className="block px-4 py-2 text-sm text-[#1F2937] hover:bg-[#FFF4EC] transition-colors">My Orders</Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors">
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login">
              <button className="btn btn-primary btn-sm ml-1">Sign In</button>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#FFF4EC] transition-all ml-1">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Search bar */}
      {searchOpen && (
        <div className="border-t border-[#F1F5F9] bg-[#F8FAFC] px-4 py-3 animate-fade-in">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-2">
            <input value={query} onChange={e => setQuery(e.target.value)} autoFocus
              placeholder="Search for products..." className="input-field flex-1" />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>
        </div>
      )}

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#F1F5F9] bg-white px-4 py-3 space-y-1 animate-fade-in">
          {[["Home","/"],["Products","/products"]].map(([label,path]) => (
            <Link key={path} to={path} className={`block px-3 py-2.5 rounded-lg text-sm font-medium ${isActive(path) ? "bg-[#FFF4EC] text-[#FF6A00] font-bold" : "text-[#1F2937]"}`}>{label}</Link>
          ))}
          <div className="border-t border-[#F1F5F9] pt-2 mt-2">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="block px-3 py-2.5 rounded-lg text-sm text-[#1F2937]">My Profile</Link>
                <Link to="/orders"  className="block px-3 py-2.5 rounded-lg text-sm text-[#1F2937]">My Orders</Link>
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2.5 rounded-lg text-sm text-red-500">Sign Out</button>
              </>
            ) : (
              <Link to="/login"><button className="btn btn-primary w-full mt-1">Sign In</button></Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
