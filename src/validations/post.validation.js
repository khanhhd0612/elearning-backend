const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createPost = {
    body: Joi.object().keys({
        title: Joi.string().trim().required()
            .messages({ 'any.required': 'Tiêu đề bài viết là bắt buộc' }),
        content: Joi.object().required()
            .messages({ 'any.required': 'Nội dung bài viết không được để trống' }),
        summary: Joi.string().trim().allow(''),
        thumbnail: Joi.string().uri().allow(''),
        status: Joi.string().valid('draft', 'published', 'archived').default('draft'),
        isFeatured: Joi.boolean().default(false),
    }),
};

const getPosts = {
    query: Joi.object().keys({
        search: Joi.string().allow(''),
        status: Joi.string().valid('draft', 'published', 'archived'),
        isFeatured: Joi.boolean(),
        sortBy: Joi.string(),
        limit: Joi.number().integer().min(1).max(100).default(10),
        page: Joi.number().integer().min(1).default(1),
    }),
};

const getPost = {
    params: Joi.object().keys({
        postId: Joi.string().custom(objectId).required(),
    }),
};

const getPostDetail = {
    params: Joi.object().keys({
        slug: Joi.string().required()
            .messages({ 'any.required': 'Slug là bắt buộc để xem chi tiết' }),
    }),
};

const updatePost = {
    params: Joi.object().keys({
        postId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object()
        .keys({
            title: Joi.string().trim(),
            content: Joi.object(),
            summary: Joi.string().trim().allow(''),
            thumbnail: Joi.string().uri().allow(''),
            status: Joi.string().valid('draft', 'published', 'archived'),
            isFeatured: Joi.boolean(),
        })
        .min(1)
        .messages({ 'object.min': 'Cần ít nhất một trường để cập nhật bài viết' }),
};

const deletePost = {
    params: Joi.object().keys({
        postId: Joi.string().custom(objectId).required(),
    }),
};

const incrementViews = {
    params: Joi.object().keys({
        postId: Joi.string().custom(objectId).required(),
    }),
};

module.exports = {
    createPost,
    getPosts,
    getPost,
    getPostDetail,
    updatePost,
    deletePost,
    incrementViews,
};