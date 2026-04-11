const PricingConfig = require('../models/PricingConfig');
const { SRI_LANKA_DISTRICTS, CONTINENTS } = require('../config/sriLankaDistricts');
const { calculateOrderTotal, getConfig } = require('../services/pricingService');
const { validateDriveLink } = require('../services/googleDriveService');

// ─── GET pricing config (admin) ───────────────────────────────────────────────
exports.getPricingConfig = async (req, res) => {
  try {
    let config = await PricingConfig.findOne();
    if (!config) config = await seedDefaultPricingConfig();
    res.json({ success: true, data: config });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPDATE full pricing config (super admin) ─────────────────────────────────
exports.updatePricingConfig = async (req, res) => {
  try {
    let config = await PricingConfig.findOne();
    if (!config) {
      config = new PricingConfig(req.body);
    } else {
      Object.assign(config, req.body);
    }
    config.lastUpdatedBy = req.user._id;
    await config.save();
    res.json({ success: true, data: config });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPDATE only tax charges ──────────────────────────────────────────────────
exports.updateTaxCharges = async (req, res) => {
  try {
    const { taxCharges } = req.body;
    let config = await PricingConfig.findOne();
    if (!config) config = new PricingConfig();
    config.taxCharges = taxCharges;
    config.lastUpdatedBy = req.user._id;
    await config.save();
    res.json({ success: true, data: config.taxCharges });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPDATE district fees ─────────────────────────────────────────────────────
exports.updateDistrictFees = async (req, res) => {
  try {
    const { districts, freeThreshold, defaultFee, isEnabled } = req.body;
    let config = await PricingConfig.findOne();
    if (!config) config = new PricingConfig();
    config.localDelivery.districts = districts;
    if (freeThreshold !== undefined) config.localDelivery.freeThreshold = freeThreshold;
    if (defaultFee !== undefined) config.localDelivery.defaultFee = defaultFee;
    if (isEnabled !== undefined) config.localDelivery.isEnabled = isEnabled;
    config.lastUpdatedBy = req.user._id;
    await config.save();
    res.json({ success: true, data: config.localDelivery });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── UPDATE international delivery ───────────────────────────────────────────
exports.updateInternationalDelivery = async (req, res) => {
  try {
    const { continents, isEnabled } = req.body;
    let config = await PricingConfig.findOne();
    if (!config) config = new PricingConfig();
    config.internationalDelivery.continents = continents;
    if (isEnabled !== undefined) config.internationalDelivery.isEnabled = isEnabled;
    config.lastUpdatedBy = req.user._id;
    await config.save();
    res.json({ success: true, data: config.internationalDelivery });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── CALCULATE order total (public endpoint for checkout preview) ─────────────
exports.calculateTotal = async (req, res) => {
  try {
    const { subtotal, district, country, isInternational } = req.body;
    if (!subtotal || subtotal < 0) return res.status(400).json({ success: false, message: 'Valid subtotal required' });
    const result = await calculateOrderTotal({ subtotal: Number(subtotal), district, country, isInternational: Boolean(isInternational) });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── VALIDATE Google Drive link ───────────────────────────────────────────────
exports.validateDriveLink = async (req, res) => {
  try {
    const { url } = req.body;
    const result = validateDriveLink(url);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET districts list (public, for checkout address form) ──────────────────
exports.getDistricts = async (req, res) => {
  try {
    let config = await PricingConfig.findOne();
    // Return configured fees if available, otherwise defaults
    const districts = config?.localDelivery?.districts?.length
      ? config.localDelivery.districts
      : SRI_LANKA_DISTRICTS;
    res.json({ success: true, data: districts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Seed helper ─────────────────────────────────────────────────────────────
const seedDefaultPricingConfig = async () => {
  const config = new PricingConfig({
    taxCharges: [
      { name: 'VAT', type: 'percentage', value: 0, isEnabled: false, appliesTo: 'subtotal' },
    ],
    localDelivery: {
      isEnabled: true, freeThreshold: 5000, defaultFee: 350,
      districts: SRI_LANKA_DISTRICTS.map(d => ({ ...d, isEnabled: true })),
    },
    internationalDelivery: {
      isEnabled: false,
      continents: CONTINENTS.map(c => ({ ...c, isEnabled: false })),
    },
  });
  await config.save();
  return config;
};
