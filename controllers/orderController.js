const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { ORDER_STATUS, PAYMENT_METHODS } = require("../config/constants");
const { calculateOrderTotal } = require("../services/pricingService");

exports.createOrder = async (req, res) => {
  const { shippingAddress, paymentMethod, items, currency = "LKR", notes, isInternational = false, country } = req.body;
  if (!items || items.length === 0) return res.status(400).json({ success: false, message: "No items in order" });

  let itemsPrice = 0;
  const orderItems = [];
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) return res.status(404).json({ success: false, message: "Product not found: " + item.product });
    if (product.stock < item.quantity) return res.status(400).json({ success: false, message: "Insufficient stock for " + product.name });
    orderItems.push({ product: product._id, name: product.name, image: product.images[0]?.url || "", price: product.price, quantity: item.quantity });
    itemsPrice += product.price * item.quantity;
    product.stock -= item.quantity;
    await product.save();
  }

  // Use pricing service for accurate calculation
  const pricing = await calculateOrderTotal({
    subtotal: itemsPrice,
    district: shippingAddress?.district,
    country: country || shippingAddress?.country,
    isInternational,
  });

  const order = await Order.create({
    user: req.user.id, items: orderItems, shippingAddress, paymentMethod,
    itemsPrice: pricing.subtotal,
    shippingPrice: pricing.deliveryFee,
    taxPrice: pricing.totalTax,
    totalPrice: pricing.grandTotal,
    currency, notes,
    pricingBreakdown: {
      ...pricing,
      isInternational,
      country: country || shippingAddress?.country,
      district: shippingAddress?.district,
    },
    statusHistory: [{ status: ORDER_STATUS.PENDING, note: "Order placed", updatedBy: req.user.id }],
  });

  await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });
  res.status(201).json({ success: true, data: order });
};

exports.getMyOrders = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find({ user: req.user.id }).sort("-createdAt").skip(skip).limit(limit),
    Order.countDocuments({ user: req.user.id })
  ]);
  res.json({ success: true, data: orders, pagination: { page, limit, total } });
};

exports.getOrder = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  if (order.user._id.toString() !== req.user.id.toString() && !["admin","super_admin"].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }
  res.json({ success: true, data: order });
};

exports.getAllOrders = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const query = {};
  if (req.query.status) query.orderStatus = req.query.status;
  if (req.query.paymentMethod) query.paymentMethod = req.query.paymentMethod;
  if (req.query.search) query.orderNumber = { $regex: req.query.search, $options: "i" };
  const [orders, total] = await Promise.all([
    Order.find(query).populate("user", "name email").sort("-createdAt").skip(skip).limit(limit),
    Order.countDocuments(query)
  ]);
  const stats = await Order.aggregate([
    { $group: { _id: "$orderStatus", count: { $sum: 1 }, revenue: { $sum: "$totalPrice" } } }
  ]);
  res.json({ success: true, data: orders, stats, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
};

exports.updateOrderStatus = async (req, res) => {
  const { status, note } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: "Order not found" });
  order.orderStatus = status;
  if (status === "delivered") { order.isDelivered = true; order.deliveredAt = Date.now(); }
  if (status === "paid") { order.paymentStatus = "paid"; order.paymentResult = { ...order.paymentResult, paidAt: Date.now() }; }
  order.statusHistory.push({ status, note: note || "", updatedBy: req.user.id });
  await order.save();
  res.json({ success: true, data: order });
};

exports.getDashboardStats = async (req, res) => {
  const [totalOrders, totalRevenue, pendingOrders, totalProducts, totalCustomers, recentOrders] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalPrice" } } }]),
    Order.countDocuments({ orderStatus: "pending" }),
    require("../models/Product").countDocuments({ isActive: true }),
    require("../models/User").countDocuments({ role: "customer" }),
    Order.find().populate("user","name email").sort("-createdAt").limit(5)
  ]);
  const monthlyRevenue = await Order.aggregate([
    { $match: { paymentStatus: "paid", createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)) } } },
    { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, revenue: { $sum: "$totalPrice" }, orders: { $sum: 1 } } },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);
  res.json({ success: true, data: {
    totalOrders, totalRevenue: totalRevenue[0]?.total || 0, pendingOrders,
    totalProducts, totalCustomers, recentOrders, monthlyRevenue
  }});
};
