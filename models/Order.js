const mongoose = require('mongoose');
const { ORDER_STATUS, PAYMENT_METHODS, PAYMENT_STATUS } = require('../config/constants');

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const ShippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  district: { type: String, required: true },
  province: { type: String, required: true },
  postalCode: { type: String },
  phone: { type: String, required: true },
});

const OrderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
  shippingAddress: ShippingAddressSchema,
  paymentMethod: {
    type: String, enum: Object.values(PAYMENT_METHODS),
    required: true, default: PAYMENT_METHODS.COD
  },
  paymentStatus: {
    type: String, enum: Object.values(PAYMENT_STATUS),
    default: PAYMENT_STATUS.PENDING
  },
  paymentResult: {
    transactionId: String,
    status: String,
    paymentMethod: String,
    paidAt: Date,
    rawResponse: mongoose.Schema.Types.Mixed,
  },
  itemsPrice: { type: Number, required: true, default: 0 },
  shippingPrice: { type: Number, required: true, default: 0 },
  taxPrice: { type: Number, required: true, default: 0 },
  totalPrice: { type: Number, required: true, default: 0 },
  currency: { type: String, default: 'LKR' },
  pricingBreakdown: {
    subtotal: { type: Number, default: 0 },
    taxes: [{
      name:       { type: String },
      chargeType: { type: String },   // renamed from 'type' — Mongoose reserves that keyword
      value:      { type: Number },
      amount:     { type: Number },
    }],
    totalTax: { type: Number, default: 0 },
    deliveryFee: { type: Number, default: 0 },
    deliveryCurrency: { type: String, default: 'LKR' },
    freeShipping: { type: Boolean, default: false },
    grandTotal: { type: Number, default: 0 },
    estimatedDays: { type: String },
    isInternational: { type: Boolean, default: false },
    country: { type: String },
    district: { type: String },
  },
  orderStatus: {
    type: String, enum: Object.values(ORDER_STATUS),
    default: ORDER_STATUS.PENDING
  },
  statusHistory: [{
    status: String,
    note: String,
    updatedAt: { type: Date, default: Date.now },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  }],
  notes: { type: String },
  isDelivered: { type: Boolean, default: false },
  deliveredAt: { type: Date },
}, { timestamps: true });

OrderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = 'SX' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 100);
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);