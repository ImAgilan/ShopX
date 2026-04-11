import { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CreditCard, Truck, Globe, CheckCircle, MapPin, ChevronDown } from "lucide-react";
import { ordersAPI, paymentAPI } from "../../services/api";
import { clearCart } from "../../redux/slices/cartSlice";
import { calculateTotal, clearCalculation } from "../../redux/slices/pricingSlice";
import { getImageUrl, debounce } from "../../utils/helpers";
import { SRI_LANKA_PROVINCES, SRI_LANKA_DISTRICTS } from "../../utils/currency";
import { formatPrice } from "../../utils/currency";
import PricingBreakdown from "../../components/shop/PricingBreakdown";
import toast from "react-hot-toast";

const PAYMENT_METHODS = [
  { id: "payhere", label: "Pay with Card / Online", icon: CreditCard, description: "Visa, Mastercard via PayHere (Secure)" },
  { id: "cod", label: "Cash on Delivery", icon: Truck, description: "Pay when you receive your order" },
];

// International countries grouped for select
const INTL_COUNTRIES = [
  "India","Pakistan","Bangladesh","Nepal","Bhutan","Maldives","China","Japan","South Korea",
  "Singapore","Malaysia","Thailand","Vietnam","Indonesia","Philippines",
  "UK","Germany","France","Italy","Spain","Netherlands","Sweden","Norway","Denmark",
  "United States","Canada","Mexico","Brazil","Argentina","Chile","Colombia",
  "South Africa","Nigeria","Kenya","Egypt","Australia","New Zealand",
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.cart);
  const { currency, site } = useSelector((s) => s.settings);
  const { user } = useSelector((s) => s.auth);
  const { calculation, calculating } = useSelector((s) => s.pricing);

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isInternational, setIsInternational] = useState(false);
  const [placing, setPlacing] = useState(false);

  const [address, setAddress] = useState({
    fullName: user?.name || "",
    addressLine1: "", addressLine2: "",
    city: "", district: "Colombo", province: "Western",
    postalCode: "", phone: user?.phone || "",
  });
  const [country, setCountry] = useState("India");

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // ── Recalculate whenever address / mode changes ──────────────────────────
  const recalculate = useCallback(
    debounce((payload) => { dispatch(calculateTotal(payload)); }, 400),
    [dispatch]
  );

  useEffect(() => {
    if (subtotal <= 0) return;
    recalculate({
      subtotal,
      district: isInternational ? undefined : address.district,
      country: isInternational ? country : undefined,
      isInternational,
    });
  }, [subtotal, address.district, country, isInternational]);

  useEffect(() => {
    return () => dispatch(clearCalculation());
  }, []);

  if (items.length === 0) { navigate("/cart"); return null; }

  const handleOrder = async () => {
    if (!address.fullName || !address.addressLine1 || !address.city || !address.phone) {
      toast.error("Please fill in all required address fields"); return;
    }
    if (isInternational && !country) {
      toast.error("Please select a country"); return;
    }
    setPlacing(true);
    try {
      const orderData = {
        shippingAddress: isInternational
          ? { ...address, district: "International", province: "International", country }
          : address,
        paymentMethod,
        items: items.map(i => ({ product: i.product?._id || i.product, quantity: i.quantity })),
        currency,
        isInternational,
        country: isInternational ? country : undefined,
      };

      const { data } = await ordersAPI.create(orderData);
      const orderId = data.data._id;

      if (paymentMethod === "payhere") {
        const payhereRes = await paymentAPI.initiatePayhere(orderId);
        const pd = payhereRes.data.data;
        const form = document.createElement("form");
        form.method = "POST"; form.action = pd.payhereUrl;
        Object.entries(pd).forEach(([key, val]) => {
          if (key === "payhereUrl") return;
          const input = document.createElement("input");
          input.type = "hidden"; input.name = key; input.value = val;
          form.appendChild(input);
        });
        document.body.appendChild(form); form.submit();
      } else {
        dispatch(clearCart());
        toast.success("Order placed successfully! 🎉");
        navigate(`/order-success/${orderId}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    }
    setPlacing(false);
  };

  const setAddr = (key, val) => setAddress(a => ({ ...a, [key]: val }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8" style={{ color: "#1F2937" }}>Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Delivery type toggle */}
          <div className="bg-white rounded-xl border border-[#F1F5F9] shadow-sm p-5">
            <h2 className="font-bold text-base mb-4 flex items-center gap-2" style={{ color: "#1F2937" }}>
              <MapPin size={18} style={{ color: "var(--primary)" }} /> Delivery Location
            </h2>
            <div className="flex gap-3">
              {[
                { val: false, icon: Truck, label: "Sri Lanka" },
                { val: true,  icon: Globe, label: "International" },
              ].map(({ val, icon: Icon, label }) => (
                <button key={String(val)} type="button" onClick={() => setIsInternational(val)}
                  className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all"
                  style={{
                    borderColor: isInternational === val ? "var(--primary)" : "#F1F5F9",
                    backgroundColor: isInternational === val ? "rgba(230,57,70,0.05)" : "transparent",
                  }}>
                  <Icon size={18} style={{ color: isInternational === val ? "var(--primary)" : "#6B7280" }} />
                  <span className="font-semibold text-sm" style={{ color: isInternational === val ? "var(--primary)" : "#1F2937" }}>
                    {label}
                  </span>
                  {isInternational === val && <CheckCircle size={16} className="ml-auto" style={{ color: "var(--primary)" }} />}
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-xl border border-[#F1F5F9] shadow-sm p-5">
            <h2 className="font-bold text-base mb-5 flex items-center gap-2" style={{ color: "#1F2937" }}>
              <Truck size={18} style={{ color: "var(--primary)" }} /> Delivery Address
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Full Name *</Label>
                <input value={address.fullName} onChange={e => setAddr("fullName", e.target.value)} className="input-field" placeholder="John Perera" />
              </div>
              <div className="col-span-2">
                <Label>Address Line 1 *</Label>
                <input value={address.addressLine1} onChange={e => setAddr("addressLine1", e.target.value)} className="input-field" placeholder="No. 42, Galle Road" />
              </div>
              <div className="col-span-2">
                <Label>Address Line 2</Label>
                <input value={address.addressLine2} onChange={e => setAddr("addressLine2", e.target.value)} className="input-field" placeholder="Apartment, suite, etc." />
              </div>
              <div>
                <Label>City *</Label>
                <input value={address.city} onChange={e => setAddr("city", e.target.value)} className="input-field" placeholder="Colombo" />
              </div>
              <div>
                <Label>Phone *</Label>
                <input value={address.phone} onChange={e => setAddr("phone", e.target.value)} className="input-field" placeholder="+94 77 123 4567" />
              </div>

              {isInternational ? (
                <div className="col-span-2">
                  <Label>Country *</Label>
                  <div className="relative">
                    <select value={country} onChange={e => setCountry(e.target.value)} className="input-field pr-10 appearance-none">
                      {INTL_COUNTRIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#6B7280" }} />
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <Label>District *</Label>
                    <div className="relative">
                      <select value={address.district} onChange={e => setAddr("district", e.target.value)} className="input-field pr-10 appearance-none">
                        {SRI_LANKA_DISTRICTS.map(d => <option key={d}>{d}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#6B7280" }} />
                    </div>
                  </div>
                  <div>
                    <Label>Province *</Label>
                    <div className="relative">
                      <select value={address.province} onChange={e => setAddr("province", e.target.value)} className="input-field pr-10 appearance-none">
                        {SRI_LANKA_PROVINCES.map(p => <option key={p}>{p}</option>)}
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#6B7280" }} />
                    </div>
                  </div>
                  <div>
                    <Label>Postal Code</Label>
                    <input value={address.postalCode} onChange={e => setAddr("postalCode", e.target.value)} className="input-field" placeholder="00300" />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-xl border border-[#F1F5F9] shadow-sm p-5">
            <h2 className="font-bold text-base mb-5 flex items-center gap-2" style={{ color: "#1F2937" }}>
              <CreditCard size={18} style={{ color: "var(--primary)" }} /> Payment Method
            </h2>
            <div className="space-y-3">
              {PAYMENT_METHODS.map(({ id, label, icon: Icon, description }) => (
                <button key={id} type="button" onClick={() => setPaymentMethod(id)}
                  className="w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all"
                  style={{
                    borderColor: paymentMethod === id ? "var(--primary)" : "#F1F5F9",
                    backgroundColor: paymentMethod === id ? "rgba(230,57,70,0.05)" : "transparent",
                  }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: paymentMethod === id ? "var(--primary)" : "#F8FAFC" }}>
                    <Icon size={18} className={paymentMethod === id ? "text-white" : ""} style={paymentMethod !== id ? { color: "#6B7280" } : {}} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: "#1F2937" }}>{label}</p>
                    <p className="text-xs" style={{ color: "#6B7280" }}>{description}</p>
                  </div>
                  {paymentMethod === id && <CheckCircle size={18} style={{ color: "var(--primary)" }} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right column — Order Summary ── */}
        <div>
          <div className="bg-white rounded-xl border border-[#F1F5F9] shadow-sm p-5 sticky top-20 space-y-5">
            <h2 className="font-bold text-lg" style={{ color: "#1F2937" }}>Order Summary</h2>

            {/* Items */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {items.map(item => (
                <div key={item._id} className="flex gap-3 items-center">
                  <img src={getImageUrl(item.product?.images?.[0]?.url)} alt=""
                    className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: "#1F2937" }}>{item.product?.name}</p>
                    <p className="text-xs" style={{ color: "#6B7280" }}>Qty: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-bold shrink-0" style={{ color: "#1F2937" }}>
                    {formatPrice(item.price * item.quantity, currency, site?.usdRate)}
                  </span>
                </div>
              ))}
            </div>

            {/* Live Pricing Breakdown */}
            <PricingBreakdown calculation={calculation} calculating={calculating} />

            {/* Place Order */}
            <button onClick={handleOrder} disabled={placing || calculating} className="btn-primary w-full text-base py-4">
              {placing ? "Processing..." : paymentMethod === "payhere" ? "💳 Pay with PayHere" : "📦 Place Order"}
            </button>

            <p className="text-xs text-center" style={{ color: "#6B7280" }}>
              🔒 All transactions are encrypted and secure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ children }) {
  return <label className="block text-sm font-medium mb-1.5" style={{ color: "#1F2937" }}>{children}</label>;
}
