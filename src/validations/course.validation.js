const Joi = require('joi');
const { objectId } = require('./custom.validation');

const titleRule = Joi.string().trim().min(3).max(255);
const priceRule = Joi.number().min(0);
const durationRule = Joi.number().integer().min(1).max(104);
const enrollmentTypes = ['public', 'approval', 'invite_only'];
const levels = ['beginner', 'intermediate', 'advanced', 'expert'];

const objectiveRule = Joi.object({
    code: Joi.string().trim().max(10).allow('').default(''),
    description: Joi.string().trim().max(500).required()
        .messages({ 'any.required': 'Nội dung mục tiêu là bắt buộc' }),
});

const lessonRule = Joi.object({
    order: Joi.number().integer().min(1).required(),
    title: Joi.string().trim().max(255).required(),
    description: Joi.string().trim().max(1000).allow('').default(''),
});

const moduleRule = Joi.object({
    order: Joi.number().integer().min(1).required(),
    title: Joi.string().trim().max(255).required(),
    lessons: Joi.array().items(lessonRule).default([]),
});

const outcomeRule = Joi.object({
    order: Joi.number().integer().min(1).required(),
    description: Joi.string().trim().max(500).required()
        .messages({ 'any.required': 'Nội dung chuẩn đầu ra là bắt buộc' }),
});

const skillRequirementRule = Joi.object({
    name: Joi.string().trim().max(100).required(),
    description: Joi.string().trim().max(500).allow('').default(''),
    isRequired: Joi.boolean().default(true),
});

const contentFields = {
    objectives: Joi.array().items(objectiveRule).default([]),
    curriculum: Joi.array().items(moduleRule).default([]),
    outcomes: Joi.array().items(outcomeRule).default([]),
    targetAudience: Joi.array().items(Joi.string().trim().max(200)).default([]),
    prerequisites: Joi.array().items(Joi.string().trim().max(200)).default([]),
};

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
        durationWeeks: durationRule.required(),
        basePrice: priceRule.required(),
        enrollmentType: Joi.string().valid(...enrollmentTypes).default('public'),
        level: Joi.string().valid(...levels).allow(null).default(null),
        requiredSkills: Joi.array().items(skillRequirementRule).default([]),
        isActive: Joi.boolean().default(true),

        ...contentFields,
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

            // Content fields — gửi toàn bộ array khi update (replace, không merge)
            objectives: Joi.array().items(objectiveRule),
            curriculum: Joi.array().items(moduleRule),
            outcomes: Joi.array().items(outcomeRule),
            targetAudience: Joi.array().items(Joi.string().trim().max(200)),
            prerequisites: Joi.array().items(Joi.string().trim().max(200)),
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
            .valid('createdAt:desc', 'createdAt:asc', 'basePrice:asc', 'basePrice:desc', 'title:asc')
            .default('createdAt:desc'),
        limit: Joi.number().integer().min(1).max(100).default(12),
        page: Joi.number().integer().min(1).default(1),
        populate: Joi.string()
            .pattern(/^(formats|categoryId)(,(formats|categoryId))*$/)
            .allow('').default(''),
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