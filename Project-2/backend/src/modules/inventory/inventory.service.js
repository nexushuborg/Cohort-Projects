const repository = require('./inventory.repository');
const skuRepository = require('../skus/sku.repository');
const { verifyProductOwnership } = require('../ownership/ownership.service');

/**
 * Get inventory for a specific SKU.
 * Ownership: seller must own the product; admins bypass.
 */
const getInventory = async (productId, skuId, userId, userRole) => {
  await verifyProductOwnership(userId, productId, userRole);
  const sku = await repository.getInventoryBySkuId(skuId);
  if (!sku) {
    const error = new Error('SKU not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  if (sku.product_id !== productId) {
    const error = new Error('SKU does not belong to this product');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  return sku;
};

/**
 * Get inventory for all SKUs in a product.
 */
const getInventoryByProduct = async (productId, userId, userRole) => {
  await verifyProductOwnership(userId, productId, userRole);
  return repository.getInventoryByProductId(productId);
};

/**
 * Set stock to an absolute quantity.
 * Ownership: seller must own the product; admins bypass.
 */
const setStock = async (productId, skuId, quantity, userId, userRole) => {
  await verifyProductOwnership(userId, productId, userRole);
  const sku = await repository.getInventoryBySkuId(skuId);
  if (!sku) {
    const error = new Error('SKU not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  if (sku.product_id !== productId) {
    const error = new Error('SKU does not belong to this product');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  const updated = await repository.setStock(skuId, quantity);
  if (!updated) {
    const error = new Error('Failed to update stock');
    error.status = 500;
    error.code = 'INTERNAL_ERROR';
    throw error;
  }
  return updated;
};

/**
 * Adjust stock by a relative delta (increase or decrease).
 * Ownership: seller must own the product; admins bypass.
 */
const adjustStock = async (productId, skuId, quantity, userId, userRole) => {
  await verifyProductOwnership(userId, productId, userRole);
  const sku = await repository.getInventoryBySkuId(skuId);
  if (!sku) {
    const error = new Error('SKU not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  if (sku.product_id !== productId) {
    const error = new Error('SKU does not belong to this product');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  const updated = await repository.adjustStock(skuId, quantity);
  if (!updated) {
    if (quantity < 0) {
      const error = new Error('Insufficient stock');
      error.status = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }
    const error = new Error('Failed to adjust stock');
    error.status = 500;
    error.code = 'INTERNAL_ERROR';
    throw error;
  }
  return updated;
};

/**
 * Reduce stock (internal use — for checkout/order flow).
 * No ownership check — called by system-level operations.
 * Returns the updated SKU or throws if insufficient stock.
 */
const reduceStock = async (skuId, quantity) => {
  if (quantity <= 0) {
    const error = new Error('Quantity must be positive');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  const updated = await repository.adjustStock(skuId, -quantity);
  if (!updated) {
    const error = new Error('Insufficient stock');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  return updated;
};

/**
 * Restore stock (internal use — for cancellation).
 * No ownership check — called by system-level operations.
 */
const restoreStock = async (skuId, quantity) => {
  if (quantity <= 0) {
    const error = new Error('Quantity must be positive');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  const updated = await repository.adjustStock(skuId, quantity);
  if (!updated) {
    const error = new Error('Failed to restore stock');
    error.status = 500;
    error.code = 'INTERNAL_ERROR';
    throw error;
  }
  return updated;
};

module.exports = {
  getInventory,
  getInventoryByProduct,
  setStock,
  adjustStock,
  reduceStock,
  restoreStock,
};
