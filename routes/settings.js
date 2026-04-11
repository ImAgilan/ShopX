const express = require("express");
const router = express.Router();
const { getSiteSettings, updateSiteSettings, getLayoutConfig, updateLayoutConfig, toggleSection, reorderSections } = require("../controllers/siteSettingsController");
const { superAdmin } = require("../middleware/auth");

router.get("/", getSiteSettings);
router.put("/", ...superAdmin, updateSiteSettings);
router.get("/layout", getLayoutConfig);
router.put("/layout", ...superAdmin, updateLayoutConfig);
router.put("/layout/toggle", ...superAdmin, toggleSection);
router.put("/layout/reorder", ...superAdmin, reorderSections);

module.exports = router;
