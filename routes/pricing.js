const express = require('express');
const router = express.Router();
const {
  getPricingConfig, updatePricingConfig,
  updateTaxCharges, updateDistrictFees, updateInternationalDelivery,
  calculateTotal, validateDriveLink, getDistricts,
} = require('../controllers/pricingController');
const { protect, superAdmin, adminOrAbove } = require('../middleware/auth');

// Public
router.get('/districts', getDistricts);
router.post('/calculate', calculateTotal);
router.post('/validate-drive-link', validateDriveLink);

// Admin
router.get('/config', protect, adminOrAbove, getPricingConfig);
router.put('/config', protect, superAdmin, updatePricingConfig);
router.put('/tax-charges', protect, superAdmin, updateTaxCharges);
router.put('/district-fees', protect, superAdmin, updateDistrictFees);
router.put('/international', protect, superAdmin, updateInternationalDelivery);

module.exports = router;
