const express = require("express");
const router = express.Router();
const { createOrder, getMyOrders, getOrder, getAllOrders, updateOrderStatus, getDashboardStats } = require("../controllers/orderController");
const { allRoles, adminOrAbove } = require("../middleware/auth");

router.post("/", ...allRoles, createOrder);
router.get("/my", ...allRoles, getMyOrders);
router.get("/all", ...adminOrAbove, getAllOrders);
router.get("/dashboard/stats", ...adminOrAbove, getDashboardStats);
router.get("/:id", ...allRoles, getOrder);
router.put("/:id/status", ...adminOrAbove, updateOrderStatus);

module.exports = router;
