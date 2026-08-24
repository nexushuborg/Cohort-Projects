const service = require('./product-image.service');

/**
 * POST /products/:productId/images
 * Upload a product image (seller only)
 */
const upload = async (req, res, next) => {
  try {
    const image = await service.uploadImage(req.params.productId, req.file);

    return res.status(201).json({
      success: true,
      data: {
        id: image.id,
        productId: image.product_id,
        url: image.url,
        sortOrder: image.sort_order,
        createdAt: image.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /products/:productId/images
 * Get all images for a product (public)
 */
const getByProductId = async (req, res, next) => {
  try {
    const images = await service.getImagesByProductId(req.params.productId);

    return res.status(200).json({
      success: true,
      data: images.map((img) => ({
        id: img.id,
        productId: img.product_id,
        url: img.url,
        sortOrder: img.sort_order,
        createdAt: img.created_at,
      })),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /products/:productId/images/:imageId/primary
 * Set an image as primary (seller only)
 */
const setPrimary = async (req, res, next) => {
  try {
    const image = await service.setPrimaryImage(
      req.params.productId,
      req.params.imageId
    );

    return res.status(200).json({
      success: true,
      data: {
        id: image.id,
        productId: image.product_id,
        url: image.url,
        sortOrder: image.sort_order,
        createdAt: image.created_at,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /products/:productId/images/:imageId
 * Delete a product image (seller only)
 */
const remove = async (req, res, next) => {
  try {
    await service.deleteImage(req.params.productId, req.params.imageId);

    return res.status(200).json({
      success: true,
      data: { message: 'Image deleted successfully' },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  upload,
  getByProductId,
  setPrimary,
  remove,
};
