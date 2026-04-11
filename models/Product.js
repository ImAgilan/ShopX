const mongoose = require('mongoose');

// ─── Image Schema ─────────────────────────────────────────────────────────────
const ImageSchema = new mongoose.Schema({
  url:       { type: String, required: true },
  source:    { type: String, enum: ['upload', 'gdrive', 'url'], default: 'url' },
  driveId:   { type: String },          // Google Drive file ID (parsed from link)
  isPrimary: { type: Boolean, default: false },
  alt:       { type: String, default: '' },
}, { _id: false });

// ─── Review Schema ────────────────────────────────────────────────────────────
const ReviewSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:    { type: String, required: true },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  isVerifiedPurchase: { type: Boolean, default: false },
}, { timestamps: true });

// ─── Product Schema ───────────────────────────────────────────────────────────
const ProductSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  slug:         { type: String, unique: true, sparse: true },
  description:  { type: String, required: true },
  price:        { type: Number, required: true, min: 0 },
  comparePrice: { type: Number, default: 0 },
  category:     { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  brand:        { type: String, default: '' },
  stock:        { type: Number, required: true, default: 0, min: 0 },
  sku:          { type: String, default: '' },
  images:       { type: [ImageSchema], default: [] },
  video: {
    url:    { type: String, default: '' },
    source: { type: String, enum: ['upload', 'url'], default: 'url' },
  },
  tags:        { type: [String], default: [] },
  attributes:  { type: Map, of: String, default: {} },
  reviews:     [ReviewSchema],
  rating:      { type: Number, default: 0 },
  numReviews:  { type: Number, default: 0 },
  isFeatured:  { type: Boolean, default: false },
  isUpcoming:  { type: Boolean, default: false },
  isActive:    { type: Boolean, default: true },
  upcomingDate:{ type: Date },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Auto-generate slug
ProductSchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now().toString().slice(-4);
  }
  // Auto-calculate rating
  if (this.reviews.length > 0) {
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    this.rating = Math.round((total / this.reviews.length) * 10) / 10;
    this.numReviews = this.reviews.length;
  }
  next();
});

module.exports = mongoose.model('Product', ProductSchema);
