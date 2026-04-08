const Course = require('../models/course.model');
const ApiError = require('../utils/ApiError');
const mongoose = require('mongoose');
const { deleteImage } = require('./upload.service');

const createCourse = async (body) => {
    const course = await Course.create(body);
    return course;
};

const getCourseById = async (courseId, populate = '') => {
    let query = Course.findById(courseId);

    if (populate.includes('formats')) {
        query = query.populate('formats');
    }
    if (populate.includes('categoryId')) {
        query = query.populate('categoryId', 'name slug colorHex');
    }

    const course = await query;
    if (!course) {
        throw new ApiError(404, 'Không tìm thấy khóa học');
    }
    return course;
};

const getCourseBySlug = async (slug) => {
    const course = await Course.findOne({ slug, isActive: true })
        .populate('categoryId', 'name slug colorHex icon')
        .populate('formats');

    if (!course) {
        throw new ApiError(404, 'Không tìm thấy khóa học');
    }
    return course;
};

const queryCourses = async (filter = {}, options = {}) => {
    const {
        categoryId,
        formatType,
        enrollmentType,
        level,
        isActive = true,
        search,
        minPrice,
        maxPrice
    } = filter;

    const isActiveBool = typeof isActive === 'string' ? isActive === 'true' : Boolean(isActive);

    const {
        sortBy = 'createdAt:desc',
        limit = 10,
        page = 1,
        populate = '',
    } = options;

    const [sortField, sortDir] = sortBy.split(':');
    const sort = { [sortField]: sortDir === 'asc' ? 1 : -1 };

    const matchStage = { isActive: isActiveBool };

    if (categoryId) {
        matchStage.categoryId = mongoose.Types.ObjectId.isValid(categoryId) ? new mongoose.Types.ObjectId(categoryId) : categoryId;
    }
    if (enrollmentType) matchStage.enrollmentType = enrollmentType;
    if (level) matchStage.level = level;

    if (minPrice !== undefined || maxPrice !== undefined) {
        matchStage.basePrice = {};
        if (minPrice !== undefined) matchStage.basePrice.$gte = Number(minPrice);
        if (maxPrice !== undefined) matchStage.basePrice.$lte = Number(maxPrice);
    }

    if (search) {
        matchStage.$text = { $search: search };
    }

    const pipeline = [
        { $match: matchStage },

        ...(search ? [{ $addFields: { score: { $meta: 'textScore' } } }] : []),
    ];

    if (formatType) {
        pipeline.push({
            $lookup: {
                from: 'courseformats',
                let: { courseId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$courseId', '$$courseId'] },
                                    { $eq: ['$formatType', formatType] },
                                    { $eq: ['$isActive', true] },
                                ],
                            },
                        },
                    },
                    { $limit: 1 }, // chỉ cần biết có tồn tại hay không
                ],
                as: '_matchedFormats',
            },
        });

        // Loại bỏ course không có format khớp
        pipeline.push({ $match: { '_matchedFormats.0': { $exists: true } } });

        // Xóa field tạm
        pipeline.push({ $unset: '_matchedFormats' });
    }

    if (populate.includes('categoryId')) {
        pipeline.push({
            $lookup: {
                from: 'categories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'categoryId',
                pipeline: [
                    { $project: { name: 1, slug: 1, color_hex: 1, icon: 1 } },
                ],
            },
        });
        pipeline.push({
            $unwind: { path: '$categoryId', preserveNullAndEmptyArrays: true },
        });
    }

    if (populate.includes('formats')) {
        pipeline.push({
            $lookup: {
                from: 'courseformats',
                localField: '_id',
                foreignField: 'courseId',
                as: 'formats',
                pipeline: [
                    { $match: { isActive: true } },
                    {
                        $project: {
                            formatType: 1, priceOverride: 1, oncampusDetail: 1,
                            onlineDetail: 1, remoteDetail: 1, hybridDetail: 1
                        }
                    },
                ],
            },
        });
    }

    const sortStage = search
        ? { score: { $meta: 'textScore' }, ...sort }
        : sort;
    pipeline.push({ $sort: sortStage });

    const skip = (Number(page) - 1) * Number(limit);

    pipeline.push({
        $facet: {
            results: [
                { $skip: skip },
                { $limit: Number(limit) },
            ],
            totalCount: [
                { $count: 'count' },
            ],
        },
    });

    const [raw] = await Course.aggregate(pipeline);

    const totalResults = raw.totalCount[0]?.count ?? 0;
    const totalPages = Math.ceil(totalResults / Number(limit));

    return {
        results: raw.results,
        page: Number(page),
        limit: Number(limit),
        totalPages,
        totalResults,
    };
};

