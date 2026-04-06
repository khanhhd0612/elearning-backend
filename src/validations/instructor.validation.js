const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createInstructor = {
    body: Joi.object().keys({
        userId: Joi.string().custom(objectId).required()
            .messages({ 'any.required': 'User là bắt buộc' }),
        campusId: Joi.string().custom(objectId).required()
            .messages({ 'any.required': 'Campus là bắt buộc' }),
        bio: Joi.string().trim().max(2000).allow('').default(''),
        linkedinUrl: Joi.string().uri().allow('').default('')
            .messages({ 'string.uri': 'LinkedIn URL không hợp lệ' }),
        expertise: Joi.array().items(Joi.string().trim().max(50)).max(20).default([]),
        avatarUrl: Joi.string().uri().allow('').default('')
            .messages({ 'string.uri': 'Avatar URL không hợp lệ' }),
        isActive: Joi.boolean().default(true),
    }),
};

const updateInstructor = {
    params: Joi.object().keys({
        instructorId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object()
        .keys({
            campusId: Joi.string().custom(objectId),
            bio: Joi.string().trim().max(2000).allow(''),
            linkedinUrl: Joi.string().uri().allow('')
                .messages({ 'string.uri': 'LinkedIn URL không hợp lệ' }),
            expertise: Joi.array().items(Joi.string().trim().max(50)).max(20),
            avatarUrl: Joi.string().uri().allow('')
                .messages({ 'string.uri': 'Avatar URL không hợp lệ' }),
            isActive: Joi.boolean(),
        })
        .min(1)
        .messages({ 'object.min': 'Cần ít nhất 1 trường để cập nhật' }),
};

const getInstructor = {
    params: Joi.object().keys({
        instructorId: Joi.string().custom(objectId).required(),
    }),
};

const getInstructors = {
    query: Joi.object().keys({
        campusId: Joi.string().custom(objectId),
        isActive: Joi.boolean(),
        search: Joi.string().trim().max(100),
        sortBy: Joi.string().valid('createdAt:desc', 'createdAt:asc').default('createdAt:desc'),
        limit: Joi.number().integer().min(1).max(100).default(20),
        page: Joi.number().integer().min(1).default(1),
        populate: Joi.string().valid('userId', 'campusId', 'cohorts').allow('').default(''),
    }),
};

const deleteInstructor = {
    params: Joi.object().keys({
        instructorId: Joi.string().custom(objectId).required(),
    }),
};

module.exports = {
    createInstructor,
    updateInstructor,
    getInstructor,
    getInstructors,
    deleteInstructor
};