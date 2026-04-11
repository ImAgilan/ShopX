const Order = require("../models/Order");
const crypto = require("crypto");

exports.initiatePayhere = async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId).populate("user","name email");
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  if (order.user._id.toString() !== req.user.id.toString()) return res.status(403).json({ success: false, message: "Not authorized" });

  const merchantId = process.env.PAYHERE_MERCHANT_ID;
  const merchantSecret = process.env.PAYHERE_SECRET;
  const ordNum = order.orderNumber;
  const amount = order.totalPrice.toFixed(2);
  const currency = order.currency || "LKR";

  const hash = crypto.createHash("md5").update(
    merchantId + ordNum + amount + currency +
    crypto.createHash("md5").update(merchantSecret).digest("hex").toUpperCase()
  ).digest("hex").toUpperCase();

  const paymentData = {
    merchant_id: merchantId,
    return_url: process.env.FRONTEND_URL + "/order-success/" + orderId,
    cancel_url: process.env.FRONTEND_URL + "/order/" + orderId,
    notify_url: process.env.PAYHERE_NOTIFY_URL,
    order_id: ordNum,
    items: order.items.map(i => i.name).join(", ").substring(0, 255),
    currency,
    amount,
    first_name: order.shippingAddress.fullName.split(" ")[0],
    last_name: order.shippingAddress.fullName.split(" ").slice(1).join(" ") || ".",
    email: order.user.email,
    phone: order.shippingAddress.phone,
    address: order.shippingAddress.addressLine1,
    city: order.shippingAddress.city,
    country: "Sri Lanka",
    hash,
    payhereUrl: process.env.PAYHERE_MODE === "sandbox" ? process.env.PAYHERE_SANDBOX_URL : process.env.PAYHERE_LIVE_URL,
  };
  res.json({ success: true, data: paymentData });
};

exports.payhereNotify = async (req, res) => {
  const { merchant_id, order_id, payment_id, payhere_amount, payhere_currency, status_code, md5sig } = req.body;
  const merchantSecret = process.env.PAYHERE_SECRET;
  const localMd5 = crypto.createHash("md5").update(merchantSecret).digest("hex").toUpperCase();
  const expectedSig = crypto.createHash("md5").update(merchant_id + order_id + payhere_amount + payhere_currency + status_code + localMd5).digest("hex").toUpperCase();
  if (md5sig !== expectedSig) return res.status(400).send("Invalid signature");

  const order = await Order.findOne({ orderNumber: order_id });
  if (!order) return res.status(404).send("Order not found");

  if (status_code === "2") {
    order.paymentStatus = "paid";
    order.orderStatus = "paid";
    order.paymentResult = { transactionId: payment_id, status: "paid", paymentMethod: "payhere", paidAt: new Date(), rawResponse: req.body };
    order.statusHistory.push({ status: "paid", note: "Payment confirmed via PayHere", updatedAt: new Date() });
    await order.save();
  } else if (status_code === "-1" || status_code === "-2") {
    order.paymentStatus = "failed";
    await order.save();
  }
  res.send("OK");
};

exports.getPaymentStatus = async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  if (order.user.toString() !== req.user.id.toString() && !["admin","super_admin"].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }
  res.json({ success: true, data: { paymentStatus: order.paymentStatus, orderStatus: order.orderStatus, paymentResult: order.paymentResult } });
};
