const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

// ─── Routes - Person 1 Modules ───────────────────────────────
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const sellerRoutes = require('./modules/sellers/seller.routes');
const categoryRoutes = require('./modules/categories/category.routes');

// ─── Routes - Person 2 Modules ───────────────────────────────
const productRoutes = require('./modules/products/product.routes');
const productImageRoutes = require('./modules/product-images/product-image.routes');
const variantRoutes = require('./modules/variants/variant.routes');
const skuRoutes = require('./modules/skus/sku.routes');
const inventoryRoutes = require('./modules/inventory/inventory.routes');
const cartRoutes = require('./modules/cart/cart.routes');

const app = express();

// ─── Security ────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ────────────────────────────────────────────────────
app.use(cors());

// ─── Body Parsing ────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Request Logging ─────────────────────────────────────────
if (env.nodeEnv !== 'test' && env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Rate Limiting ───────────────────────────────────────────
const limiter = rateLimit({
  windowMs: env.rateLimitWindowMs || env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000,
  max: env.rateLimitMax || env.RATE_LIMIT_MAX || 500,
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
app.use('/api/', limiter);

// ─── Static Files (uploads) ──────────────────────────────────
app.use('/uploads', express.static('uploads'));

// ─── Health Check ────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Multi-Vendor Marketplace API is running',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'multi-vendor-marketplace-api',
    },
  });
});

// ─── Feature Routes (Person 1 Ownership) ─────────────────────
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/sellers', sellerRoutes);
app.use('/categories', categoryRoutes);

// ─── Feature Routes (Person 2 Ownership) ─────────────────────
app.use('/products', productRoutes);
app.use('/products/:productId/images', productImageRoutes);
app.use('/products/:productId/variants', variantRoutes);
app.use('/products/:productId/skus', skuRoutes);
app.use('/products/:productId/inventory', inventoryRoutes);

// ─── Cart (Buyer Only) ─────────────────────────────────────
app.use('/cart', cartRoutes);

// ─── 404 Handler & Global Error Handler ──────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────
if (require.main === module) {
  const port = env.port || env.PORT || 5000;
  app.listen(port, () => {
    console.log(
      `Server running in ${env.nodeEnv || env.NODE_ENV} mode on port ${port}`
    );
  });
}

module.exports = app;
