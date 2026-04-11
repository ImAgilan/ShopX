const SiteSettings = require("../models/SiteSettings");
const LayoutConfig = require("../models/LayoutConfig");
const { LAYOUT_SECTIONS } = require("../config/constants");

const getDefaultSections = () => LAYOUT_SECTIONS.map((id, index) => ({
  id, name: id, label: id.replace(/_/g," ").replace(/\w/g,c=>c.toUpperCase()),
  isEnabled: true, order: index, settings: {}
}));

exports.getSiteSettings = async (req, res) => {
  let settings = await SiteSettings.findOne();
  if (!settings) settings = await SiteSettings.create({});
  res.json({ success: true, data: settings });
};

exports.updateSiteSettings = async (req, res) => {
  let settings = await SiteSettings.findOne();
  if (!settings) settings = new SiteSettings();
  Object.assign(settings, req.body);
  await settings.save();
  res.json({ success: true, data: settings });
};

exports.getLayoutConfig = async (req, res) => {
  let layout = await LayoutConfig.findOne({ page: "homepage" });
  if (!layout) layout = await LayoutConfig.create({ page: "homepage", sections: getDefaultSections() });
  res.json({ success: true, data: layout });
};

exports.updateLayoutConfig = async (req, res) => {
  const { sections } = req.body;
  let layout = await LayoutConfig.findOne({ page: "homepage" });
  if (!layout) layout = new LayoutConfig({ page: "homepage" });
  layout.sections = sections;
  layout.lastUpdatedBy = req.user.id;
  await layout.save();
  res.json({ success: true, data: layout });
};

exports.toggleSection = async (req, res) => {
  const { sectionId, isEnabled } = req.body;
  const layout = await LayoutConfig.findOne({ page: "homepage" });
  if (!layout) return res.status(404).json({ success: false, message: "Layout not found" });
  const section = layout.sections.find(s => s.id === sectionId);
  if (!section) return res.status(404).json({ success: false, message: "Section not found" });
  section.isEnabled = isEnabled;
  await layout.save();
  res.json({ success: true, data: layout });
};

exports.reorderSections = async (req, res) => {
  const { orderedIds } = req.body;
  const layout = await LayoutConfig.findOne({ page: "homepage" });
  if (!layout) return res.status(404).json({ success: false, message: "Layout not found" });
  layout.sections = orderedIds.map((id, index) => {
    const section = layout.sections.find(s => s.id === id);
    if (section) { section.order = index; return section; }
    return null;
  }).filter(Boolean);
  await layout.save();
  res.json({ success: true, data: layout });
};
