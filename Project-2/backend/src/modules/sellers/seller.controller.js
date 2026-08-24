const sellerService = require('./seller.service');
const sellerView = require('./seller.view');

/**
 * Seller Controller (Functional Request Handlers)
 */

async function registerStore(req, res, next) {
  try {
    const store = await sellerService.registerStore(req.user.id, req.body);
    const data = sellerView.formatStore(store);
    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function getStores(req, res, next) {
  try {
    const { stores, total } = await sellerService.getStores(req.query);
    const items = sellerView.formatStoreList(stores);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getMyStore(req, res, next) {
  try {
    const store = await sellerService.getMyStore(req.user.id);
    const data = sellerView.formatStore(store);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function getStoreBySlug(req, res, next) {
  try {
    const store = await sellerService.getStoreBySlug(req.params.slug);
    const data = sellerView.formatStore(store);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function updateStore(req, res, next) {
  try {
    const store = await sellerService.updateStore(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    const data = sellerView.formatStore(store);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function updateStoreStatus(req, res, next) {
  try {
    const store = await sellerService.updateStoreStatus(req.params.id, req.body.status);
    const data = sellerView.formatStore(store);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerStore,
  getStores,
  getMyStore,
  getStoreBySlug,
  updateStore,
  updateStoreStatus,
};
