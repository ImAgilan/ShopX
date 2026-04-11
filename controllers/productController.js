const Product = require("../models/Product");
const Category = require("../models/Category");

exports.getProducts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;
  const query = { isActive: true };
  if (req.query.category) query.category = req.query.category;
  if (req.query.featured === "true") query.isFeatured = true;
  if (req.query.upcoming === "true") query.isUpcoming = true;
  if (req.query.search) query.$or = [{ name: { $regex: req.query.search, $options: "i" } }, { description: { $regex: req.query.search, $options: "i" } }];
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
  }
  let sort = "-createdAt";
  if (req.query.sort === "price_asc") sort = "price";
  else if (req.query.sort === "price_desc") sort = "-price";
  else if (req.query.sort === "rating") sort = "-rating";
  const [products, total] = await Promise.all([
    Product.find(query).populate("category", "name slug").sort(sort).skip(skip).limit(limit),
    Product.countDocuments(query)
  ]);
  res.json({ success: true, data: products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
};

exports.getProduct = async (req, res) => {
  const product = await Product.findOne({ $or: [{ _id: req.params.id }, { slug: req.params.id }], isActive: true })
    .populate("category", "name slug").populate("reviews.user", "name avatar");
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });
  res.json({ success: true, data: product });
};

exports.createProduct = async (req, res) => {
  req.body.createdBy = req.user.id;
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
};

exports.updateProduct = async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });
  product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  res.json({ success: true, data: product });
};

exports.deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });
  product.isActive = false;
  await product.save();
  res.json({ success: true, message: "Product deleted" });
};

exports.addReview = async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: "Product not found" });
  const alreadyReviewed = product.reviews.find(r => r.user.toString() === req.user.id.toString());
  if (alreadyReviewed) return res.status(400).json({ success: false, message: "Already reviewed" });
  product.reviews.push({ user: req.user.id, name: req.user.name, rating: Number(rating), comment });
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
  await product.save();
  res.status(201).json({ success: true, data: product.reviews });
};

exports.getCategories = async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort("sortOrder");
  res.json({ success: true, data: categories });
};

exports.createCategory = async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
};

exports.updateCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: category });
};

exports.deleteCategory = async (req, res) => {
  await Category.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ success: true, message: "Category deleted" });
};
