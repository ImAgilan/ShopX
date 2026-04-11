import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchPricingConfig, updateTaxCharges,
  updateDistrictFees, updateInternational,
} from "../../redux/slices/pricingSlice";
import {
  Plus, Trash2, Save, ToggleLeft, ToggleRight,
  Percent, DollarSign, Truck, Globe, ChevronDown, ChevronUp, Info,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import toast from "react-hot-toast";

// ─── Reusable Toggle ──────────────────────────────────────────────────────────
const Toggle = ({ checked, onChange, label }) => (
  <button onClick={() => onChange(!checked)}
    className="flex items-center gap-2 group">
    <div className={`relative w-11 h-6 rounded-full transition-all duration-200 ${checked ? "" : "bg-gray-200 dark:bg-gray-700"}`}
      style={checked ? { backgroundColor: "var(--primary)" } : {}}>
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${checked ? "left-5" : "left-0.5"}`} />
    </div>
    {label && <span className="text-sm font-medium" style={{ color: "#1F2937" }}>{label}</span>}
  </button>
);

// ─── Tab Button ───────────────────────────────────────────────────────────────
const Tab = ({ active, onClick, icon: Icon, label, badge }) => (
  <button onClick={onClick}
    className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all border-2 ${active ? "text-white border-transparent" : "border-transparent"}`}
    style={active ? { backgroundColor: "var(--primary)" } : { color: "#6B7280", backgroundColor: "#F8FAFC" }}>
    <Icon size={16} />
    {label}
    {badge !== undefined && (
      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${active ? "bg-white/20 text-white" : "bg-gray-200 text-gray-600"}`}>
        {badge}
      </span>
    )}
  </button>
);

// ─── Section Card ─────────────────────────────────────────────────────────────
const SectionCard = ({ title, subtitle, children, action }) => (
  <div className="bg-white rounded-xl border border-[#F1F5F9] shadow-sm p-6 mb-5">
    <div className="flex items-start justify-between mb-5">
      <div>
        <h3 className="font-bold text-base" style={{ color: "#1F2937" }}>{title}</h3>
        {subtitle && <p className="text-sm mt-0.5" style={{ color: "#6B7280" }}>{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </div>
);

// ══════════════════════════════════════════════════════════════════════════════
// TAX CHARGES TAB
// ══════════════════════════════════════════════════════════════════════════════
function TaxChargesTab({ config, onSave, saving }) {
  const [charges, setCharges] = useState(config?.taxCharges || []);

  useEffect(() => { setCharges(config?.taxCharges || []); }, [config]);

  const addCharge = () => setCharges(prev => [...prev, {
    name: "", type: "percentage", value: 0, isEnabled: true, appliesTo: "subtotal",
    _tempId: Date.now(),
  }]);

  const remove = (i) => setCharges(prev => prev.filter((_, idx) => idx !== i));

  const update = (i, key, val) => setCharges(prev =>
    prev.map((c, idx) => idx === i ? { ...c, [key]: val } : c)
  );

  const handleSave = () => {
    for (const c of charges) {
      if (!c.name.trim()) { toast.error("Each charge must have a name"); return; }
      if (c.value < 0) { toast.error("Value cannot be negative"); return; }
    }
    onSave(charges);
  };

  return (
    <div>
      <SectionCard
        title="Tax & VAT Charges"
        subtitle="Configure taxes applied to orders. Multiple charges stack on the subtotal."
        action={
          <button onClick={addCharge} className="btn-primary text-sm px-4 py-2">
            <Plus size={15} /> Add Charge
          </button>
        }
      >
        {charges.length === 0 ? (
          <div className="text-center py-10 rounded-xl border-2 border-dashed" style={{ borderColor: "#F1F5F9" }}>
            <Percent size={36} className="mx-auto mb-3 opacity-30" style={{ color: "#1F2937" }} />
            <p className="font-medium" style={{ color: "#6B7280" }}>No charges configured</p>
            <p className="text-sm mt-1" style={{ color: "#6B7280" }}>Click "Add Charge" to create your first tax rule</p>
          </div>
        ) : (
          <div className="space-y-3">
            {charges.map((charge, i) => (
              <div key={charge._id || charge._tempId || i}
                className={`rounded-2xl border-2 p-5 transition-all ${charge.isEnabled ? "" : "opacity-60"}`}
                style={{ borderColor: charge.isEnabled ? "var(--primary)" : "#F1F5F9", backgroundColor: "#F8FAFC" }}>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  {/* Name */}
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#6B7280" }}>Name</label>
                    <input value={charge.name} onChange={e => update(i, "name", e.target.value)}
                      className="input-field font-semibold" placeholder="e.g. VAT, Tax" />
                  </div>
                  {/* Type */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#6B7280" }}>Type</label>
                    <select value={charge.type} onChange={e => update(i, "type", e.target.value)} className="input-field">
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount</option>
                    </select>
                  </div>
                  {/* Value */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#6B7280" }}>
                      Value {charge.type === "percentage" ? "(%)" : "(Rs.)"}
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: "#6B7280" }}>
                        {charge.type === "percentage" ? "%" : "Rs."}
                      </span>
                      <input type="number" min="0" step={charge.type === "percentage" ? "0.1" : "1"}
                        value={charge.value} onChange={e => update(i, "value", parseFloat(e.target.value) || 0)}
                        className="input-field pl-9" />
                    </div>
                  </div>
                  {/* Applies To */}
                  <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#6B7280" }}>Applies To</label>
                    <select value={charge.appliesTo} onChange={e => update(i, "appliesTo", e.target.value)} className="input-field">
                      <option value="subtotal">Subtotal</option>
                      <option value="grand_total">Grand Total</option>
                    </select>
                  </div>
                </div>
                {/* Row controls */}
                <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "#F1F5F9" }}>
                  <Toggle checked={charge.isEnabled} onChange={v => update(i, "isEnabled", v)}
                    label={charge.isEnabled ? "Enabled — will apply to orders" : "Disabled — not applied"} />
                  <button onClick={() => remove(i)} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 transition-colors">
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Preview */}
        {charges.some(c => c.isEnabled && c.value > 0) && (
          <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: "rgba(230,57,70,0.05)", border: "1px solid rgba(230,57,70,0.2)" }}>
            <p className="text-xs font-bold mb-2" style={{ color: "var(--primary)" }}>PREVIEW — On a Rs. 10,000 order:</p>
            {(() => {
              let running = 10000;
              return charges.filter(c => c.isEnabled).map((c, i) => {
                const base = c.appliesTo === "subtotal" ? 10000 : running;
                const amt = c.type === "percentage" ? (base * c.value / 100) : c.value;
                running += amt;
                return (
                  <p key={i} className="text-xs" style={{ color: "#6B7280" }}>
                    + {c.name}: Rs. {amt.toFixed(2)} {c.type === "percentage" ? `(${c.value}%)` : "(fixed)"}
                  </p>
                );
              });
            })()}
            <p className="text-sm font-bold mt-2 pt-2 border-t" style={{ borderColor: "rgba(230,57,70,0.2)", color: "#1F2937" }}>
              Total tax: Rs. {charges.filter(c => c.isEnabled).reduce((sum, c) => {
                const base = c.appliesTo === "subtotal" ? 10000 : 10000 + sum;
                return sum + (c.type === "percentage" ? (base * c.value / 100) : c.value);
              }, 0).toFixed(2)}
            </p>
          </div>
        )}
      </SectionCard>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          <Save size={16} /> {saving ? "Saving..." : "Save Tax Settings"}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// SRI LANKA DISTRICTS TAB
// ══════════════════════════════════════════════════════════════════════════════
function DistrictsTab({ config, onSave, saving }) {
  const localDelivery = config?.localDelivery;
  const [districts, setDistricts] = useState(localDelivery?.districts || []);
  const [freeThreshold, setFreeThreshold] = useState(localDelivery?.freeThreshold ?? 5000);
  const [defaultFee, setDefaultFee] = useState(localDelivery?.defaultFee ?? 350);
  const [isEnabled, setIsEnabled] = useState(localDelivery?.isEnabled ?? true);
  const [search, setSearch] = useState("");
  const [expandedProvince, setExpandedProvince] = useState(null);

  useEffect(() => {
    if (localDelivery) {
      setDistricts(localDelivery.districts || []);
      setFreeThreshold(localDelivery.freeThreshold ?? 5000);
      setDefaultFee(localDelivery.defaultFee ?? 350);
      setIsEnabled(localDelivery.isEnabled ?? true);
    }
  }, [localDelivery]);

  const updateDistrict = (districtName, key, val) =>
    setDistricts(prev => prev.map(d => d.district === districtName ? { ...d, [key]: val } : d));

  const grouped = districts.reduce((acc, d) => {
    if (!acc[d.province]) acc[d.province] = [];
    acc[d.province].push(d);
    return acc;
  }, {});

  const filtered = search
    ? districts.filter(d => d.district.toLowerCase().includes(search.toLowerCase()))
    : null;

  const handleSave = () => onSave({ districts, freeThreshold, defaultFee, isEnabled });

  const setAllFees = (fee) => setDistricts(prev => prev.map(d => ({ ...d, fee: Number(fee) })));

  return (
    <div>
      {/* Global Settings */}
      <SectionCard title="Local Delivery Settings" subtitle="Configure Sri Lanka delivery options">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#6B7280" }}>Free Shipping Threshold (Rs.)</label>
            <input type="number" value={freeThreshold} onChange={e => setFreeThreshold(Number(e.target.value))} className="input-field" />
            <p className="text-xs mt-1" style={{ color: "#6B7280" }}>Orders above this get free delivery</p>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#6B7280" }}>Default Fee (Rs.) — fallback</label>
            <input type="number" value={defaultFee} onChange={e => setDefaultFee(Number(e.target.value))} className="input-field" />
            <p className="text-xs mt-1" style={{ color: "#6B7280" }}>Used if district not listed</p>
          </div>
          <div className="flex items-center">
            <Toggle checked={isEnabled} onChange={setIsEnabled} label="Local delivery enabled" />
          </div>
        </div>
        <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: "#F1F5F9" }}>
          <span className="text-sm font-medium" style={{ color: "#1F2937" }}>Set all district fees to:</span>
          <input type="number" placeholder="e.g. 350" className="input-field w-32"
            onBlur={e => { if (e.target.value) { setAllFees(e.target.value); e.target.value = ""; } }} />
          <span className="text-xs" style={{ color: "#6B7280" }}>press Tab/click away to apply</span>
        </div>
      </SectionCard>

      {/* District List */}
      <SectionCard title={`District Fees — ${districts.length} districts`} subtitle="Set delivery fee per district"
        action={
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search district..." className="input-field text-sm py-2 w-48" />
        }
      >
        {/* Flat search results */}
        {filtered ? (
          <div className="space-y-2">
            {filtered.map(d => (
              <DistrictRow key={d.district} d={d} onChange={updateDistrict} />
            ))}
            {filtered.length === 0 && <p className="text-sm text-center py-4" style={{ color: "#6B7280" }}>No districts match "{search}"</p>}
          </div>
        ) : (
          /* Grouped by province */
          Object.entries(grouped).map(([province, dists]) => (
            <div key={province} className="mb-3 rounded-xl overflow-hidden border" style={{ borderColor: "#F1F5F9" }}>
              <button
                onClick={() => setExpandedProvince(expandedProvince === province ? null : province)}
                className="w-full flex items-center justify-between px-4 py-3 font-semibold text-sm"
                style={{ backgroundColor: "#F8FAFC", color: "#1F2937" }}>
                <span>{province} Province <span className="text-xs font-normal ml-2" style={{ color: "#6B7280" }}>({dists.length} districts)</span></span>
                {expandedProvince === province ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {expandedProvince === province && (
                <div className="divide-y" style={{ borderColor: "#F1F5F9" }}>
                  {dists.map(d => <DistrictRow key={d.district} d={d} onChange={updateDistrict} />)}
                </div>
              )}
            </div>
          ))
        )}
      </SectionCard>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          <Save size={16} /> {saving ? "Saving..." : "Save District Fees"}
        </button>
      </div>
    </div>
  );
}

function DistrictRow({ d, onChange }) {
  return (
    <div className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm" style={{ color: "#1F2937" }}>{d.district}</p>
        <p className="text-xs" style={{ color: "#6B7280" }}>{d.province}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium" style={{ color: "#6B7280" }}>Rs.</span>
        <input type="number" value={d.fee} onChange={e => onChange(d.district, "fee", Number(e.target.value))}
          className="input-field text-sm py-1.5 w-24 text-right" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs" style={{ color: "#6B7280" }}>Days:</span>
        <input value={d.estimatedDays} onChange={e => onChange(d.district, "estimatedDays", e.target.value)}
          className="input-field text-sm py-1.5 w-16 text-center" placeholder="2-3" />
      </div>
      <Toggle checked={d.isEnabled} onChange={v => onChange(d.district, "isEnabled", v)} />
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// INTERNATIONAL TAB
// ══════════════════════════════════════════════════════════════════════════════
const CONTINENT_EMOJI = {
  Asia: "🌏", Europe: "🌍", "North America": "🌎",
  "South America": "🌎", Africa: "🌍", Australia: "🦘", Antarctica: "🧊",
};

function InternationalTab({ config, onSave, saving }) {
  const intl = config?.internationalDelivery;
  const [continents, setContinents] = useState(intl?.continents || []);
  const [isEnabled, setIsEnabled] = useState(intl?.isEnabled ?? false);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (intl) { setContinents(intl.continents || []); setIsEnabled(intl.isEnabled ?? false); }
  }, [intl]);

  const updateContinent = (name, key, val) =>
    setContinents(prev => prev.map(c => c.continent === name ? { ...c, [key]: val } : c));

  const handleSave = () => onSave({ continents, isEnabled });

  return (
    <div>
      <SectionCard title="International Delivery Settings" subtitle="Enable/configure worldwide shipping">
        <div className="flex items-center gap-4 mb-4">
          <Toggle checked={isEnabled} onChange={setIsEnabled} label="Enable international delivery" />
        </div>
        {!isEnabled && (
          <div className="p-4 rounded-xl text-sm" style={{ backgroundColor: "#F8FAFC", color: "#6B7280" }}>
            <Info size={14} className="inline mr-1" />
            International delivery is currently disabled. Customers will only see local delivery options at checkout.
          </div>
        )}
      </SectionCard>

      <SectionCard title="Continent Pricing" subtitle="Set delivery fees per continent (in USD)">
        <div className="space-y-3">
          {continents.map((c) => (
            <div key={c.continent}
              className={`rounded-2xl border-2 overflow-hidden transition-all ${c.isEnabled ? "" : "opacity-60"}`}
              style={{ borderColor: c.isEnabled ? "var(--primary)" : "#F1F5F9" }}>
              {/* Header */}
              <button
                onClick={() => setExpanded(expanded === c.continent ? null : c.continent)}
                className="w-full flex items-center gap-3 px-5 py-4"
                style={{ backgroundColor: "#F8FAFC" }}>
                <span className="text-2xl">{CONTINENT_EMOJI[c.continent] || "🌐"}</span>
                <div className="flex-1 text-left">
                  <p className="font-bold" style={{ color: "#1F2937" }}>{c.continent}</p>
                  <p className="text-xs" style={{ color: "#6B7280" }}>
                    ${c.fee} USD · {c.estimatedDays} days · {c.countries?.length || 0} countries
                  </p>
                </div>
                <Toggle checked={c.isEnabled} onChange={v => { updateContinent(c.continent, "isEnabled", v); }} />
                {expanded === c.continent ? <ChevronUp size={16} style={{ color: "#6B7280" }} /> : <ChevronDown size={16} style={{ color: "#6B7280" }} />}
              </button>

              {/* Expanded */}
              {expanded === c.continent && (
                <div className="px-5 pb-5 pt-1 space-y-4" style={{ backgroundColor: "#FFFFFF" }}>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#6B7280" }}>Delivery Fee (USD)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: "#6B7280" }}>$</span>
                        <input type="number" min="0" value={c.fee}
                          onChange={e => updateContinent(c.continent, "fee", Number(e.target.value))}
                          className="input-field pl-8" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#6B7280" }}>Est. Delivery Days</label>
                      <input value={c.estimatedDays}
                        onChange={e => updateContinent(c.continent, "estimatedDays", e.target.value)}
                        className="input-field" placeholder="7-14" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: "#6B7280" }}>Currency</label>
                      <select value={c.currency} onChange={e => updateContinent(c.continent, "currency", e.target.value)} className="input-field">
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>
                  </div>
                  {/* Countries */}
                  <div>
                    <p className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: "#6B7280" }}>Countries in this zone</p>
                    <div className="flex flex-wrap gap-2">
                      {c.countries?.map(ct => (
                        <span key={ct} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: "#F8FAFC", color: "#1F2937", border: "1px solid #F1F5F9" }}>
                          {ct}
                          <button onClick={() => updateContinent(c.continent, "countries", c.countries.filter(x => x !== ct))}
                            className="text-red-400 hover:text-red-600 ml-0.5">×</button>
                        </span>
                      ))}
                      <input
                        className="text-xs px-2.5 py-1 rounded-full outline-none border"
                        style={{ borderColor: "#F1F5F9", backgroundColor: "#F8FAFC", color: "#1F2937", minWidth: "80px" }}
                        placeholder="+ Add country"
                        onKeyDown={e => {
                          if ((e.key === "Enter" || e.key === ",") && e.target.value.trim()) {
                            e.preventDefault();
                            updateContinent(c.continent, "countries", [...(c.countries || []), e.target.value.trim()]);
                            e.target.value = "";
                          }
                        }} />
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: "#6B7280" }}>Press Enter or comma to add a country</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          <Save size={16} /> {saving ? "Saving..." : "Save International Settings"}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function AdminPricing() {
  const dispatch = useDispatch();
  const { config, loading } = useSelector((s) => s.pricing);
  const [tab, setTab] = useState("tax");
  const [saving, setSaving] = useState(false);

  useEffect(() => { dispatch(fetchPricingConfig()); }, [dispatch]);

  const handleTaxSave = async (taxCharges) => {
    setSaving(true);
    const result = await dispatch(updateTaxCharges(taxCharges));
    setSaving(false);
    if (updateTaxCharges.fulfilled.match(result)) toast.success("Tax settings saved!");
    else toast.error(result.payload || "Save failed");
  };

  const handleDistrictSave = async (data) => {
    setSaving(true);
    const result = await dispatch(updateDistrictFees(data));
    setSaving(false);
    if (updateDistrictFees.fulfilled.match(result)) toast.success("District fees saved!");
    else toast.error(result.payload || "Save failed");
  };

  const handleIntlSave = async (data) => {
    setSaving(true);
    const result = await dispatch(updateInternational(data));
    setSaving(false);
    if (updateInternational.fulfilled.match(result)) toast.success("International delivery saved!");
    else toast.error(result.payload || "Save failed");
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#1F2937" }}>Pricing & Charges</h1>
        <p className="text-sm mt-1" style={{ color: "#6B7280" }}>
          Manage taxes, VAT, and delivery fees for Sri Lanka and international orders
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Tab active={tab === "tax"} onClick={() => setTab("tax")} icon={Percent} label="Tax & VAT"
          badge={config?.taxCharges?.filter(c => c.isEnabled).length || 0} />
        <Tab active={tab === "local"} onClick={() => setTab("local")} icon={Truck} label="Sri Lanka Districts"
          badge={config?.localDelivery?.districts?.length || 25} />
        <Tab active={tab === "intl"} onClick={() => setTab("intl")} icon={Globe} label="International"
          badge={config?.internationalDelivery?.continents?.filter(c => c.isEnabled).length || 0} />
      </div>

      {/* Tab Content */}
      {tab === "tax" && <TaxChargesTab config={config} onSave={handleTaxSave} saving={saving} />}
      {tab === "local" && <DistrictsTab config={config} onSave={handleDistrictSave} saving={saving} />}
      {tab === "intl" && <InternationalTab config={config} onSave={handleIntlSave} saving={saving} />}
    </div>
  );
}
