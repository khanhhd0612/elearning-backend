const categoryService = require('../services/category.service');
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');

const getCategories = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['parentId', 'isActive']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);

    const result = await categoryService.getCategories(filter, options);

    res.status(200).json({
        status: 'success',
        data: result,
    });
});

const getCategory = catchAsync(async (req, res) => {
    const category = await categoryService.getCategory(req.params.categoryId);

    res.status(200).json({
        status: 'success',
        data: category,
    });
});

const getCategoryBySlug = catchAsync(async (req, res) => {
    const category = await categoryService.getCategoryBySlug(req.params.slug);

    res.status(200).json({
        status: 'success',
        data: category,
    });
});

const getRootCategories = catchAsync(async (req, res) => {
    const categories = await categoryService.getRootCategories();

    res.status(200).json({
        status: 'success',
        data: categories,
    });
});

const getChildCategories = catchAsync(async (req, res) => {
    const categories = await categoryService.getChildCategories(req.params.categoryId);

    res.status(200).json({
        status: 'success',
        data: categories,
    });
});

const getCategoryTree = catchAsync(async (req, res) => {
    const tree = await categoryService.getCategoryTree();

    res.status(200).json({
        status: 'success',
        data: tree,
    });
});

const createCategory = catchAsync(async (req, res) => {
    const category = await categoryService.createCategory(req.body);

    res.status(201).json({
        status: 'success',
        message: 'Tạo danh mục thành công',
        data: category,
    });
});

const updateCategory = catchAsync(async (req, res) => {
    const category = await categoryService.updateCategory(req.params.categoryId, req.body);

    res.status(200).json({
        status: 'success',
        message: 'Cập nhật danh mục thành công',
        data: category,
    });
});

const deleteCategory = catchAsync(async (req, res) => {
    await categoryService.deleteCategory(req.params.categoryId);

    res.status(200).json({
        status: 'success',
        message: 'Đã xoá danh mục thành công',
    });
});

module.exports = {
    getCategories,
    getCategory,
    getCategoryBySlug,
    getRootCategories,
    getChildCategories,
    getCategoryTree,
    createCategory,
    updateCategory,
    deleteCategory,
};