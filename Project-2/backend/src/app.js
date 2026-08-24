const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const errorHandler = require('./middleware/error.middleware');

// Routes
const productRoutes = require('./modules/products/product.routes');
const productImageRoutes = require('./modules/product-images/product-image.routes');
const variantRoutes = require('./modules/variants/variant.routes');
const skuRoutes = require('./modules/skus/sku.routes');

const app = express();

// ─── Security ───────────────────────────────────────────────────
app.use(helmet());

// ─── CORS ───────────────────────────────────────────────────────
app.use(cors());

// ─── Body Parsing ───────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Request Logging ────────────────────────────────────────────
if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// ─── Rate Limiting ──────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ─── Static Files (uploads) ─────────────────────────────────────
app.use('/uploads', express.static('uploads'));

// ─── Health Check ───────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Multi-Vendor Marketplace API is running',
  });
});

// ─── API Routes ─────────────────────────────────────────────────
app.use('/products', productRoutes);
app.use('/products/:productId/images', productImageRoutes);
app.use('/products/:productId/variants', variantRoutes);
app.use('/products/:productId/skus', skuRoutes);

// TODO: When Person 1's modules are ready, mount them here:
// app.use('/auth', authRoutes);
// app.use('/sellers', sellerRoutes);
// app.use('/categories', categoryRoutes);

// TODO: Person 2 future routes (Phases 6-10):
// app.use('/cart', cartRoutes);
// app.use('/orders', orderRoutes);
// app.use('/seller-orders', sellerOrderRoutes);
// app.use('/payments', paymentRoutes);

// ─── 404 Handler ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
    },
  });
});

// ─── Global Error Handler ───────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────────────
if (require.main === module) {
  app.listen(env.port, () => {
    console.log(
      `Server running in ${env.nodeEnv} mode on port ${env.port}`
    );
  });
}

module.exports = app;
