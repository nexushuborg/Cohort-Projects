/**
 * Review View (Serialization)
 */

function formatReview(review) {
  if (!review) return null;
  return {
    id: review.id,
    userId: review.user_id,
    userName: review.user_name || null,
    rating: review.rating,
    text: review.text || null,
    createdAt: review.created_at,
    updatedAt: review.updated_at,
  };
}

function formatProductReview(review) {
  if (!review) return null;
  return {
    ...formatReview(review),
    productId: review.product_id,
  };
}

function formatStoreReview(review) {
  if (!review) return null;
  return {
    ...formatReview(review),
    storeId: review.store_id,
  };
}

module.exports = {
  formatReview,
  formatProductReview,
  formatStoreReview,
};
