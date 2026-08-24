const repository = require('./product.repository');

/**
 * Generate a URL-friendly slug from a product name
 */
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

/**
 * Ensure slug is unique by appending a suffix if needed
 */
const ensureUniqueSlug = async (baseSlug, excludeId = null) => {
  let slug = baseSlug;
  let counter = 1;

  while (await repository.slugExists(slug, excludeId)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

/**
 * Create a new product
 */
const createProduct = async (data) => {
  // Generate slug if not provided
  let slug = data.slug || generateSlug(data.name);
  slug = await ensureUniqueSlug(slug);

  const productData = {
    store_id: data.storeId,
    category_id: data.categoryId || null,
    name: data.name,
    slug,
    description: data.description || null,
    brand: data.brand || null,
    price: data.price,
    status: data.status || 'draft',
  };

  return repository.create(productData);
};

/**
 * Get all products with filters and pagination
 */
const getProducts = async (filters) => {
  return repository.findAll(filters);
};

/**
 * Get a single product by ID
 */
const getProductById = async (id) => {
  const product = await repository.findById(id);
  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  return product;
};

/**
 * Get a single product by slug
 */
const getProductBySlug = async (slug) => {
  const product = await repository.findBySlug(slug);
  if (!product) {
    const error = new Error('Product not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }
  return product;
};

/**
 * Get all products for a specific store
 */
const getProductsByStoreId = async (storeId, pagination) => {
  return repository.findByStoreId(storeId, pagination);
};

/**
 * Update a product
 */
const updateProduct = async (id, data) => {
  // Verify product exists
  const existing = await repository.findById(id);
  if (!existing) {
    const error = new Error('Product not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  // If name is being updated and no explicit slug, regenerate slug
  let updateData = { ...data };
  if (data.name && !data.slug) {
    let slug = generateSlug(data.name);
    slug = await ensureUniqueSlug(slug, id);
    updateData.slug = slug;
  } else if (data.slug) {
    // Check if new slug conflicts
    const slugTaken = await repository.slugExists(data.slug, id);
    if (slugTaken) {
      const error = new Error('A product with this slug already exists');
      error.status = 409;
      error.code = 'CONFLICT';
      throw error;
    }
  }

  // Map camelCase to snake_case for DB
  if (updateData.storeId) updateData.store_id = updateData.storeId;
  if (updateData.categoryId !== undefined) updateData.category_id = updateData.categoryId;
  delete updateData.storeId;
  delete updateData.categoryId;

  return repository.update(id, updateData);
};

/**
 * Delete a product
 */
const deleteProduct = async (id) => {
  const existing = await repository.findById(id);
  if (!existing) {
    const error = new Error('Product not found');
    error.status = 404;
    error.code = 'NOT_FOUND';
    throw error;
  }

  return repository.remove(id);
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  getProductBySlug,
  getProductsByStoreId,
  updateProduct,
  deleteProduct,
  generateSlug,
};
