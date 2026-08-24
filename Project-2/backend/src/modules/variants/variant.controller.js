const service = require('./variant.service');

const createType = async (req, res, next) => {
  try {
    const type = await service.createVariantType(req.params.productId, req.body, req.user.id, req.user.role);
    return res.status(201).json({ success: true, data: { id: type.id, productId: type.product_id, name: type.name, createdAt: type.created_at } });
  } catch (err) { next(err); }
};

const getTypesByProductId = async (req, res, next) => {
  try {
    const types = await service.getVariantTypesByProductId(req.params.productId);
    return res.status(200).json({ success: true, data: types.map((t) => ({ id: t.id, productId: t.product_id, name: t.name, createdAt: t.created_at })) });
  } catch (err) { next(err); }
};

const getTypeById = async (req, res, next) => {
  try {
    const type = await service.getVariantTypeById(req.params.productId, req.params.variantTypeId);
    return res.status(200).json({ success: true, data: { id: type.id, productId: type.product_id, name: type.name, createdAt: type.created_at, options: (type.options || []).map((o) => ({ id: o.id, value: o.value, createdAt: o.created_at })) } });
  } catch (err) { next(err); }
};

const updateType = async (req, res, next) => {
  try {
    const type = await service.updateVariantType(req.params.productId, req.params.variantTypeId, req.body, req.user.id, req.user.role);
    return res.status(200).json({ success: true, data: { id: type.id, productId: type.product_id, name: type.name, createdAt: type.created_at } });
  } catch (err) { next(err); }
};

const deleteType = async (req, res, next) => {
  try {
    await service.deleteVariantType(req.params.productId, req.params.variantTypeId, req.user.id, req.user.role);
    return res.status(200).json({ success: true, data: { message: 'Variant type deleted successfully' } });
  } catch (err) { next(err); }
};

const createOption = async (req, res, next) => {
  try {
    const option = await service.createVariantOption(req.params.productId, req.params.variantTypeId, req.body, req.user.id, req.user.role);
    return res.status(201).json({ success: true, data: { id: option.id, variantTypeId: option.variant_type_id, value: option.value, createdAt: option.created_at } });
  } catch (err) { next(err); }
};

const updateOption = async (req, res, next) => {
  try {
    const option = await service.updateVariantOption(req.params.productId, req.params.variantTypeId, req.params.optionId, req.body, req.user.id, req.user.role);
    return res.status(200).json({ success: true, data: { id: option.id, variantTypeId: option.variant_type_id, value: option.value, createdAt: option.created_at } });
  } catch (err) { next(err); }
};

const deleteOption = async (req, res, next) => {
  try {
    await service.deleteVariantOption(req.params.productId, req.params.variantTypeId, req.params.optionId, req.user.id, req.user.role);
    return res.status(200).json({ success: true, data: { message: 'Variant option deleted successfully' } });
  } catch (err) { next(err); }
};

module.exports = { createType, getTypesByProductId, getTypeById, updateType, deleteType, createOption, updateOption, deleteOption };
