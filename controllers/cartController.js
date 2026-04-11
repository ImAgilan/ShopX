const Cart = require("../models/Cart");
const Product = require("../models/Product");

exports.getCart = async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id }).populate("items.product", "name images price stock isActive");
  if (!cart) cart = await Cart.create({ user: req.user.id, items: [] });
  res.json({ success: true, data: cart });
};

exports.addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product || !product.isActive) return res.status(404).json({ success: false, message: "Product not found" });
  if (product.stock < quantity) return res.status(400).json({ success: false, message: "Insufficient stock" });
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) cart = new Cart({ user: req.user.id, items: [] });
  const existingItem = cart.items.find(i => i.product.toString() === productId);
  if (existingItem) {
    existingItem.quantity += quantity;
    existingItem.price = product.price;
  } else {
    cart.items.push({ product: productId, quantity, price: product.price });
  }
  await cart.save();
  await cart.populate("items.product", "name images price stock");
  res.json({ success: true, data: cart });
};

exports.updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });
  const item = cart.items.id(req.params.itemId);
  if (!item) return res.status(404).json({ success: false, message: "Item not found" });
  if (quantity <= 0) {
    cart.items.pull(req.params.itemId);
  } else {
    item.quantity = quantity;
  }
  await cart.save();
  await cart.populate("items.product", "name images price stock");
  res.json({ success: true, data: cart });
};

exports.removeFromCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });
  cart.items.pull(req.params.itemId);
  await cart.save();
  res.json({ success: true, data: cart });
};

exports.clearCart = async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });
  res.json({ success: true, message: "Cart cleared" });
};

exports.syncCart = async (req, res) => {
  const { items } = req.body;
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) cart = new Cart({ user: req.user.id, items: [] });
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product || !product.isActive) continue;
    const existing = cart.items.find(i => i.product.toString() === item.productId);
    if (existing) { existing.quantity = Math.max(existing.quantity, item.quantity); existing.price = product.price; }
    else cart.items.push({ product: item.productId, quantity: item.quantity, price: product.price });
  }
  await cart.save();
  await cart.populate("items.product", "name images price stock");
  res.json({ success: true, data: cart });
};
