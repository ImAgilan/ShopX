const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  slug:        { type: String, unique: true, sparse: true },
  description: { type: String, default: '' },
  image: {
    url:     { type: String, default: '' },
    source:  { type: String, enum: ['upload', 'gdrive', 'url'], default: 'url' },
    driveId: { type: String, default: '' },
  },
  parent:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
  isActive:  { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

CategorySchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

module.exports = mongoose.model('Category', CategorySchema);
