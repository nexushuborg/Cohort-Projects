const reviewService = require('./review.service');
const reviewRepo = require('./review.repository');
const productRepo = require('../products/product.repository');
const sellerRepo = require('../sellers/seller.repository');
const { generateId } = require('../../../tests/helpers');

jest.mock('./review.repository');
jest.mock('../products/product.repository');
jest.mock('../sellers/seller.repository');

describe('Review Service', () => {
  const userId = generateId();
  const productId = generateId();
  const storeId = generateId();
  const reviewId = generateId();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── Product Reviews ────────────────────────────────────

  describe('createProductReview', () => {
    it('should create a product review', async () => {
      productRepo.findById.mockResolvedValue({ id: productId });
      reviewRepo.findProductReviewByUserAndProduct.mockResolvedValue(null);
      reviewRepo.createProductReview.mockResolvedValue({ id: reviewId, product_id: productId, user_id: userId, rating: 5, text: 'Great!' });

      const result = await reviewService.createProductReview(productId, userId, { rating: 5, text: 'Great!' });
      expect(result.rating).toBe(5);
      expect(reviewRepo.createProductReview).toHaveBeenCalled();
    });

    it('should throw if product not found', async () => {
      productRepo.findById.mockResolvedValue(null);
      await expect(reviewService.createProductReview(productId, userId, { rating: 5 }))
        .rejects.toThrow('Product not found');
    });

    it('should throw if duplicate review', async () => {
      productRepo.findById.mockResolvedValue({ id: productId });
      reviewRepo.findProductReviewByUserAndProduct.mockResolvedValue({ id: reviewId });
      await expect(reviewService.createProductReview(productId, userId, { rating: 5 }))
        .rejects.toThrow('already reviewed');
    });
  });

  describe('getProductReviews', () => {
    it('should return reviews with stats', async () => {
      productRepo.findById.mockResolvedValue({ id: productId });
      reviewRepo.findProductReviewsByProductId.mockResolvedValue({ reviews: [], total: 0 });
      reviewRepo.getProductReviewStats.mockResolvedValue({ review_count: 0, avg_rating: 0 });

      const result = await reviewService.getProductReviews(productId, {});
      expect(result.reviews).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should throw if product not found', async () => {
      productRepo.findById.mockResolvedValue(null);
      await expect(reviewService.getProductReviews(productId, {}))
        .rejects.toThrow('Product not found');
    });
  });

  describe('updateProductReview', () => {
    it('should update own review', async () => {
      reviewRepo.findProductReviewById.mockResolvedValue({ id: reviewId, user_id: userId });
      reviewRepo.updateProductReview.mockResolvedValue({ id: reviewId, rating: 4 });

      const result = await reviewService.updateProductReview(reviewId, userId, { rating: 4 });
      expect(result.rating).toBe(4);
    });

    it('should throw if review not found', async () => {
      reviewRepo.findProductReviewById.mockResolvedValue(null);
      await expect(reviewService.updateProductReview(reviewId, userId, { rating: 4 }))
        .rejects.toThrow('Review not found');
    });

    it('should throw if not owner', async () => {
      reviewRepo.findProductReviewById.mockResolvedValue({ id: reviewId, user_id: generateId() });
      await expect(reviewService.updateProductReview(reviewId, userId, { rating: 4 }))
        .rejects.toThrow('own reviews');
    });
  });

  describe('deleteProductReview', () => {
    it('should delete own review', async () => {
      reviewRepo.findProductReviewById.mockResolvedValue({ id: reviewId, user_id: userId });
      reviewRepo.deleteProductReview.mockResolvedValue();
      const result = await reviewService.deleteProductReview(reviewId, userId, 'buyer');
      expect(result.message).toContain('deleted');
    });

    it('should allow admin to delete', async () => {
      reviewRepo.findProductReviewById.mockResolvedValue({ id: reviewId, user_id: generateId() });
      reviewRepo.deleteProductReview.mockResolvedValue();
      const result = await reviewService.deleteProductReview(reviewId, generateId(), 'admin');
      expect(result.message).toContain('deleted');
    });

    it('should throw if not owner and not admin', async () => {
      reviewRepo.findProductReviewById.mockResolvedValue({ id: reviewId, user_id: generateId() });
      await expect(reviewService.deleteProductReview(reviewId, generateId(), 'buyer'))
        .rejects.toThrow('own reviews');
    });
  });

  // ─── Store Reviews ──────────────────────────────────────

  describe('createStoreReview', () => {
    it('should create a store review', async () => {
      sellerRepo.findStoreById.mockResolvedValue({ id: storeId });
      reviewRepo.findStoreReviewByUserAndStore.mockResolvedValue(null);
      reviewRepo.createStoreReview.mockResolvedValue({ id: reviewId, store_id: storeId, user_id: userId, rating: 4 });

      const result = await reviewService.createStoreReview(storeId, userId, { rating: 4 });
      expect(result.rating).toBe(4);
    });

    it('should throw if store not found', async () => {
      sellerRepo.findStoreById.mockResolvedValue(null);
      await expect(reviewService.createStoreReview(storeId, userId, { rating: 4 }))
        .rejects.toThrow('Store not found');
    });
  });

  describe('getStoreReviews', () => {
    it('should return store reviews', async () => {
      sellerRepo.findStoreById.mockResolvedValue({ id: storeId });
      reviewRepo.findStoreReviewsByStoreId.mockResolvedValue({ reviews: [], total: 0 });
      reviewRepo.getStoreReviewStats.mockResolvedValue({ review_count: 0, avg_rating: 0 });

      const result = await reviewService.getStoreReviews(storeId, {});
      expect(result.reviews).toEqual([]);
    });
  });

  describe('updateStoreReview', () => {
    it('should update own store review', async () => {
      reviewRepo.findStoreReviewById.mockResolvedValue({ id: reviewId, user_id: userId });
      reviewRepo.updateStoreReview.mockResolvedValue({ id: reviewId, rating: 3 });

      const result = await reviewService.updateStoreReview(reviewId, userId, { rating: 3 });
      expect(result.rating).toBe(3);
    });

    it('should throw if not owner', async () => {
      reviewRepo.findStoreReviewById.mockResolvedValue({ id: reviewId, user_id: generateId() });
      await expect(reviewService.updateStoreReview(reviewId, userId, { rating: 3 }))
        .rejects.toThrow('own reviews');
    });
  });

  describe('deleteStoreReview', () => {
    it('should delete own store review', async () => {
      reviewRepo.findStoreReviewById.mockResolvedValue({ id: reviewId, user_id: userId });
      reviewRepo.deleteStoreReview.mockResolvedValue();
      const result = await reviewService.deleteStoreReview(reviewId, userId, 'buyer');
      expect(result.message).toContain('deleted');
    });

    it('should throw if not owner and not admin', async () => {
      reviewRepo.findStoreReviewById.mockResolvedValue({ id: reviewId, user_id: generateId() });
      await expect(reviewService.deleteStoreReview(reviewId, generateId(), 'buyer'))
        .rejects.toThrow('own reviews');
    });
  });
});
