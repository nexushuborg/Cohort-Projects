const service = require('./cart.service');

/**
 * GET /cart — Get the buyer's cart with items grouped by seller
 */
const getCart = async (req, res, next) => {
  try {
    const cart = await service.getCart(req.user.id);
    return res.status(200).json({ success: true, data: cart });
  } catch (err) { next(err); }
};

/**
 * POST /cart/items — Add an item to the cart
 */
const addItem = async (req, res, next) => {
  try {
    const { skuId, quantity } = req.body;
    const { item, isUpdate } = await service.addItem(req.user.id, skuId, quantity);
    const statusCode = isUpdate ? 200 : 201;
    return res.status(statusCode).json({
      success: true,
      data: {
        id: item.id,
        skuId: item.sku_id,
        quantity: item.quantity,
        updatedAt: item.updated_at,
      },
    });
  } catch (err) { next(err); }
};

/**
 * PUT /cart/items/:id — Update quantity of a cart item
 */
const updateItem = async (req, res, next) => {
  try {
    const updated = await service.updateQuantity(req.user.id, req.params.id, req.body.quantity);
    return res.status(200).json({
      success: true,
      data: {
        id: updated.id,
        skuId: updated.sku_id,
        quantity: updated.quantity,
        updatedAt: updated.updated_at,
      },
    });
  } catch (err) { next(err); }
};

/**
 * DELETE /cart/items/:id — Remove a single cart item
 */
const removeItem = async (req, res, next) => {
  try {
    await service.removeItem(req.user.id, req.params.id);
    return res.status(200).json({
      success: true,
      data: { message: 'Cart item removed successfully' },
    });
  } catch (err) { next(err); }
};

/**
 * DELETE /cart — Clear all items from the buyer's cart
 */
const clearCart = async (req, res, next) => {
  try {
    const count = await service.clearCart(req.user.id);
    return res.status(200).json({
      success: true,
      data: { message: 'Cart cleared successfully', removedCount: count },
    });
  } catch (err) { next(err); }
};

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
