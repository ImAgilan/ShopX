const PricingConfig = require('../models/PricingConfig');

const getConfig = async () => PricingConfig.findOne();

const calculateTaxes = (subtotal, taxCharges = []) => {
  const applied = [];
  let totalTax = 0;
  for (const charge of taxCharges) {
    if (!charge.isEnabled) continue;
    const base = charge.appliesTo === 'subtotal' ? subtotal : subtotal + totalTax;
    const amount = charge.type === 'percentage'
      ? parseFloat(((base * charge.value) / 100).toFixed(2))
      : parseFloat(charge.value.toFixed(2));
    applied.push({ name: charge.name, chargeType: charge.type, value: charge.value, amount });
    totalTax += amount;
  }
  return { applied, totalTax: parseFloat(totalTax.toFixed(2)) };
};

const getLocalDeliveryFee = (district, localDelivery, subtotal) => {
  if (!localDelivery?.isEnabled) return { fee: 0, estimatedDays: 'N/A', freeShipping: false };
  if (subtotal >= (localDelivery.freeThreshold || 5000)) return { fee: 0, estimatedDays: '2-3', freeShipping: true };
  const d = localDelivery.districts?.find(x => x.district?.toLowerCase() === district?.toLowerCase() && x.isEnabled);
  return { fee: d?.fee ?? localDelivery.defaultFee ?? 350, estimatedDays: d?.estimatedDays ?? '2-3', freeShipping: false };
};

const getInternationalDeliveryFee = (country, internationalDelivery) => {
  if (!internationalDelivery?.isEnabled) return { fee: 0, currency: 'USD', estimatedDays: 'N/A', available: false };
  const c = internationalDelivery.continents?.find(x => x.isEnabled && x.countries?.some(ct => ct.toLowerCase() === country?.toLowerCase()));
  if (!c) return { fee: 0, currency: 'USD', estimatedDays: 'N/A', available: false };
  return { fee: c.fee, currency: c.currency, continent: c.continent, estimatedDays: c.estimatedDays, available: true };
};

const calculateOrderTotal = async ({ subtotal, district, country, isInternational = false }) => {
  const config = await getConfig();
  if (!config) return { subtotal, taxes: [], totalTax: 0, deliveryFee: 350, deliveryCurrency: 'LKR', freeShipping: false, grandTotal: subtotal + 350, estimatedDays: '2-3' };

  const { applied: taxes, totalTax } = calculateTaxes(subtotal, config.taxCharges);
  let deliveryFee = 0, deliveryCurrency = 'LKR', freeShipping = false, estimatedDays = '2-3';

  if (isInternational && country) {
    const intl = getInternationalDeliveryFee(country, config.internationalDelivery);
    deliveryFee = intl.fee; deliveryCurrency = intl.currency; estimatedDays = intl.estimatedDays;
  } else if (district) {
    const local = getLocalDeliveryFee(district, config.localDelivery, subtotal);
    deliveryFee = local.fee; freeShipping = local.freeShipping; estimatedDays = local.estimatedDays;
  }

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    taxes, totalTax, deliveryFee, deliveryCurrency, freeShipping,
    grandTotal: parseFloat((subtotal + totalTax + deliveryFee).toFixed(2)),
    estimatedDays,
  };
};

module.exports = { calculateOrderTotal, calculateTaxes, getLocalDeliveryFee, getConfig };