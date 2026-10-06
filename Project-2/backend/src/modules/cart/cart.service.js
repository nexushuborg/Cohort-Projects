const repository = require('./cart.repository');
const skuRepository = require('../skus/sku.repository');
const productRepository = require('../products/product.repository');
const inventoryRepository = require('../inventory/inventory.repository');

/**
 * Calculate the effective price for a SKU.
 * Uses price_override when set, otherwise falls back to product base price.
 */
const getEffectivePrice = (skuPriceOverride, productPrice) => {
  if (skuPriceOverride !== null && skuPriceOverride !== undefined) {
    return Number(skuPriceOverride);
  }
  return Number(productPrice);
};

/**
 * Format a single cart item for API response.
 */
const formatCartItem = (row) => {
  const effectivePrice = getEffectivePrice(row.price_override, row.product_price);
  return {
    id: row.id,
    skuId: row.sku_id,
    skuCode: row.sku_code,
    productId: row.product_id,
    productTitle: row.product_title,
    quantity: row.quantity,
    effectivePrice,
    subtotal: Number((effectivePrice * row.quantity).toFixed(2)),
    store: {
      id: row.store_id,
      name: row.store_name,
      slug: row.store_slug,
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

/**
 * Group cart items by store and calculate totals.
 */
const buildCartResponse = (rows) => {
  if (!rows || rows.length === 0) {
    return {
      items: [],
      groups: [],
      summary: {
        totalItems: 0,
        totalAmount: 0,
      },
    };
  }

  const items = rows.map(formatCartItem);

  // Group by store
  const storeMap = {};
  for (const item of items) {
    const storeId = item.store.id;
    if (!storeMap[storeId]) {
      storeMap[storeId] = {
        store: item.store,
        items: [],
        subtotal: 0,
      };
    }
    storeMap[storeId].items.push(item);
    storeMap[storeId].subtotal = Number(
      (storeMap[storeId].subtotal + item.subtotal).toFixed(2)
    );
  }

  const groups = Object.values(storeMap);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = Number(
    items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)
  );

  return {
    items,
    groups,
    summary: {
      totalItems,
      totalAmount,
    },
  };
};

/**
 * Add an item to the cart.
 * Validates SKU, product, stock, then upserts.
 */
const addItem = async (userId, skuId, quantity) => {
  // 1. Validate SKU exists
  const sku = await skuRepository.findSkuById(skuId);
  if (!sku) {
    const error = new Error('SKU not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // 2. Validate SKU is active
  if (sku.status !== 'active') {
    const error = new Error('SKU is not available');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  // 3. Validate product exists
  const product = await productRepository.findById(sku.product_id);
  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // 4. Validate product is active
  if (product.status !== 'active') {
    const error = new Error('Product is not available');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  // 5. Validate sufficient inventory
  const inventory = await inventoryRepository.getInventoryBySkuId(skuId);
  if (!inventory || inventory.stock_quantity < quantity) {
    const error = new Error('Insufficient stock');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  // 6. Upsert cart item (existing quantity is REPLACED, not added to)
  const { item, isUpdate } = await repository.upsert(userId, skuId, quantity);
  return { item, isUpdate };
};

/**
 * Get the full cart for a user, grouped by seller/store.
 */
const getCart = async (userId) => {
  const rows = await repository.findByUserId(userId);
  return buildCartResponse(rows);
};

/**
 * Update the quantity of a specific cart item.
 * Validates item ownership, stock, and quantity.
 */
const updateQuantity = async (userId, itemId, quantity) => {
  // 1. Validate item exists and belongs to user
  const item = await repository.findById(itemId, userId);
  if (!item) {
    const error = new Error('Cart item not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // 2. Validate sufficient inventory
  const inventory = await inventoryRepository.getInventoryBySkuId(item.sku_id);
  if (!inventory || inventory.stock_quantity < quantity) {
    const error = new Error('Insufficient stock');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }

  // 3. Update
  const updated = await repository.updateQuantity(itemId, userId, quantity);
  return updated;
};

/**
 * Remove a single cart item.
 * Validates item ownership before removal.
 */
const removeItem = async (userId, itemId) => {
  const item = await repository.findById(itemId, userId);
  if (!item) {
    const error = new Error('Cart item not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  const removed = await repository.removeItem(itemId, userId);
  return removed;
};

/**
 * Clear all items from the user's cart.
 */
const clearCart = async (userId) => {
  const count = await repository.clearCart(userId);
  return count;
};

module.exports = {
  addItem,
  getCart,
  updateQuantity,
  removeItem,
  clearCart,
  getEffectivePrice,
};
