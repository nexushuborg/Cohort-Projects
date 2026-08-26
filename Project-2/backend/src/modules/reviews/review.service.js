const reviewRepo = require('./review.repository');
const productRepo = require('../products/product.repository');
const sellerRepo = require('../sellers/seller.repository');
const {
  createNotFoundError,
  createValidationError,
  createForbiddenError,
  createConflictError,
} = require('../../utils/errors');

/**
 * Product Reviews
 */

async function createProductReview(productId, userId, data) {
  const product = await productRepo.findById(productId);
  if (!product) throw createNotFoundError('Product not found');

  const existing = await reviewRepo.findProductReviewByUserAndProduct(userId, productId);
  if (existing) throw createConflictError('You have already reviewed this product');

  return reviewRepo.createProductReview({ productId, userId, rating: data.rating, text: data.text });
}

async function getProductReviews(productId, params) {
  const product = await productRepo.findById(productId);
  if (!product) throw createNotFoundError('Product not found');

  const { reviews, total } = await reviewRepo.findProductReviewsByProductId(productId, params);
  const stats = await reviewRepo.getProductReviewStats(productId);

  return { reviews, total, stats };
}

async function getProductReviewById(reviewId) {
  const review = await reviewRepo.findProductReviewById(reviewId);
  if (!review) throw createNotFoundError('Review not found');
  return review;
}

async function updateProductReview(reviewId, userId, data) {
  const review = await reviewRepo.findProductReviewById(reviewId);
  if (!review) throw createNotFoundError('Review not found');
  if (review.user_id !== userId) throw createForbiddenError('You can only edit your own reviews');

  return reviewRepo.updateProductReview(reviewId, { rating: data.rating, text: data.text });
}

async function deleteProductReview(reviewId, userId, userRole) {
  const review = await reviewRepo.findProductReviewById(reviewId);
  if (!review) throw createNotFoundError('Review not found');
  if (review.user_id !== userId && userRole !== 'admin') {
    throw createForbiddenError('You can only delete your own reviews');
  }

  await reviewRepo.deleteProductReview(reviewId);
  return { message: 'Review deleted successfully' };
}

/**
 * Store Reviews
 */

async function createStoreReview(storeId, userId, data) {
  const store = await sellerRepo.findStoreById(storeId);
  if (!store) throw createNotFoundError('Store not found');

  const existing = await reviewRepo.findStoreReviewByUserAndStore(userId, storeId);
  if (existing) throw createConflictError('You have already reviewed this store');

  return reviewRepo.createStoreReview({ storeId, userId, rating: data.rating, text: data.text });
}

async function getStoreReviews(storeId, params) {
  const store = await sellerRepo.findStoreById(storeId);
  if (!store) throw createNotFoundError('Store not found');

  const { reviews, total } = await reviewRepo.findStoreReviewsByStoreId(storeId, params);
  const stats = await reviewRepo.getStoreReviewStats(storeId);

  return { reviews, total, stats };
}

async function getStoreReviewById(reviewId) {
  const review = await reviewRepo.findStoreReviewById(reviewId);
  if (!review) throw createNotFoundError('Review not found');
  return review;
}

async function updateStoreReview(reviewId, userId, data) {
  const review = await reviewRepo.findStoreReviewById(reviewId);
  if (!review) throw createNotFoundError('Review not found');
  if (review.user_id !== userId) throw createForbiddenError('You can only edit your own reviews');

  return reviewRepo.updateStoreReview(reviewId, { rating: data.rating, text: data.text });
}

async function deleteStoreReview(reviewId, userId, userRole) {
  const review = await reviewRepo.findStoreReviewById(reviewId);
  if (!review) throw createNotFoundError('Review not found');
  if (review.user_id !== userId && userRole !== 'admin') {
    throw createForbiddenError('You can only delete your own reviews');
  }

  await reviewRepo.deleteStoreReview(reviewId);
  return { message: 'Review deleted successfully' };
}

/**
 * Unified Review Operations (product or store)
 */

async function findReviewType(reviewId) {
  return reviewRepo.findReviewById(reviewId);
}

async function updateReview(reviewId, userId, data) {
  const found = await reviewRepo.findReviewById(reviewId);
  if (!found) throw createNotFoundError('Review not found');

  if (found.type === 'product') {
    return updateProductReview(reviewId, userId, data);
  }
  return updateStoreReview(reviewId, userId, data);
}

async function deleteReview(reviewId, userId, userRole) {
  const found = await reviewRepo.findReviewById(reviewId);
  if (!found) throw createNotFoundError('Review not found');

  if (found.type === 'product') {
    return deleteProductReview(reviewId, userId, userRole);
  }
  return deleteStoreReview(reviewId, userId, userRole);
}

module.exports = {
  createProductReview,
  getProductReviews,
  getProductReviewById,
  updateProductReview,
  deleteProductReview,
  createStoreReview,
  getStoreReviews,
  getStoreReviewById,
  updateStoreReview,
  deleteStoreReview,
  updateReview,
  deleteReview,
  findReviewType,
};
