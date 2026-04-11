const express = require("express");
const router = express.Router();
const { initiatePayhere, payhereNotify, getPaymentStatus } = require("../controllers/paymentController");
const { allRoles } = require("../middleware/auth");

router.post("/payhere/initiate", ...allRoles, initiatePayhere);
router.post("/payhere/notify", payhereNotify);
router.get("/status/:orderId", ...allRoles, getPaymentStatus);

module.exports = router;
