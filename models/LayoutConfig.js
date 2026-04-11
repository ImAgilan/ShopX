const mongoose = require('mongoose');

const SectionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  label: { type: String, required: true },
  isEnabled: { type: Boolean, default: true },
  order: { type: Number, required: true },
  settings: { type: mongoose.Schema.Types.Mixed, default: {} },
});

const LayoutConfigSchema = new mongoose.Schema({
  page: { type: String, default: 'homepage', unique: true },
  sections: [SectionSchema],
  lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('LayoutConfig', LayoutConfigSchema);
