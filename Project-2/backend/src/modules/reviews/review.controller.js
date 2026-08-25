const reviewService = require('./review.service');
const reviewView = require('./review.view');
const { createNotFoundError } = require('../../utils/errors');

/**
 * Product Reviews
 */

async function createProductReview(req, res, next) {
  try {
    const review = await reviewService.createProductReview(req.params.productId, req.user.id, req.body);
    return res.status(201).json({ success: true, data: reviewView.formatProductReview(review) });
  } catch (error) { next(error); }
}

async function getProductReviews(req, res, next) {
  try {
    const { reviews, total, stats } = await reviewService.getProductReviews(req.params.productId, req.query);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    return res.status(200).json({
      success: true,
      data: {
        items: reviews.map(reviewView.formatProductReview),
        stats,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
      },
    });
  } catch (error) { next(error); }
}

async function updateProductReview(req, res, next) {
  try {
    const review = await reviewService.updateProductReview(req.params.id, req.user.id, req.body);
    return res.status(200).json({ success: true, data: reviewView.formatProductReview(review) });
  } catch (error) { next(error); }
}

async function deleteProductReview(req, res, next) {
  try {
    const result = await reviewService.deleteProductReview(req.params.id, req.user.id, req.user.role);
    return res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
}

/**
 * Store Reviews
 */

async function createStoreReview(req, res, next) {
  try {
    const review = await reviewService.createStoreReview(req.params.storeId, req.user.id, req.body);
    return res.status(201).json({ success: true, data: reviewView.formatStoreReview(review) });
  } catch (error) { next(error); }
}

async function getStoreReviews(req, res, next) {
  try {
    const { reviews, total, stats } = await reviewService.getStoreReviews(req.params.storeId, req.query);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    return res.status(200).json({
      success: true,
      data: {
        items: reviews.map(reviewView.formatStoreReview),
        stats,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
      },
    });
  } catch (error) { next(error); }
}

async function updateStoreReview(req, res, next) {
  try {
    const review = await reviewService.updateStoreReview(req.params.id, req.user.id, req.body);
    return res.status(200).json({ success: true, data: reviewView.formatStoreReview(review) });
  } catch (error) { next(error); }
}

async function deleteStoreReview(req, res, next) {
  try {
    const result = await reviewService.deleteStoreReview(req.params.id, req.user.id, req.user.role);
    return res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
}

/**
 * Unified Review Operations (product or store)
 */

async function updateReview(req, res, next) {
  try {
    const found = await reviewService.findReviewType(req.params.id);
    if (!found) throw createNotFoundError('Review not found');

    if (found.type === 'product') {
      const review = await reviewService.updateProductReview(req.params.id, req.user.id, req.body);
      return res.status(200).json({ success: true, data: reviewView.formatProductReview(review) });
    }
    const review = await reviewService.updateStoreReview(req.params.id, req.user.id, req.body);
    return res.status(200).json({ success: true, data: reviewView.formatStoreReview(review) });
  } catch (error) { next(error); }
}

async function deleteReview(req, res, next) {
  try {
    const found = await reviewService.findReviewType(req.params.id);
    if (!found) throw createNotFoundError('Review not found');

    if (found.type === 'product') {
      const result = await reviewService.deleteProductReview(req.params.id, req.user.id, req.user.role);
      return res.status(200).json({ success: true, data: result });
    }
    const result = await reviewService.deleteStoreReview(req.params.id, req.user.id, req.user.role);
    return res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
}

module.exports = {
  createProductReview,
  getProductReviews,
  updateProductReview,
  deleteProductReview,
  createStoreReview,
  getStoreReviews,
  updateStoreReview,
  deleteStoreReview,
  updateReview,
  deleteReview,
};
