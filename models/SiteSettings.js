const mongoose = require('mongoose');

const SiteSettingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'Shop-X' },
  tagline: { type: String, default: 'Your Premium Shopping Destination' },
  logo: { type: String, default: '' },
  favicon: { type: String, default: '' },
  primaryColor: { type: String, default: '#E63946' },
  secondaryColor: { type: String, default: '#1D3557' },
  accentColor: { type: String, default: '#F4A261' },
  themeMode: { type: String, enum: ['light', 'dark'], default: 'light' },
  fontFamily: { type: String, default: 'Inter' },
  currency: { type: String, enum: ['LKR', 'USD'], default: 'LKR' },
  currencySymbol: { type: String, default: 'Rs.' },
  usdRate: { type: Number, default: 320 },
  companyEmail: { type: String, default: 'info@shopx.lk' },
  companyPhone: { type: String, default: '+94 11 234 5678' },
  companyAddress: { type: String, default: 'Colombo, Sri Lanka' },
  footerText: { type: String, default: '© 2024 Shop-X. All rights reserved.' },
  socialLinks: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    twitter: { type: String, default: '' },
    youtube: { type: String, default: '' },
    whatsapp: { type: String, default: '' },
  },
  metaTitle: { type: String, default: 'Shop-X - Premium Shopping' },
  metaDescription: { type: String, default: 'Shop the best products at Shop-X' },
  shippingFee: { type: Number, default: 350 },
  freeShippingThreshold: { type: Number, default: 5000 },
  taxRate: { type: Number, default: 0 },
  maintenanceMode: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', SiteSettingsSchema);
