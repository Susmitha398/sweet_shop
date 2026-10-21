require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { ensureMongoSeeded } = require('./controllers/sweetController');

// Import routes
const sweetRoutes = require('./routes/sweetRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*', // Allows frontend on any port during local development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api', sweetRoutes);
app.use('/api', orderRoutes);
app.use('/api/auth', authRoutes);

// Health check and root
app.get('/', (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'Royal Sweet Shop API (Express.js)',
    version: '1.0.0',
    endpoints: {
      categories: '/api/categories',
      sweets: '/api/sweets',
      alwaSweets: '/api/sweets?category=alwa',
      orders: '/api/orders',
      auth: '/api/auth/login'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server and connect DB
const startServer = async () => {
  await connectDB();
  await ensureMongoSeeded();

  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` Royal Sweet Shop Backend Running on Port ${PORT}`);
    console.log(` API Base URL: http://localhost:${PORT}/api`);
    console.log(`===============================================`);
  });
};

startServer();

module.exports = app;
