const mongoose = require('mongoose');

// ─── Tax / VAT Charge Schema ──────────────────────────────────────────────────
const TaxChargeSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },  // e.g. "VAT", "Tax"
  type:      { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
  value:     { type: Number, required: true, min: 0 },      // e.g. 15 (for 15%)
  isEnabled: { type: Boolean, default: true },
  appliesTo: { type: String, enum: ['subtotal', 'grand_total'], default: 'subtotal' },
}, { _id: true });

// ─── Sri Lanka District Delivery ─────────────────────────────────────────────
const DistrictDeliverySchema = new mongoose.Schema({
  district:    { type: String, required: true },
  province:    { type: String, required: true },
  fee:         { type: Number, required: true, default: 350 },
  extraKgFee:  { type: Number, default: 0 },
  isEnabled:   { type: Boolean, default: true },
  estimatedDays: { type: String, default: '2-3' },
}, { _id: true });

// ─── International Continent Delivery ────────────────────────────────────────
const ContinentDeliverySchema = new mongoose.Schema({
  continent:   { type: String, required: true },
  fee:         { type: Number, required: true, default: 0 },
  currency:    { type: String, default: 'USD' },
  isEnabled:   { type: Boolean, default: false },
  estimatedDays: { type: String, default: '7-14' },
  countries:   [{ type: String }],
}, { _id: true });

// ─── Main PricingConfig Schema ────────────────────────────────────────────────
const PricingConfigSchema = new mongoose.Schema({
  taxCharges:   { type: [TaxChargeSchema], default: [] },
  localDelivery: {
    isEnabled:       { type: Boolean, default: true },
    freeThreshold:   { type: Number, default: 5000 },  // free shipping above this
    defaultFee:      { type: Number, default: 350 },    // fallback if district not found
    districts:       { type: [DistrictDeliverySchema], default: [] },
  },
  internationalDelivery: {
    isEnabled:  { type: Boolean, default: false },
    continents: { type: [ContinentDeliverySchema], default: [] },
  },
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('PricingConfig', PricingConfigSchema);
