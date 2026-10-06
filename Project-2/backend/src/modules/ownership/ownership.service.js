const sellerRepository = require('../sellers/seller.repository');
const productRepository = require('../products/product.repository');

/**
 * Verify that the authenticated user owns the store that the product belongs to.
 *
 * Flow:
 *   userId -> findStoreByOwnerId(userId) -> store
 *   productId -> productRepository.findById(productId) -> product
 *   product.store_id === store.id -> allow or deny
 *
 * Admin users bypass ownership check.
 *
 * @param {string} userId - The authenticated user's ID (req.user.id)
 * @param {string} productId - The product ID to check ownership for
 * @param {string} [userRole] - The user's role (req.user.role). Admins bypass.
 * @returns {object} The verified product record
 * @throws {Error} 403 if seller does not own the product's store
 * @throws {Error} 404 if product not found
 * @throws {Error} 403 if seller has no store
 */
async function verifyProductOwnership(userId, productId, userRole) {
  // Admins bypass ownership
  if (userRole === 'admin') {
    const product = await productRepository.findById(productId);
    if (!product) {
      const error = new Error('Product not found');
      error.status = 404;
      error.code = 'NOT_FOUND';
      throw error;
    }
    return product;
  }

  // Find the seller's store
  const store = await sellerRepository.findStoreByOwnerId(userId);
  if (!store) {
    const error = new Error('You do not have a registered store');
    error.status = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  // Find the product
  const product = await productRepository.findById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // Check ownership
  if (product.store_id !== store.id) {
    const error = new Error('You do not have permission to modify this product');
    error.status = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  return product;
}

/**
 * Verify that the authenticated user can create products for a given store.
 *
 * For sellers: the storeId must match their own store.
 * For admins: any store is allowed.
 *
 * @param {string} userId - The authenticated user's ID
 * @param {string} storeId - The store ID from the request body
 * @param {string} [userRole] - The user's role
 * @returns {object} The verified store record
 * @throws {Error} 403 if seller tries to create product for another store
 */
async function verifyStoreOwnership(userId, storeId, userRole) {
  // Admins can create products for any store
  if (userRole === 'admin') {
    return; // Skip store verification for admins
  }

  const store = await sellerRepository.findStoreByOwnerId(userId);
  if (!store) {
    const error = new Error('You do not have a registered store');
    error.status = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  if (store.id !== storeId) {
    const error = new Error('You can only create products for your own store');
    error.status = 403;
    error.code = 'FORBIDDEN';
    throw error;
  }

  return store;
}

module.exports = {
  verifyProductOwnership,
  verifyStoreOwnership,
};
