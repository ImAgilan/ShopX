export const CURRENCIES = {
  LKR: { code: "LKR", symbol: "Rs.", rate: 1 },
  USD: { code: "USD", symbol: "$", rate: 0.0031 },
};

export const formatPrice = (amount, currency = "LKR", usdRate = 320) => {
  if (currency === "USD") {
    const usdAmount = amount / usdRate;
    return `$${usdAmount.toFixed(2)}`;
  }
  return `Rs. ${amount.toLocaleString("en-LK")}`;
};

export const convertPrice = (amount, fromCurrency, toCurrency, usdRate = 320) => {
  if (fromCurrency === toCurrency) return amount;
  if (fromCurrency === "LKR" && toCurrency === "USD") return amount / usdRate;
  if (fromCurrency === "USD" && toCurrency === "LKR") return amount * usdRate;
  return amount;
};

export const SRI_LANKA_PROVINCES = [
  "Western", "Central", "Southern", "Northern", "Eastern",
  "North Western", "North Central", "Uva", "Sabaragamuwa",
];

export const SRI_LANKA_DISTRICTS = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
  "Galle", "Hambantota", "Matara", "Jaffna", "Kilinochchi", "Mannar",
  "Mullaitivu", "Vavuniya", "Ampara", "Batticaloa", "Trincomalee",
  "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa",
  "Badulla", "Monaragala", "Ratnapura", "Kegalle",
];
