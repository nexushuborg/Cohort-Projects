const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

// Import Modules
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const sellerRoutes = require('./modules/sellers/seller.routes');
const categoryRoutes = require('./modules/categories/category.routes');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Rate Limiting
const limiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests, please try again later.',
    },
  },
});
app.use(limiter);

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/health', (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'multi-vendor-marketplace-api',
    },
  });
});

// Mount Feature Modules (Person 1 Ownership)
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/sellers', sellerRoutes);
app.use('/categories', categoryRoutes);

// Placeholder routes for Person 2 modules to prevent breaking callers if hit
app.use('/products', (req, res, next) => {
  if (req.method === 'GET' && req.path === '/') {
    return res.status(200).json({ success: true, data: { items: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } } });
  }
  next();
});

// 404 & Global Error Handling Middleware
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
