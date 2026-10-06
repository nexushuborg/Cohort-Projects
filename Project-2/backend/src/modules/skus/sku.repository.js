const db = require('../../config/database');

const SKU_TABLE = 'product_skus';
const VARIANT_TABLE = 'sku_variants';

// ─── SKU CRUD ──────────────────────────────────────────────────

const createSku = async (skuData, variantOptionIds) => {
  return db.transaction(async (trx) => {
    const [sku] = await trx(SKU_TABLE)
      .insert(skuData)
      .returning('*');

    if (variantOptionIds && variantOptionIds.length > 0) {
      const mappings = variantOptionIds.map((optionId) => ({
        sku_id: sku.id,
        variant_option_id: optionId,
      }));
      await trx(VARIANT_TABLE).insert(mappings);
    }

    return sku;
  });
};

const findSkuById = async (id) => {
  return db(SKU_TABLE).where({ id }).first();
};

const findSkusByProductId = async (productId) => {
  return db(SKU_TABLE)
    .where({ product_id: productId })
    .orderBy('created_at', 'asc');
};

const findSkuWithVariants = async (skuId) => {
  const sku = await db(SKU_TABLE).where({ id: skuId }).first();
  if (!sku) return null;

  const variants = await db(VARIANT_TABLE)
    .where({ sku_id: skuId })
    .join('variant_options', 'sku_variants.variant_option_id', 'variant_options.id')
    .join('variant_types', 'variant_options.variant_type_id', 'variant_types.id')
    .select(
      'sku_variants.id as sku_variant_id',
      'sku_variants.variant_option_id',
      'variant_options.value as option_value',
      'variant_types.id as type_id',
      'variant_types.name as type_name'
    );

  return { ...sku, variants };
};

const findVariantOptionsForSku = async (skuId) => {
  return db(VARIANT_TABLE)
    .where({ sku_id: skuId })
    .select('variant_option_id');
};

const skuCodeExists = async (skuCode, excludeId = null) => {
  let query = db(SKU_TABLE).where({ sku_code: skuCode }).first();
  if (excludeId) {
    query = db(SKU_TABLE).where({ sku_code: skuCode }).whereNot({ id: excludeId }).first();
  }
  const result = await query;
  return !!result;
};

const updateSku = async (id, updateData) => {
  const [sku] = await db(SKU_TABLE)
    .where({ id })
    .update({ ...updateData, updated_at: db.fn.now() })
    .returning('*');
  return sku;
};

const replaceSkuVariants = async (skuId, variantOptionIds) => {
  return db.transaction(async (trx) => {
    await trx(VARIANT_TABLE).where({ sku_id: skuId }).del();
    if (variantOptionIds && variantOptionIds.length > 0) {
      const mappings = variantOptionIds.map((optionId) => ({
        sku_id: skuId,
        variant_option_id: optionId,
      }));
      await trx(VARIANT_TABLE).insert(mappings);
    }
  });
};

const removeSku = async (id) => {
  const deleted = await db(SKU_TABLE).where({ id }).del();
  return deleted > 0;
};

// ─── Variant Option Validation ─────────────────────────────────

const findVariantOptionById = async (id) => {
  return db('variant_options').where({ id }).first();
};

const findVariantTypeById = async (id) => {
  return db('variant_types').where({ id }).first();
};

module.exports = {
  createSku,
  findSkuById,
  findSkusByProductId,
  findSkuWithVariants,
  findVariantOptionsForSku,
  skuCodeExists,
  updateSku,
  replaceSkuVariants,
  removeSku,
  findVariantOptionById,
  findVariantTypeById,
};
