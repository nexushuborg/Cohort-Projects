const repository = require('./sku.repository');
const productRepository = require('../products/product.repository');

const validateVariantOptions = async (productId, variantOptionIds) => {
  const options = [];
  for (const optionId of variantOptionIds) {
    const option = await repository.findVariantOptionById(optionId);
    if (!option) { const error = new Error('Variant option not found: ' + optionId); error.status = 404; error.code = 'NOT_FOUND'; throw error; }
    const type = await repository.findVariantTypeById(option.variant_type_id);
    if (!type) { const error = new Error('Variant type not found'); error.status = 404; error.code = 'NOT_FOUND'; throw error; }
    if (type.product_id !== productId) { const error = new Error('Variant option ' + optionId + ' does not belong to this product'); error.status = 400; error.code = 'VALIDATION_ERROR'; throw error; }
    options.push(option);
  }
  return options;
};

const createSku = async (productId, data) => {
  const product = await productRepository.findById(productId);
  if (!product) { const error = new Error('Product not found'); error.status = 404; error.code = 'NOT_FOUND'; throw error; }
  const codeExists = await repository.skuCodeExists(data.skuCode);
  if (codeExists) { const error = new Error('A SKU with this code already exists'); error.status = 409; error.code = 'CONFLICT'; throw error; }
  await validateVariantOptions(productId, data.variantOptionIds);
  const existingSkus = await repository.findSkusByProductId(productId);
  for (const existingSku of existingSkus) {
    const existingOptions = await repository.findVariantOptionsForSku(existingSku.id);
    const existingOptionIds = existingOptions.map((o) => o.variant_option_id).sort();
    const newOptionIds = [...data.variantOptionIds].sort();
    if (JSON.stringify(existingOptionIds) === JSON.stringify(newOptionIds)) {
      const error = new Error('A SKU with this variant combination already exists'); error.status = 409; error.code = 'CONFLICT'; throw error;
    }
  }
  return repository.createSku({ product_id: productId, sku_code: data.skuCode, price_override: data.priceOverride || null, stock_quantity: data.stockQuantity || 0, status: data.status || 'draft' }, data.variantOptionIds);
};

const getSkusByProductId = async (productId) => {
  const product = await productRepository.findById(productId);
  if (!product) { const error = new Error('Product not found'); error.status = 404; error.code = 'NOT_FOUND'; throw error; }
  return repository.findSkusByProductId(productId);
};

const getSkuById = async (productId, skuId) => {
  const product = await productRepository.findById(productId);
  if (!product) { const error = new Error('Product not found'); error.status = 404; error.code = 'NOT_FOUND'; throw error; }
  const sku = await repository.findSkuWithVariants(skuId);
  if (!sku) { const error = new Error('SKU not found'); error.status = 404; error.code = 'NOT_FOUND'; throw error; }
  if (sku.product_id !== productId) { const error = new Error('SKU does not belong to this product'); error.status = 400; error.code = 'VALIDATION_ERROR'; throw error; }
  return sku;
};

const updateSku = async (productId, skuId, data) => {
  const product = await productRepository.findById(productId);
  if (!product) { const error = new Error('Product not found'); error.status = 404; error.code = 'NOT_FOUND'; throw error; }
  const existing = await repository.findSkuById(skuId);
  if (!existing) { const error = new Error('SKU not found'); error.status = 404; error.code = 'NOT_FOUND'; throw error; }
  if (existing.product_id !== productId) { const error = new Error('SKU does not belong to this product'); error.status = 400; error.code = 'VALIDATION_ERROR'; throw error; }
  if (data.skuCode && data.skuCode !== existing.sku_code) {
    const codeExists = await repository.skuCodeExists(data.skuCode, skuId);
    if (codeExists) { const error = new Error('A SKU with this code already exists'); error.status = 409; error.code = 'CONFLICT'; throw error; }
  }
  const updateData = {};
  if (data.skuCode !== undefined) updateData.sku_code = data.skuCode;
  if (data.priceOverride !== undefined) updateData.price_override = data.priceOverride;
  if (data.stockQuantity !== undefined) updateData.stock_quantity = data.stockQuantity;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.variantOptionIds) {
    await validateVariantOptions(productId, data.variantOptionIds);
    const otherSkus = await repository.findSkusByProductId(productId);
    for (const otherSku of otherSkus) {
      if (otherSku.id === skuId) continue;
      const otherOptions = await repository.findVariantOptionsForSku(otherSku.id);
      const otherOptionIds = otherOptions.map((o) => o.variant_option_id).sort();
      const newOptionIds = [...data.variantOptionIds].sort();
      if (JSON.stringify(otherOptionIds) === JSON.stringify(newOptionIds)) {
        const error = new Error('A SKU with this variant combination already exists'); error.status = 409; error.code = 'CONFLICT'; throw error;
      }
    }
    await repository.replaceSkuVariants(skuId, data.variantOptionIds);
  }
  if (Object.keys(updateData).length > 0) { await repository.updateSku(skuId, updateData); }
  return repository.findSkuWithVariants(skuId);
};

const deleteSku = async (productId, skuId) => {
  const product = await productRepository.findById(productId);
  if (!product) { const error = new Error('Product not found'); error.status = 404; error.code = 'NOT_FOUND'; throw error; }
  const existing = await repository.findSkuById(skuId);
  if (!existing) { const error = new Error('SKU not found'); error.status = 404; error.code = 'NOT_FOUND'; throw error; }
  if (existing.product_id !== productId) { const error = new Error('SKU does not belong to this product'); error.status = 400; error.code = 'VALIDATION_ERROR'; throw error; }
  return repository.removeSku(skuId);
};

module.exports = { createSku, getSkusByProductId, getSkuById, updateSku, deleteSku };