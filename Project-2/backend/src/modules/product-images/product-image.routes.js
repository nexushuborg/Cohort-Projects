const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const router = express.Router({ mergeParams: true });
const controller = require('./product-image.controller');
const validate = require('../../middleware/validate.middleware');
const { validateParams } = require('../../middleware/validate.middleware');
const authenticateToken = require('../../middleware/auth.middleware');
const requireRole = require('../../middleware/rbac.middleware');
const {
  productParamsSchema,
  imageParamsSchema,
} = require('./product-image.validation');

// ─── Multer Configuration ───────────────────────────────────────
// Storage: files saved to uploads/products/ with unique names
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads', 'products'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

// File filter: only jpg, png, webp
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Allowed: jpg, png, webp'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// ─── Public Routes ──────────────────────────────────────────────

// GET /products/:productId/images — Get all images for a product
router.get('/',
  validateParams(productParamsSchema),
  controller.getByProductId
);

// ─── Protected Routes (Seller) ──────────────────────────────────

// POST /products/:productId/images — Upload an image
// TODO: When Person 1's auth is ready, uncomment middleware:
// router.post('/', authenticateToken, requireRole('seller'), validateParams(productParamsSchema), upload.single('image'), controller.upload);
router.post('/',
  validateParams(productParamsSchema),
  upload.single('image'),
  controller.upload
);

// PUT /products/:productId/images/:imageId/primary — Set primary image
// TODO: When Person 1's auth is ready, uncomment middleware:
// router.put('/:imageId/primary', authenticateToken, requireRole('seller'), validateParams(imageParamsSchema), controller.setPrimary);
router.put('/:imageId/primary',
  validateParams(imageParamsSchema),
  controller.setPrimary
);

// DELETE /products/:productId/images/:imageId — Delete an image
// TODO: When Person 1's auth is ready, uncomment middleware:
// router.delete('/:imageId', authenticateToken, requireRole('seller'), validateParams(imageParamsSchema), controller.remove);
router.delete('/:imageId',
  validateParams(imageParamsSchema),
  controller.remove
);

module.exports = router;
