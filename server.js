require('express-async-errors');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

connectDB();

const app = express();

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart',     require('./routes/cart'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/payment',  require('./routes/payment'));
app.use('/api/pricing',  require('./routes/pricing'));

// Health check
app.get('/api/health', (req, res) =>
  res.json({ success: true, message: 'Shop-X API running 🚀', version: '1.0.0' })
);

// ── Serve React frontend (built by `npm run build`) ───────────────────────────
const FRONTEND_DIST = path.join(__dirname, 'frontend', 'dist');
app.use(express.static(FRONTEND_DIST));

// All non-API routes → React index.html (client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIST, 'index.html'));
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Shop-X running on port ${PORT} [${process.env.NODE_ENV || 'production'}]`)
);
