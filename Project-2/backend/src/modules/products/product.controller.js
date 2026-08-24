const service = require('./product.service');

/**
 * POST /products
 * Create a new product (seller only)
 */
const create = async (req, res, next) => {
  try {
    const product = await service.createProduct(req.body);

    return res.status(201).json({
      success: true,
      data: {
        id: product.id,
        title: product.title,
        slug: product.slug,
        status: product.status,
        price: product.price,
        createdAt: product.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /products
 * List all products with search/filter/pagination (public)
 */
const getAll = async (req, res, next) => {
  try {
    const { page, limit, status, storeId, categoryId } = req.query;

    const result = await service.getProducts({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      status,
      storeId,
      categoryId,
    });

    return res.status(200).json({
      success: true,
      data: {
        items: result.items,
        pagination: result.pagination,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /products/:id
 * Get a single product by ID (public)
 */
const getById = async (req, res, next) => {
  try {
    const product = await service.getProductById(req.params.id);

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /products/store/:storeId
 * Get products by store ID (public)
 */
const getByStoreId = async (req, res, next) => {
  try {
    const { page, limit } = req.query;

    const result = await service.getProductsByStoreId(req.params.storeId, {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });

    return res.status(200).json({
      success: true,
      data: {
        items: result.items,
        pagination: result.pagination,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /products/:id
 * Update a product (seller, owner only)
 */
const update = async (req, res, next) => {
  try {
    const product = await service.updateProduct(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /products/:id
 * Delete a product (seller, owner only)
 */
const remove = async (req, res, next) => {
  try {
    await service.deleteProduct(req.params.id);

    return res.status(200).json({
      success: true,
      data: { message: 'Product deleted successfully' },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  create,
  getAll,
  getById,
  getByStoreId,
  update,
  remove,
};
