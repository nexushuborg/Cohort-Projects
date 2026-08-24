const repository = require('./variant.repository');
const productRepository = require('../products/product.repository');

// ─── Variant Types ─────────────────────────────────────────────

const createVariantType = async (productId, data) => {
  const product = await productRepository.findById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  const exists = await repository.typeNameExists(productId, data.name);
  if (exists) {
    const error = new Error('A variant type with this name already exists for this product');
    error.status = 409;
    error.code = 'CONFLICT';
    throw error;
  }
  return repository.createType({ product_id: productId, name: data.name });
};

const getVariantTypesByProductId = async (productId) => {
  const product = await productRepository.findById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  return repository.findTypesByProductId(productId);
};

const getVariantTypeById = async (productId, variantTypeId) => {
  const product = await productRepository.findById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  const type = await repository.findTypeById(variantTypeId);
  if (!type) {
    const error = new Error('Variant type not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  if (type.product_id !== productId) {
    const error = new Error('Variant type does not belong to this product');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  const options = await repository.findOptionsByTypeId(variantTypeId);
  return { ...type, options };
};

const updateVariantType = async (productId, variantTypeId, data) => {
  const product = await productRepository.findById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  const existing = await repository.findTypeById(variantTypeId);
  if (!existing) {
    const error = new Error('Variant type not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  if (existing.product_id !== productId) {
    const error = new Error('Variant type does not belong to this product');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  if (data.name && data.name !== existing.name) {
    const exists = await repository.typeNameExists(productId, data.name, variantTypeId);
    if (exists) {
      const error = new Error('A variant type with this name already exists for this product');
      error.status = 409;
      error.code = 'CONFLICT';
      throw error;
    }
  }
  return repository.updateType(variantTypeId, data);
};

const deleteVariantType = async (productId, variantTypeId) => {
  const product = await productRepository.findById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  const existing = await repository.findTypeById(variantTypeId);
  if (!existing) {
    const error = new Error('Variant type not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  if (existing.product_id !== productId) {
    const error = new Error('Variant type does not belong to this product');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  return repository.removeType(variantTypeId);
};

// ─── Variant Options ───────────────────────────────────────────

const createVariantOption = async (productId, variantTypeId, data) => {
  const product = await productRepository.findById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  const type = await repository.findTypeById(variantTypeId);
  if (!type) {
    const error = new Error('Variant type not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  if (type.product_id !== productId) {
    const error = new Error('Variant type does not belong to this product');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  const exists = await repository.optionValueExists(variantTypeId, data.value);
  if (exists) {
    const error = new Error('An option with this value already exists for this variant type');
    error.status = 409;
    error.code = 'CONFLICT';
    throw error;
  }
  return repository.createOption({ variant_type_id: variantTypeId, value: data.value });
};

const updateVariantOption = async (productId, variantTypeId, optionId, data) => {
  const product = await productRepository.findById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  const type = await repository.findTypeById(variantTypeId);
  if (!type) {
    const error = new Error('Variant type not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  if (type.product_id !== productId) {
    const error = new Error('Variant type does not belong to this product');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  const existing = await repository.findOptionById(optionId);
  if (!existing) {
    const error = new Error('Variant option not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  if (existing.variant_type_id !== variantTypeId) {
    const error = new Error('Variant option does not belong to this variant type');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  if (data.value && data.value !== existing.value) {
    const dupExists = await repository.optionValueExists(variantTypeId, data.value, optionId);
    if (dupExists) {
      const error = new Error('An option with this value already exists for this variant type');
      error.status = 409;
      error.code = 'CONFLICT';
      throw error;
    }
  }
  return repository.updateOption(optionId, data);
};

const deleteVariantOption = async (productId, variantTypeId, optionId) => {
  const product = await productRepository.findById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  const type = await repository.findTypeById(variantTypeId);
  if (!type) {
    const error = new Error('Variant type not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  if (type.product_id !== productId) {
    const error = new Error('Variant type does not belong to this product');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  const existing = await repository.findOptionById(optionId);
  if (!existing) {
    const error = new Error('Variant option not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  if (existing.variant_type_id !== variantTypeId) {
    const error = new Error('Variant option does not belong to this variant type');
    error.status = 400;
    error.code = 'VALIDATION_ERROR';
    throw error;
  }
  return repository.removeOption(optionId);
};

module.exports = {
  createVariantType,
  getVariantTypesByProductId,
  getVariantTypeById,
  updateVariantType,
  deleteVariantType,
  createVariantOption,
  updateVariantOption,
  deleteVariantOption,
};
