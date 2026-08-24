const service = require('./sku.service');

const create = async (req, res, next) => {
  try {
    const sku = await service.createSku(req.params.productId, req.body, req.user.id, req.user.role);
    return res.status(201).json({ success: true, data: { id: sku.id, productId: sku.product_id, skuCode: sku.sku_code, priceOverride: sku.price_override, stockQuantity: sku.stock_quantity, status: sku.status, createdAt: sku.created_at } });
  } catch (err) { next(err); }
};

const getAll = async (req, res, next) => {
  try {
    const skus = await service.getSkusByProductId(req.params.productId);
    return res.status(200).json({ success: true, data: skus.map((s) => ({ id: s.id, productId: s.product_id, skuCode: s.sku_code, priceOverride: s.price_override, stockQuantity: s.stock_quantity, status: s.status, createdAt: s.created_at })) });
  } catch (err) { next(err); }
};

const getById = async (req, res, next) => {
  try {
    const sku = await service.getSkuById(req.params.productId, req.params.skuId);
    return res.status(200).json({ success: true, data: { id: sku.id, productId: sku.product_id, skuCode: sku.sku_code, priceOverride: sku.price_override, stockQuantity: sku.stock_quantity, status: sku.status, createdAt: sku.created_at, variants: (sku.variants || []).map((v) => ({ variantTypeId: v.type_id, typeName: v.type_name, variantOptionId: v.variant_option_id, optionValue: v.option_value })) } });
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const sku = await service.updateSku(req.params.productId, req.params.skuId, req.body, req.user.id, req.user.role);
    return res.status(200).json({ success: true, data: { id: sku.id, productId: sku.product_id, skuCode: sku.sku_code, priceOverride: sku.price_override, stockQuantity: sku.stock_quantity, status: sku.status, createdAt: sku.created_at, variants: (sku.variants || []).map((v) => ({ variantTypeId: v.type_id, typeName: v.type_name, variantOptionId: v.variant_option_id, optionValue: v.option_value })) } });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await service.deleteSku(req.params.productId, req.params.skuId, req.user.id, req.user.role);
    return res.status(200).json({ success: true, data: { message: 'SKU deleted successfully' } });
  } catch (err) { next(err); }
};

module.exports = { create, getAll, getById, update, remove };
