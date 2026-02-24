require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const requestRoutes = require('./routes/requestRoutes');
const donationRoutes = require('./routes/donationRoutes');

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Blood Bank API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/donations', donationRoutes);

// API documentation endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Blood Bank Network API',
    version: '1.0.0',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'Login user',
        'GET /api/auth/me': 'Get current user',
        'PUT /api/auth/profile': 'Update profile',
        'PUT /api/auth/password': 'Change password',
        'POST /api/auth/logout': 'Logout user'
      },
      users: {
        'GET /api/users': 'Get all users (Admin)',
        'GET /api/users/stats': 'Get user statistics (Admin)',
        'GET /api/users/donors/search': 'Search donors',
        'GET /api/users/hospitals': 'Get all hospitals',
        'GET /api/users/donor/dashboard': 'Donor dashboard',
        'GET /api/users/patient/dashboard': 'Patient dashboard',
        'GET /api/users/hospital/dashboard': 'Hospital dashboard'
      },
      inventory: {
        'GET /api/inventory': 'Get hospital inventory',
        'GET /api/inventory/search': 'Search available blood',
        'GET /api/inventory/summary': 'Inventory summary',
        'GET /api/inventory/alerts/low-stock': 'Low stock alerts',
        'GET /api/inventory/alerts/expiring': 'Expiring alerts',
        'POST /api/inventory': 'Add blood to inventory',
        'PUT /api/inventory/:id': 'Update inventory item',
        'DELETE /api/inventory/:id': 'Delete inventory item'
      },
      requests: {
        'GET /api/requests': 'Get all requests',
        'GET /api/requests/my-requests': 'Get patient requests',
        'GET /api/requests/critical': 'Get critical requests',
        'POST /api/requests': 'Create emergency request',
        'PUT /api/requests/:id/status': 'Update request status',
        'PUT /api/requests/:id/cancel': 'Cancel request'
      },
      donations: {
        'GET /api/donations': 'Get all donations',
        'GET /api/donations/my-donations': 'Get donor donations',
        'GET /api/donations/stats': 'Donation statistics',
        'POST /api/donations': 'Record donation (Hospital)',
        'PUT /api/donations/:id': 'Update donation'
      }
    }
  });
});

// Handle 404
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════════════════════╗
  ║                                                              ║
  ║   🩸 Smart Blood Bank Network API                            ║
  ║                                                              ║
  ║   Server running in ${process.env.NODE_ENV || 'development'} mode                        ║
  ║   Port: ${PORT}                                                  ║
  ║   API: http://localhost:${PORT}/api                              ║
  ║   Health: http://localhost:${PORT}/health                        ║
  ║                                                              ║
  ╚══════════════════════════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});

module.exports = app;