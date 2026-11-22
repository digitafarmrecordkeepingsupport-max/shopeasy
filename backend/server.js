require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to MongoDB Atlas
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check / Root
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'ShopEasy Backend API',
    database: 'MongoDB Atlas',
    media: 'Cloudinary',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/marketing', require('./routes/marketingRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 ShopEasy Backend Server running on port ${PORT}`);
  console.log(`📡 Base URL: http://localhost:${PORT}/api`);
});

module.exports = app;
