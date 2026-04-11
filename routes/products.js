const express = require("express");
const router = express.Router();
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct, addReview, getCategories, createCategory, updateCategory, deleteCategory } = require("../controllers/productController");
const { protect, adminOrAbove, allRoles } = require("../middleware/auth");

router.get("/", getProducts);
router.get("/categories", getCategories);
router.post("/categories", ...adminOrAbove, createCategory);
router.put("/categories/:id", ...adminOrAbove, updateCategory);
router.delete("/categories/:id", ...adminOrAbove, deleteCategory);
router.get("/:id", getProduct);
router.post("/", ...adminOrAbove, createProduct);
router.put("/:id", ...adminOrAbove, updateProduct);
router.delete("/:id", ...adminOrAbove, deleteProduct);
router.post("/:id/reviews", protect, addReview);

module.exports = router;
