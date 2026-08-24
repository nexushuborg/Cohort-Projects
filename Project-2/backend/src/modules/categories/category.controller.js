const categoryService = require('./category.service');
const categoryView = require('./category.view');

/**
 * Category Controller (Functional Request Handlers)
 */

async function listCategories(req, res, next) {
  try {
    const categoriesTree = await categoryService.listCategoriesTree();
    return res.status(200).json({
      success: true,
      data: {
        items: categoriesTree,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function getCategory(req, res, next) {
  try {
    const category = await categoryService.getCategory(req.params.id);
    const data = categoryView.formatCategory(category);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function createCategory(req, res, next) {
  try {
    const category = await categoryService.createCategory(req.body);
    const data = categoryView.formatCategory(category);
    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function updateCategory(req, res, next) {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    const data = categoryView.formatCategory(category);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const result = await categoryService.deleteCategory(req.params.id);
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
};
