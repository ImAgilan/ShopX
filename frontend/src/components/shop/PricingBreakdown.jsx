import { Truck, Percent, Package, Globe, Clock, CheckCircle, Loader } from "lucide-react";
import { formatPrice } from "../../utils/currency";
import { useSelector } from "react-redux";

/**
 * PricingBreakdown — shows live calculated totals at checkout
 * Props:
 *   calculation: { subtotal, taxes[], totalTax, deliveryFee, deliveryCurrency, freeShipping, grandTotal, estimatedDays }
 *   calculating: boolean
 *   currency: "LKR" | "USD"
 *   usdRate: number
 */
export default function PricingBreakdown({ calculation, calculating, compact = false }) {
  const { currency, site } = useSelector((s) => s.settings);
  const usdRate = site?.usdRate || 320;

  if (!calculation && !calculating) return null;

  if (calculating) return (
    <div className="flex items-center gap-3 py-4 px-5 rounded-2xl" style={{ backgroundColor: "#F8FAFC" }}>
      <Loader size={18} className="animate-spin" style={{ color: "var(--primary)" }} />
      <span className="text-sm font-medium" style={{ color: "#6B7280" }}>Calculating charges...</span>
    </div>
  );

  const fmt = (amount, curr = "LKR") => {
    if (curr === "USD") return `$${amount.toFixed(2)}`;
    return formatPrice(amount, currency, usdRate);
  };

  const rows = [
    {
      icon: Package,
      label: "Subtotal",
      value: fmt(calculation.subtotal),
      color: "#1F2937",
    },
    ...calculation.taxes.map(tax => ({
      icon: Percent,
      label: `${tax.name} ${tax.chargeType === "percentage" ? `(${tax.value}%)` : "(fixed)"}`,
      value: `+ ${fmt(tax.amount)}`,
      color: "#F59E0B",
    })),
    {
      icon: calculation.freeShipping ? CheckCircle : Truck,
      label: calculation.freeShipping
        ? "Delivery (Free!)"
        : `Delivery${calculation.estimatedDays ? ` · Est. ${calculation.estimatedDays} days` : ""}`,
      value: calculation.freeShipping
        ? "FREE"
        : calculation.deliveryFee === 0
          ? "Calculated at shipping"
          : `+ ${fmt(calculation.deliveryFee, calculation.deliveryCurrency)}`,
      color: calculation.freeShipping ? "#10B981" : "#6B7280",
      highlight: calculation.freeShipping,
    },
  ];

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #F1F5F9" }}>
      {/* Rows */}
      <div className="divide-y" style={{ borderColor: "#F1F5F9" }}>
        {rows.map((row, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-2.5">
              <row.icon size={15} style={{ color: row.color }} />
              <span className="text-sm" style={{ color: "#6B7280" }}>{row.label}</span>
            </div>
            <span className={`text-sm font-semibold ${row.highlight ? "text-green-500" : ""}`}
              style={!row.highlight ? { color: row.color } : {}}>
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Grand Total */}
      <div className="px-5 py-4 flex items-center justify-between"
        style={{ backgroundColor: "var(--primary)", background: `linear-gradient(135deg, var(--primary), #1F2937)` }}>
        <span className="text-base font-bold text-white">Grand Total</span>
        <span className="text-xl font-black text-white">{fmt(calculation.grandTotal)}</span>
      </div>

      {/* Delivery estimate */}
      {calculation.estimatedDays && !compact && (
        <div className="px-5 py-2.5 flex items-center gap-2 text-xs"
          style={{ backgroundColor: "#F8FAFC", color: "#6B7280" }}>
          <Clock size={12} />
          Estimated delivery: <strong className="ml-1">{calculation.estimatedDays} business days</strong>
        </div>
      )}
    </div>
  );
}