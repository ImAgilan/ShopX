require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const SiteSettings = require('../models/SiteSettings');
const LayoutConfig = require('../models/LayoutConfig');
const { ROLES, LAYOUT_SECTIONS } = require('../config/constants');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected for seeding...');
};

const seedData = async () => {
  await connectDB();
  
  // Clear existing data
  await Promise.all([User.deleteMany(), Category.deleteMany(), Product.deleteMany(), SiteSettings.deleteMany(), LayoutConfig.deleteMany()]);
  console.log('Data cleared...');

  // Create Super Admin
  const superAdmin = await User.create({
    name: 'Super Admin', email: 'superadmin@shopx.lk',
    password: 'admin123456', role: ROLES.SUPER_ADMIN,
  });
  const admin = await User.create({
    name: 'Admin User', email: 'admin@shopx.lk',
    password: 'admin123456', role: ROLES.ADMIN,
  });
  console.log('Users created...');

  // Categories
  const categories = await Category.insertMany([
    { name: 'Electronics', description: 'Electronics & Gadgets', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400', sortOrder: 1 },
    { name: 'Fashion', description: 'Clothing & Accessories', image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400', sortOrder: 2 },
    { name: 'Home & Garden', description: 'Home Essentials', image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400', sortOrder: 3 },
    { name: 'Sports', description: 'Sports & Outdoors', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400', sortOrder: 4 },
    { name: 'Books', description: 'Books & Education', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400', sortOrder: 5 },
  ]);
  console.log('Categories created...');

  // Products
  const products = await Product.insertMany([
    { name: 'Sony WH-1000XM5 Headphones', description: 'Industry-leading noise canceling wireless headphones with exceptional sound quality.', price: 89900, comparePrice: 99900, category: categories[0]._id, stock: 25, isFeatured: true, rating: 4.8, numReviews: 124, images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600', isPrimary: true }], createdBy: admin._id },
    { name: 'Samsung Galaxy S24 Ultra', description: 'The ultimate smartphone experience with S Pen and advanced AI features.', price: 249900, comparePrice: 279900, category: categories[0]._id, stock: 15, isFeatured: true, rating: 4.7, numReviews: 89, images: [{ url: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600', isPrimary: true }], createdBy: admin._id },
    { name: 'Apple MacBook Air M3', description: 'Supercharged by M3 chip. Thin, light, and blazing fast for any workflow.', price: 389900, category: categories[0]._id, stock: 10, isFeatured: true, rating: 4.9, numReviews: 203, images: [{ url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600', isPrimary: true }], createdBy: admin._id },
    { name: 'Cotton Batik Shirt - Sri Lanka Edition', description: 'Authentic Sri Lankan batik shirt with traditional patterns. Perfect for casual wear.', price: 3500, comparePrice: 4500, category: categories[1]._id, stock: 50, isFeatured: true, rating: 4.5, numReviews: 67, images: [{ url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600', isPrimary: true }], createdBy: admin._id },
    { name: 'Handmade Ceramic Tea Set', description: 'Beautiful handmade Ceylon tea set crafted by local artisans. Set of 6 cups with teapot.', price: 12500, category: categories[2]._id, stock: 30, isFeatured: true, rating: 4.6, numReviews: 45, images: [{ url: 'https://images.unsplash.com/photo-1563822249366-3efb23b8e0c9?w=600', isPrimary: true }], createdBy: admin._id },
    { name: 'Yoga Mat Premium', description: 'Non-slip, eco-friendly yoga mat. 6mm thick for joint protection.', price: 8900, category: categories[3]._id, stock: 40, isUpcoming: false, rating: 4.4, numReviews: 38, images: [{ url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600', isPrimary: true }], createdBy: admin._id },
    { name: 'iPhone 16 Pro Max - COMING SOON', description: 'The most advanced iPhone ever. Pre-order now for exclusive early access.', price: 299900, category: categories[0]._id, stock: 0, isUpcoming: true, upcomingDate: new Date('2025-03-01'), images: [{ url: 'https://images.unsplash.com/photo-1695048133143-c338f2f27a2f?w=600', isPrimary: true }], createdBy: admin._id },
  ]);
  console.log('Products created...');

  // Site Settings
  await SiteSettings.create({
    siteName: 'Shop-X', tagline: 'Sri Lanka\'s Premium Shopping Destination',
    primaryColor: '#E63946', secondaryColor: '#1D3557', accentColor: '#F4A261',
    currency: 'LKR', currencySymbol: 'Rs.', usdRate: 320,
    companyEmail: 'info@shopx.lk', companyPhone: '+94 11 234 5678',
    companyAddress: 'No. 42, Galle Road, Colombo 03, Sri Lanka',
    footerText: '© 2024 Shop-X. All rights reserved. Made with ❤️ in Sri Lanka',
    shippingFee: 350, freeShippingThreshold: 5000, taxRate: 0,
  });

  // Layout Config
  await LayoutConfig.create({
    page: 'homepage',
    sections: LAYOUT_SECTIONS.map((id, index) => ({
      id, name: id, label: id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      isEnabled: true, order: index, settings: {}
    })),
    lastUpdatedBy: superAdmin._id,
  });

  console.log('✅ Seeding complete!');
  console.log('Super Admin: superadmin@shopx.lk / admin123456');
  console.log('Admin: admin@shopx.lk / admin123456');
  mongoose.disconnect();
};

seedData().catch(err => { console.error(err); process.exit(1); });
