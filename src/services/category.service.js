const Category = require('../models/category.model');
const ApiError = require('../utils/ApiError');
const cacheService = require('./cache.service');

const getCategoryById = async (categoryId) => {
    const category = await Category.findById(categoryId);
    if (!category) throw new ApiError(404, 'Không tìm thấy danh mục');
    return category;
};

const getCategories = async (filter, options = {}) => {
    return Category.paginate(filter, {
        page: options.page || 1,
        limit: options.limit || 10,
        sortBy: options.sortBy || 'order:asc',
        populate: {
            path: 'parentId',
            select: 'name slug',
        },
    });
};

const getCategory = async (categoryId) => {
    return getCategoryById(categoryId);
};

const getCategoryBySlug = async (slug) => {
    const cacheKey = `categories:slug:${slug}`;

    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) return cachedData;

    const category = await Category.findOne({ slug, isActive: true });
    if (!category) throw new ApiError(404, 'Không tìm thấy danh mục');

    await cacheService.set(cacheKey, category, 3600);
    return category;
};

const getRootCategories = async () => {
    return Category.find({ parentId: null, isActive: true }).sort({ order: 1 });
};

const getChildCategories = async (parentId) => {
    await getCategoryById(parentId);
    return Category.find({ parentId, isActive: true }).sort({ order: 1 });
};

const getCategoryTree = async () => {
    const all = await Category.find({ isActive: true })
        .sort({ order: 1 })
        .select('_id name slug order parentId isActive');

    const map = {};
    const roots = [];

    all.forEach((cat) => {
        map[cat._id] = { ...cat.toObject(), children: [] };
    });

    all.forEach((cat) => {
        if (cat.parentId && map[cat.parentId]) {
            map[cat.parentId].children.push(map[cat._id]);
        } else {
            roots.push(map[cat._id]);
        }
    });

    return roots;
};

const checkSlugExists = async (slug, excludeId = null) => {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    return Category.exists(query);
};

const createCategory = async (data) => {
    if (data.parentId) {
        await getCategoryById(data.parentId);
    }
    return Category.create(data);
};

const updateCategory = async (categoryId, updateData) => {
    const category = await getCategoryById(categoryId);

    if (updateData.parentId) {
        if (updateData.parentId.toString() === categoryId.toString()) {
            throw new ApiError(400, 'Danh mục không thể là cha của chính nó');
        }
        await getCategoryById(updateData.parentId);
    }

    Object.assign(category, updateData);
    await category.save();

    await cacheService.delByPattern('categories:*');
    return category;
};

const deleteCategory = async (categoryId) => {
    const category = await getCategoryById(categoryId);

    const hasChildren = await Category.exists({ parentId: categoryId });
    if (hasChildren) {
        throw new ApiError(400, 'Không thể xoá danh mục đang có danh mục con');
    }

    category.isActive = false;
    await category.save();
    return category;
};

const reorderCategories = async (orders) => {
    const ops = orders.map(({ id, order }) => ({
        updateOne: {
            filter: { _id: id },
            update: { $set: { order } },
        },
    }));

    await Category.bulkWrite(ops);
};

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
    reorderCategories,
};