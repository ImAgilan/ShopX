const express = require("express");
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeFromCart, clearCart, syncCart } = require("../controllers/cartController");
const { allRoles } = require("../middleware/auth");

router.get("/", ...allRoles, getCart);
router.post("/", ...allRoles, addToCart);
router.post("/sync", ...allRoles, syncCart);
router.put("/:itemId", ...allRoles, updateCartItem);
router.delete("/clear", ...allRoles, clearCart);
router.delete("/:itemId", ...allRoles, removeFromCart);

module.exports = router;
