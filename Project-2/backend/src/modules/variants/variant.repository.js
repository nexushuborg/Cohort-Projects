const db = require('../../config/database');

const TYPE_TABLE = 'variant_types';
const OPTION_TABLE = 'variant_options';

// ─── Variant Types ─────────────────────────────────────────────

/**
 * Create a variant type
 */
const createType = async (data) => {
  const [type] = await db(TYPE_TABLE)
    .insert(data)
    .returning('*');
  return type;
};

/**
 * Find variant type by ID
 */
const findTypeById = async (id) => {
  return db(TYPE_TABLE).where({ id }).first();
};

/**
 * Find all variant types for a product
 */
const findTypesByProductId = async (productId) => {
  return db(TYPE_TABLE)
    .where({ product_id: productId })
    .orderBy('created_at', 'asc');
};

/**
 * Check if variant type name exists for a product (optionally excluding an ID)
 */
const typeNameExists = async (productId, name, excludeId = null) => {
  let query = db(TYPE_TABLE)
    .where({ product_id: productId, name })
    .first();
  if (excludeId) {
    query = db(TYPE_TABLE)
      .where({ product_id: productId, name })
      .whereNot({ id: excludeId })
      .first();
  }
  const result = await query;
  return !!result;
};

/**
 * Update a variant type
 */
const updateType = async (id, updateData) => {
  const [type] = await db(TYPE_TABLE)
    .where({ id })
    .update(updateData)
    .returning('*');
  return type;
};

/**
 * Delete a variant type (cascades to options via FK)
 */
const removeType = async (id) => {
  const deleted = await db(TYPE_TABLE).where({ id }).del();
  return deleted > 0;
};

// ─── Variant Options ───────────────────────────────────────────

/**
 * Create a variant option
 */
const createOption = async (data) => {
  const [option] = await db(OPTION_TABLE)
    .insert(data)
    .returning('*');
  return option;
};

/**
 * Find variant option by ID
 */
const findOptionById = async (id) => {
  return db(OPTION_TABLE).where({ id }).first();
};

/**
 * Find all options for a variant type
 */
const findOptionsByTypeId = async (variantTypeId) => {
  return db(OPTION_TABLE)
    .where({ variant_type_id: variantTypeId })
    .orderBy('created_at', 'asc');
};

/**
 * Check if option value exists for a variant type (optionally excluding an ID)
 */
const optionValueExists = async (variantTypeId, value, excludeId = null) => {
  let query = db(OPTION_TABLE)
    .where({ variant_type_id: variantTypeId, value })
    .first();
  if (excludeId) {
    query = db(OPTION_TABLE)
      .where({ variant_type_id: variantTypeId, value })
      .whereNot({ id: excludeId })
      .first();
  }
  const result = await query;
  return !!result;
};

/**
 * Update a variant option
 */
const updateOption = async (id, updateData) => {
  const [option] = await db(OPTION_TABLE)
    .where({ id })
    .update(updateData)
    .returning('*');
  return option;
};

/**
 * Delete a variant option
 */
const removeOption = async (id) => {
  const deleted = await db(OPTION_TABLE).where({ id }).del();
  return deleted > 0;
};

module.exports = {
  createType,
  findTypeById,
  findTypesByProductId,
  typeNameExists,
  updateType,
  removeType,
  createOption,
  findOptionById,
  findOptionsByTypeId,
  optionValueExists,
  updateOption,
  removeOption,
};
