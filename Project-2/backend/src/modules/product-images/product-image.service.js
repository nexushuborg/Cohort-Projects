const path = require('path');
const fs = require('fs');
const repository = require('./product-image.repository');
const productRepository = require('../products/product.repository');
const { verifyProductOwnership } = require('../ownership/ownership.service');

const UPLOAD_DIR = 'uploads/products';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

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

const uploadImage = async (productId, file, userId, userRole) => {
  validateFile(file);
  // Ownership check
  await verifyProductOwnership(userId, productId, userRole);
  const maxSort = await repository.getMaxSortOrder(productId);
  const sortOrder = maxSort + 1;
  const url = '/uploads/products/' + path.basename(file.path);
  const imageData = { product_id: productId, url, sort_order: sortOrder };
  return repository.create(imageData);
};

const getImagesByProductId = async (productId) => {
  const product = await productRepository.findById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  return repository.findByProductId(productId);
};

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

const setPrimaryImage = async (productId, imageId, userId, userRole) => {
  // Ownership check
  await verifyProductOwnership(userId, productId, userRole);

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
  if (targetImage.sort_order === 0) {
    return targetImage;
  }
  const images = await repository.findByProductId(productId);
  const currentPrimary = images.find((img) => img.sort_order === 0);
  if (currentPrimary) {
    await repository.bulkUpdateSortOrder([
      { id: currentPrimary.id, sort_order: targetImage.sort_order },
      { id: targetImage.id, sort_order: 0 },
    ]);
  } else {
    await repository.update(targetImage.id, { sort_order: 0 });
  }
  return repository.findById(imageId);
};

const deleteImage = async (productId, imageId, userId, userRole) => {
  // Ownership check
  await verifyProductOwnership(userId, productId, userRole);

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
  await repository.remove(imageId);
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
