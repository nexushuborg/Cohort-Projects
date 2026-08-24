const service = require('./inventory.service');

/**
 * GET /products/:productId/inventory — List inventory for all SKUs
 */
const list = async (req, res, next) => {
  try {
    const items = await service.getInventoryByProduct(req.params.productId, req.user.id, req.user.role);
    return res.status(200).json({
      success: true,
      data: items.map((s) => ({
        skuId: s.id,
        productId: s.product_id,
        skuCode: s.sku_code,
        stockQuantity: s.stock_quantity,
        status: s.status,
        updatedAt: s.updated_at,
      })),
    });
  } catch (err) { next(err); }
};

/**
 * GET /products/:productId/inventory/:skuId — Get inventory for a specific SKU
 */
const getOne = async (req, res, next) => {
  try {
    const sku = await service.getInventory(req.params.productId, req.params.skuId, req.user.id, req.user.role);
    return res.status(200).json({
      success: true,
      data: {
        skuId: sku.id,
        productId: sku.product_id,
        skuCode: sku.sku_code,
        stockQuantity: sku.stock_quantity,
        status: sku.status,
        updatedAt: sku.updated_at,
      },
    });
  } catch (err) { next(err); }
};

/**
 * PUT /products/:productId/inventory/:skuId — Set stock to absolute value
 */
const setStock = async (req, res, next) => {
  try {
    const sku = await service.setStock(req.params.productId, req.params.skuId, req.body.quantity, req.user.id, req.user.role);
    return res.status(200).json({
      success: true,
      data: {
        skuId: sku.id,
        productId: sku.product_id,
        skuCode: sku.sku_code,
        stockQuantity: sku.stock_quantity,
        status: sku.status,
        updatedAt: sku.updated_at,
      },
    });
  } catch (err) { next(err); }
};

/**
 * PATCH /products/:productId/inventory/:skuId — Adjust stock by relative delta
 */
const adjustStock = async (req, res, next) => {
  try {
    const sku = await service.adjustStock(req.params.productId, req.params.skuId, req.body.quantity, req.user.id, req.user.role);
    return res.status(200).json({
      success: true,
      data: {
        skuId: sku.id,
        productId: sku.product_id,
        skuCode: sku.sku_code,
        stockQuantity: sku.stock_quantity,
        status: sku.status,
        updatedAt: sku.updated_at,
      },
    });
  } catch (err) { next(err); }
};

module.exports = { list, getOne, setStock, adjustStock };
