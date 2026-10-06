/**
 * Seller & Store View (Serialization Functions)
 */

function formatStore(store) {
  if (!store) return null;

  const formatted = {
    id: store.id,
    ownerId: store.owner_id,
    name: store.name,
    slug: store.slug,
    description: store.description || null,
    logoUrl: store.logo_url || null,
    bannerUrl: store.banner_url || null,
    status: store.status,
    policies: store.policies || null,
    contactEmail: store.contact_email || null,
    contactPhone: store.contact_phone || null,
    createdAt: store.created_at,
    updatedAt: store.updated_at,
  };

  if (store.owner_name) {
    formatted.owner = {
      name: store.owner_name,
      email: store.owner_email,
    };
  }

  return formatted;
}

function formatStoreList(stores) {
  return stores.map(formatStore);
}

module.exports = {
  formatStore,
  formatStoreList,
};
