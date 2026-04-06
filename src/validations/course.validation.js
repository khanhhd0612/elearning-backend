const Joi = require('joi');
const { objectId } = require('./custom.validation');

const titleRule = Joi.string().trim().min(3).max(255);
const priceRule = Joi.number().min(0);
const durationRule = Joi.number().integer().min(1).max(104);
const enrollmentTypes = ['public', 'approval', 'invite_only'];
const levels = ['beginner', 'intermediate', 'advanced', 'expert'];

const skillRequirementRule = Joi.object({
    name: Joi.string().trim().max(100).required()
        .messages({ 'any.required': 'Tên kỹ năng là bắt buộc' }),
    description: Joi.string().trim().max(500).allow('').default(''),
    isRequired: Joi.boolean().default(true),
});

const createCourse = {
    body: Joi.object().keys({
        categoryId: Joi.string().custom(objectId).required()
            .messages({ 'any.required': 'Danh mục là bắt buộc' }),

        title: titleRule.required()
            .messages({
                'any.required': 'Tiêu đề là bắt buộc',
                'string.min': 'Tiêu đề phải có ít nhất 3 ký tự',
                'string.max': 'Tiêu đề không quá 255 ký tự',
            }),

        description: Joi.string().allow('').default(''),
        durationWeeks: durationRule.required()
            .messages({
                'any.required': 'Thời lượng là bắt buộc',
                'number.min': 'Thời lượng phải >= 1 tuần',
            }),

        basePrice: priceRule.required()
            .messages({
                'any.required': 'Giá là bắt buộc',
                'number.min': 'Giá không hợp lệ',
            }),

        enrollmentType: Joi.string().valid(...enrollmentTypes).default('public'),

        // Hiển thị cho học viên — không gate enrollment
        level: Joi.string().valid(...levels).allow(null).default(null),
        requiredSkills: Joi.array().items(skillRequirementRule).default([]),

        isActive: Joi.boolean().default(true),
    }),
};

const updateCourse = {
    params: Joi.object().keys({
        courseId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object()
        .keys({
            categoryId: Joi.string().custom(objectId),
            title: titleRule,
            description: Joi.string().allow(''),
            durationWeeks: durationRule,
            basePrice: priceRule,
            enrollmentType: Joi.string().valid(...enrollmentTypes),
            level: Joi.string().valid(...levels).allow(null),
            requiredSkills: Joi.array().items(skillRequirementRule),
            isActive: Joi.boolean(),
        })
        .min(1)
        .messages({ 'object.min': 'Cần ít nhất 1 trường để cập nhật' }),
};

const getCourse = {
    params: Joi.object().keys({
        courseId: Joi.string().custom(objectId).required(),
    }),
};

const getCourseBySlug = {
    params: Joi.object().keys({
        slug: Joi.string().trim().required(),
    }),
};

const getCourses = {
    query: Joi.object().keys({
        categoryId: Joi.string().custom(objectId),
        enrollmentType: Joi.string().valid(...enrollmentTypes),
        level: Joi.string().valid(...levels),
        isActive: Joi.boolean(),

        minPrice: priceRule,
        maxPrice: priceRule.when('minPrice', {
            is: Joi.exist(),
            then: Joi.number().min(Joi.ref('minPrice'))
                .messages({ 'number.min': 'maxPrice phải >= minPrice' }),
        }),

        search: Joi.string().trim().max(100),
        sortBy: Joi.string()
            .valid(
                'createdAt:desc', 'createdAt:asc',
                'basePrice:asc', 'basePrice:desc',
                'title:asc'
            )
            .default('createdAt:desc'),

        limit: Joi.number().integer().min(1).max(100).default(12),
        page: Joi.number().integer().min(1).default(1),
        populate: Joi.string()
            .pattern(/^(formats|categoryId)(,(formats|categoryId))*$/)
            .allow('')
            .default('')
            .messages({ 'string.pattern.base': 'populate chỉ chấp nhận: formats, categoryId' }),
    }),
};

const toggleCourse = {
    params: Joi.object().keys({
        courseId: Joi.string().custom(objectId).required(),
    }),
};

const deleteCourse = {
    params: Joi.object().keys({
        courseId: Joi.string().custom(objectId).required(),
    }),
};

module.exports = {
    createCourse,
    updateCourse,
    getCourse,
    getCourseBySlug,
    getCourses,
    toggleCourse,
    deleteCourse,
};