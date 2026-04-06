const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createCampus = {
    body: Joi.object().keys({
        name: Joi.string().trim().min(2).max(100).required()
            .messages({ 'any.required': 'Tên campus là bắt buộc' }),
        city: Joi.string().trim().required()
            .messages({ 'any.required': 'Thành phố là bắt buộc' }),
        country: Joi.string().trim().default('Vietnam'),
        timezone: Joi.string().trim().default('Asia/Ho_Chi_Minh'),
        address: Joi.string().trim().allow('').default(''),
        phone: Joi.string().trim().allow('').default(''),
        email: Joi.string().email().lowercase().allow('').default(''),
        isActive: Joi.boolean().default(true),
    }),
};

const updateCampus = {
    params: Joi.object().keys({
        campusId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object()
        .keys({
            name: Joi.string().trim().min(2).max(100),
            city: Joi.string().trim(),
            country: Joi.string().trim(),
            timezone: Joi.string().trim(),
            address: Joi.string().trim().allow(''),
            phone: Joi.string().trim().allow(''),
            email: Joi.string().email().lowercase().allow(''),
            isActive: Joi.boolean(),
        })
        .min(1)
        .messages({ 'object.min': 'Cần ít nhất 1 trường để cập nhật' }),
};

const getCampus = {
    params: Joi.object().keys({
        campusId: Joi.string().custom(objectId).required(),
    }),
};

const getCampuses = {
    query: Joi.object().keys({
        isActive: Joi.boolean(),
        city: Joi.string().trim(),
        sortBy: Joi.string().valid('name:asc', 'city:asc', 'createdAt:desc').default('name:asc'),
        limit: Joi.number().integer().min(1).max(100).default(20),
        page: Joi.number().integer().min(1).default(1),
        populate: Joi.string().valid('instructorCount').allow('').default(''),
    }),
};

const deleteCampus = {
    params: Joi.object().keys({
        campusId: Joi.string().custom(objectId).required(),
    }),
};

module.exports = {
    createCampus,
    updateCampus,
    getCampus,
    getCampuses,
    deleteCampus
};