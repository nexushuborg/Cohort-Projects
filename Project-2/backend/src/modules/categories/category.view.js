/**
 * Category View (Serialization)
 */

function formatCategory(category) {
  if (!category) return null;

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    parentId: category.parent_id || null,
    createdAt: category.created_at,
    updatedAt: category.updated_at,
  };
}

module.exports = {
  formatCategory,
};
