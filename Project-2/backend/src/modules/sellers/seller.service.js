const sellerRepo = require('./seller.repository');
const userRepo = require('../users/user.repository');
const {
  createConflictError,
  createNotFoundError,
  createForbiddenError,
} = require('../../utils/errors');

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function registerStore(userId, storeData) {
  // Check if seller already has a store
  const existingStore = await sellerRepo.findStoreByOwnerId(userId);
  if (existingStore) {
    throw createConflictError('You already have a registered store');
  }

  // Generate unique slug
  let baseSlug = slugify(storeData.name);
  let slug = baseSlug;
  let counter = 1;

  while (await sellerRepo.findStoreBySlug(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Auto-upgrade user role to seller if they are a buyer
  const user = await userRepo.findUserById(userId);
  if (user && user.role === 'buyer') {
    await userRepo.updateUserRole(userId, 'seller');
  }

  const store = await sellerRepo.createStore({
    owner_id: userId,
    name: storeData.name,
    slug,
    description: storeData.description,
    logo_url: storeData.logoUrl,
    banner_url: storeData.bannerUrl,
    policies: storeData.policies,
    contact_email: storeData.contactEmail || user?.email,
    contact_phone: storeData.contactPhone || user?.phone,
    status: 'pending',
  });

  return store;
}

async function getStores(queryParams) {
  const { page = 1, limit = 20, status = 'active', search = null } = queryParams;
  return sellerRepo.findStores({ page, limit, status, search });
}

async function getStoreBySlug(slug) {
  const store = await sellerRepo.findStoreBySlug(slug);
  if (!store) {
    throw createNotFoundError('Store not found');
  }
  return store;
}

async function getMyStore(userId) {
  const store = await sellerRepo.findStoreByOwnerId(userId);
  if (!store) {
    throw createNotFoundError('You have not created a store yet');
  }
  return store;
}

async function updateStore(storeId, userId, userRole, updateData) {
  const store = await sellerRepo.findStoreById(storeId);
  if (!store) {
    throw createNotFoundError('Store not found');
  }

  // Only store owner (or admin) can update store settings
  if (store.owner_id !== userId && userRole !== 'admin') {
    throw createForbiddenError('You do not have permission to edit this store');
  }

  const allowedUpdates = {};
  if (updateData.name !== undefined) allowedUpdates.name = updateData.name;
  if (updateData.description !== undefined) allowedUpdates.description = updateData.description;
  if (updateData.contactEmail !== undefined) allowedUpdates.contact_email = updateData.contactEmail;
  if (updateData.contactPhone !== undefined) allowedUpdates.contact_phone = updateData.contactPhone;
  if (updateData.logoUrl !== undefined) allowedUpdates.logo_url = updateData.logoUrl;
  if (updateData.bannerUrl !== undefined) allowedUpdates.banner_url = updateData.bannerUrl;
  if (updateData.policies !== undefined) allowedUpdates.policies = updateData.policies;

  return sellerRepo.updateStore(storeId, allowedUpdates);
}

async function updateStoreStatus(storeId, status) {
  const store = await sellerRepo.findStoreById(storeId);
  if (!store) {
    throw createNotFoundError('Store not found');
  }

  return sellerRepo.updateStoreStatus(storeId, status);
}

module.exports = {
  slugify,
  registerStore,
  getStores,
  getStoreBySlug,
  getMyStore,
  updateStore,
  updateStoreStatus,
};
