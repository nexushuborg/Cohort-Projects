const service = require('./product-image.service');

const upload = async (req, res, next) => {
  try {
    const image = await service.uploadImage(req.params.productId, req.file, req.user.id, req.user.role);
    return res.status(201).json({
      success: true,
      data: { id: image.id, productId: image.product_id, url: image.url, sortOrder: image.sort_order, createdAt: image.created_at },
    });
  } catch (err) { next(err); }
};

const getByProductId = async (req, res, next) => {
  try {
    const images = await service.getImagesByProductId(req.params.productId);
    return res.status(200).json({
      success: true,
      data: images.map((img) => ({ id: img.id, productId: img.product_id, url: img.url, sortOrder: img.sort_order, createdAt: img.created_at })),
    });
  } catch (err) { next(err); }
};

const setPrimary = async (req, res, next) => {
  try {
    const image = await service.setPrimaryImage(req.params.productId, req.params.imageId, req.user.id, req.user.role);
    return res.status(200).json({
      success: true,
      data: { id: image.id, productId: image.product_id, url: image.url, sortOrder: image.sort_order, createdAt: image.created_at },
    });
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    await service.deleteImage(req.params.productId, req.params.imageId, req.user.id, req.user.role);
    return res.status(200).json({ success: true, data: { message: 'Image deleted successfully' } });
  } catch (err) { next(err); }
};

module.exports = { upload, getByProductId, setPrimary, remove };
