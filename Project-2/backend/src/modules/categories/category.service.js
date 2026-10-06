const categoryRepo = require('./category.repository');
const {
  createNotFoundError,
  createValidationError,
} = require('../../utils/errors');
const { slugify } = require('../sellers/seller.service');

async function listCategoriesTree() {
  const categories = await categoryRepo.findAllCategories();

  const rootCategories = new Map();
  const subcategories = [];

  // 1. Separate roots and subcategories
  for (const cat of categories) {
    if (!cat.parent_id) {
      rootCategories.set(cat.id, {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        subcategories: [],
        createdAt: cat.created_at,
        updatedAt: cat.updated_at,
      });
    } else {
      subcategories.push(cat);
    }
  }

  // 2. Nest children under their parent
  for (const sub of subcategories) {
    const parent = rootCategories.get(sub.parent_id);
    if (parent) {
      parent.subcategories.push({
        id: sub.id,
        name: sub.name,
        slug: sub.slug,
        parentId: sub.parent_id,
        createdAt: sub.created_at,
        updatedAt: sub.updated_at,
      });
    }
  }

  return Array.from(rootCategories.values());
}

async function getCategory(id) {
  let category = await categoryRepo.findCategoryById(id);
  if (!category) {
    category = await categoryRepo.findCategoryBySlug(id);
  }

  if (!category) {
    throw createNotFoundError('Category not found');
  }

  return category;
}

async function createCategory(data) {
  if (data.parentId) {
    const parent = await categoryRepo.findCategoryById(data.parentId);
    if (!parent) {
      throw createValidationError('Parent category does not exist');
    }
  }

  let baseSlug = data.slug ? slugify(data.slug) : slugify(data.name);
  let slug = baseSlug;
  let counter = 1;

  while (await categoryRepo.findCategoryBySlug(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return categoryRepo.createCategory({
    name: data.name,
    slug,
    parent_id: data.parentId || null,
  });
}

async function updateCategory(id, data) {
  const category = await categoryRepo.findCategoryById(id);
  if (!category) {
    throw createNotFoundError('Category not found');
  }

  if (data.parentId) {
    if (data.parentId === id) {
      throw createValidationError('Category cannot be its own parent');
    }
    const parent = await categoryRepo.findCategoryById(data.parentId);
    if (!parent) {
      throw createValidationError('Parent category does not exist');
    }
  }

  const updates = {};
  if (data.name !== undefined) updates.name = data.name;
  if (data.parentId !== undefined) updates.parent_id = data.parentId;
  if (data.slug !== undefined) updates.slug = slugify(data.slug);

  return categoryRepo.updateCategory(id, updates);
}

async function deleteCategory(id) {
  const category = await categoryRepo.findCategoryById(id);
  if (!category) {
    throw createNotFoundError('Category not found');
  }

  const childCount = await categoryRepo.countChildCategories(id);
  if (childCount > 0) {
    throw createValidationError('Cannot delete category with subcategories. Remove subcategories first.');
  }

  const productCount = await categoryRepo.countAssociatedProducts(id);
  if (productCount > 0) {
    throw createValidationError('Cannot delete category that contains products.');
  }

  await categoryRepo.deleteCategory(id);
  return { message: 'Category deleted successfully' };
}

module.exports = {
  listCategoriesTree,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