const getPublicCourses = async (filter = {}, options = {}) => {
    const {
        categoryId,
        formatType,
        enrollmentType,
        level,
        search,
        minPrice,
        maxPrice
    } = filter;

    const {
        sortBy = 'createdAt:desc',
        limit = 10,
        page = 1,
        populate = '',
    } = options;

    const [sortField, sortDir] = sortBy.split(':');
    const sort = { [sortField]: sortDir === 'asc' ? 1 : -1 };

    const matchStage = { isActive: true };

    if (categoryId) {
        matchStage.categoryId = mongoose.Types.ObjectId.isValid(categoryId) ? new mongoose.Types.ObjectId(categoryId) : categoryId;
    }
    if (enrollmentType) matchStage.enrollmentType = enrollmentType;
    if (level) matchStage.level = level;

    if (minPrice !== undefined || maxPrice !== undefined) {
        matchStage.basePrice = {};
        if (minPrice !== undefined) matchStage.basePrice.$gte = Number(minPrice);
        if (maxPrice !== undefined) matchStage.basePrice.$lte = Number(maxPrice);
    }

    if (search) {
        matchStage.$text = { $search: search };
    }

    const pipeline = [
        { $match: matchStage },

        ...(search ? [{ $addFields: { score: { $meta: 'textScore' } } }] : []),
    ];

    if (formatType) {
        pipeline.push({
            $lookup: {
                from: 'courseformats',
                let: { courseId: '$_id' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$courseId', '$$courseId'] },
                                    { $eq: ['$formatType', formatType] },
                                    { $eq: ['$isActive', true] },
                                ],
                            },
                        },
                    },
                    { $limit: 1 }, // chỉ cần biết có tồn tại hay không
                ],
                as: '_matchedFormats',
            },
        });

        // Loại bỏ course không có format khớp
        pipeline.push({ $match: { '_matchedFormats.0': { $exists: true } } });

        // Xóa field tạm
        pipeline.push({ $unset: '_matchedFormats' });
    }

    if (populate.includes('categoryId')) {
        pipeline.push({
            $lookup: {
                from: 'categories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'categoryId',
                pipeline: [
                    { $project: { name: 1, slug: 1, colorHex: 1, icon: 1 } },
                ],
            },
        });
        pipeline.push({
            $unwind: { path: '$categoryId', preserveNullAndEmptyArrays: true },
        });
    }

    if (populate.includes('formats')) {
        pipeline.push({
            $lookup: {
                from: 'courseformats',
                localField: '_id',
                foreignField: 'courseId',
                as: 'formats',
                pipeline: [
                    { $match: { isActive: true } },
                    {
                        $project: {
                            formatType: 1, priceOverride: 1, oncampusDetail: 1,
                            onlineDetail: 1, remoteDetail: 1, hybridDetail: 1
                        }
                    },
                ],
            },
        });
    }

    const sortStage = search ? { score: { $meta: 'textScore' }, ...sort } : sort;

    pipeline.push({ $sort: sortStage });

    const skip = (Number(page) - 1) * Number(limit);

    pipeline.push({
        $facet: {
            results: [
                { $skip: skip },
                { $limit: Number(limit) },
            ],
            totalCount: [
                { $count: 'count' },
            ],
        },
    });

    const [raw] = await Course.aggregate(pipeline);

    const totalResults = raw.totalCount[0]?.count ?? 0;
    const totalPages = Math.ceil(totalResults / Number(limit));

    return {
        results: raw.results,
        page: Number(page),
        limit: Number(limit),
        totalPages,
        totalResults,
    };
};

const updateCourse = async (courseId, updateBody) => {
    const course = await getCourseById(courseId);

    if (updateBody.title && updateBody.title !== course.title) {
        const exists = await Course.findOne({
            title: updateBody.title,
            _id: { $ne: courseId },
        });
        if (exists) {
            throw new ApiError(409, 'Tiêu đề khóa học đã tồn tại');
        }
    }

    Object.assign(course, updateBody);
    await course.save();
    return course;
};

const toggleCourse = async (courseId) => {
    const course = await getCourseById(courseId);
    course.isActive = !course.isActive;
    await course.save();
    return course;
};

const deleteCourse = async (courseId) => {
    const course = await getCourseById(courseId);

    const CourseFormat = require('../models/courseFormat.model');
    const activeFormats = await CourseFormat.countDocuments({
        courseId,
        isActive: true,
    });

    if (activeFormats > 0) {
        throw new ApiError(
            409,
            `Không thể xóa — khóa học đang có ${activeFormats} format đang hoạt động`
        );
    }

    await deleteImage(course.thumbnailUrl);
    await course.deleteOne();
};

module.exports = {
    createCourse,
    getCourseById,
    getCourseBySlug,
    queryCourses,
    updateCourse,
    toggleCourse,
    deleteCourse,
    getPublicCourses
};