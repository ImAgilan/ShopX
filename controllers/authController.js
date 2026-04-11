const User = require("../models/User");
const { ROLES } = require("../config/constants");

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
  });
};

exports.register = async (req, res) => {
  const { name, email, password, phone } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ success: false, message: "Email already registered" });
  const user = await User.create({ name, email, password, phone, role: ROLES.CUSTOMER });
  sendTokenResponse(user, 201, res);
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }
  sendTokenResponse(user, 200, res);
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id).populate("wishlist", "name images price");
  res.json({ success: true, data: user });
};

exports.updateProfile = async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findByIdAndUpdate(req.user.id, { name, phone, avatar }, { new: true, runValidators: true });
  res.json({ success: true, data: user });
};

exports.addAddress = async (req, res) => {
  const user = await User.findById(req.user.id);
  if (req.body.isDefault) user.addresses.forEach(a => a.isDefault = false);
  user.addresses.push(req.body);
  await user.save();
  res.json({ success: true, data: user.addresses });
};

exports.getAllUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const query = {};
  if (req.query.role) query.role = req.query.role;
  if (req.query.search) query.$or = [{ name: { $regex: req.query.search, $options: "i" } }, { email: { $regex: req.query.search, $options: "i" } }];
  const [users, total] = await Promise.all([User.find(query).skip(skip).limit(limit).sort("-createdAt"), User.countDocuments(query)]);
  res.json({ success: true, data: users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
};

exports.updateUserRole = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, data: user });
};

exports.toggleUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  user.isActive = !user.isActive;
  await user.save();
  res.json({ success: true, data: user });
};
