const path = require('path');
const fs = require('fs');
const repository = require('./product-image.repository');
const productRepository = require('../products/product.repository');

const UPLOAD_DIR = 'uploads/products';

/**
 * Allowed MIME types and max size (from PRD)
 */
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Validate uploaded file
 */
const validateFile = (file) => {
  if (!file) {
    const error = new Error('No file uploaded');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    const error = new Error('Invalid file type. Allowed: jpg, png, webp');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  if (file.size > MAX_SIZE) {
    const error = new Error('File too large. Maximum size: 5MB');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
};

/**
 * Upload a product image
 * - Validates file
 * - Verifies product exists
 * - Calculates next sort_order
 * - Creates DB record
 */
const uploadImage = async (productId, file) => {
  validateFile(file);

  // Verify product exists
  const product = await productRepository.findById(productId);
  if (!product) {
    // Clean up uploaded file
    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    const error = new Error('Product not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // Get next sort_order (max + 1)
  const maxSort = await repository.getMaxSortOrder(productId);
  const sortOrder = maxSort + 1;

  // Build the URL path
  const url = '/uploads/products/' + path.basename(file.path);

  const imageData = {
    product_id: productId,
    url,
    sort_order: sortOrder,
  };

  return repository.create(imageData);
};

/**
 * Get all images for a product
 */
const getImagesByProductId = async (productId) => {
  // Verify product exists
  const product = await productRepository.findById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  return repository.findByProductId(productId);
};

/**
 * Get a single image by ID
 */
const getImageById = async (imageId) => {
  const image = await repository.findById(imageId);
  if (!image) {
    const error = new Error('Image not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  return image;
};

/**
 * Set an image as primary (sort_order = 0)
 *
 * 1. Find the target image
 * 2. Verify it belongs to the specified product
 * 3. Find the current primary (sort_order = 0)
 * 4. If current primary is the target, no-op
 * 5. Otherwise: swap — old primary gets target's sort_order, target gets 0
 * Uses a transaction for consistency.
 */
const setPrimaryImage = async (productId, imageId) => {
  // Verify product exists
  const product = await productRepository.findById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // Verify image exists and belongs to product
  const targetImage = await repository.findById(imageId);
  if (!targetImage) {
    const error = new Error('Image not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  if (targetImage.product_id !== productId) {
    const error = new Error('Image does not belong to this product');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  // Already primary
  if (targetImage.sort_order === 0) {
    return targetImage;
  }

  // Find current primary image (sort_order = 0)
  const images = await repository.findByProductId(productId);
  const currentPrimary = images.find((img) => img.sort_order === 0);

  if (currentPrimary) {
    // Swap: old primary gets target's sort_order, target gets 0
    await repository.bulkUpdateSortOrder([
      { id: currentPrimary.id, sort_order: targetImage.sort_order },
      { id: targetImage.id, sort_order: 0 },
    ]);
  } else {
    // No current primary — just set target to 0
    await repository.update(targetImage.id, { sort_order: 0 });
  }

  // Return the updated target image
  return repository.findById(imageId);
};

/**
 * Delete a product image
 * - Verifies image exists
 * - Removes from DB
 * - Removes file from disk if it exists
 */
const deleteImage = async (productId, imageId) => {
  // Verify product exists
  const product = await productRepository.findById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // Verify image exists and belongs to product
  const image = await repository.findById(imageId);
  if (!image) {
    const error = new Error('Image not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  if (image.product_id !== productId) {
    const error = new Error('Image does not belong to this product');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  // Remove DB record
  await repository.remove(imageId);

  // Remove file from disk (best-effort)
  if (image.url) {
    const filePath = path.join(process.cwd(), image.url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }

  return true;
};

module.exports = {
  uploadImage,
  getImagesByProductId,
  getImageById,
  setPrimaryImage,
  deleteImage,
  validateFile,
  ALLOWED_TYPES,
  MAX_SIZE,
};
