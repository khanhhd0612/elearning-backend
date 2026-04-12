const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createCohort = {
    params: Joi.object().keys({
        courseFormatId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object()
        .keys({
            name: Joi.string().trim().min(2).max(100).required()
                .messages({ 'any.required': 'Tên cohort là bắt buộc' }),

            startDate: Joi.date().iso().greater('now').required()
                .messages({
                    'any.required': 'Ngày khai giảng là bắt buộc',
                    'date.greater': 'Ngày khai giảng phải ở tương lai',
                }),
            zoomLink: Joi.string().uri()
                .messages({
                    'string.uri': 'Zoom link không hợp lệ'
                }),
            endDate: Joi.date().iso().greater(Joi.ref('startDate')).required()
                .messages({
                    'any.required': 'Ngày kết thúc là bắt buộc',
                    'date.greater': 'Ngày kết thúc phải sau ngày khai giảng',
                }),

            maxSeats: Joi.number().integer().min(1).allow(null).default(null),
        }),
};

const updateCohort = {
    params: Joi.object().keys({
        cohortId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object()
        .keys({
            name: Joi.string().trim().min(2).max(100),
            startDate: Joi.date().iso(),
            endDate: Joi.date().iso(),
            zoomLink: Joi.string().uri().allow('').default('')
                .messages({ 'string.uri': 'Zoom link không hợp lệ' }),
            maxSeats: Joi.number().integer().min(1).allow(null),
        })
        .min(1)
        .messages({ 'object.min': 'Cần ít nhất 1 trường để cập nhật' }),
};

const getCohorts = {
    params: Joi.object().keys({
        courseFormatId: Joi.string().custom(objectId).required(),
    }),
    query: Joi.object().keys({
        status: Joi.string().valid('upcoming', 'ongoing', 'completed', 'cancelled'),
        sortBy: Joi.string().valid('startDate:asc', 'startDate:desc', 'createdAt:desc').default('startDate:asc'),
        limit: Joi.number().integer().min(1).max(100).default(20),
        page: Joi.number().integer().min(1).default(1),
        populate: Joi.string().valid('instructors', 'enrollmentCount').allow('').default(''),
    }),
};

const getCohort = {
    params: Joi.object().keys({
        cohortId: Joi.string().custom(objectId).required(),
    }),
};

const updateStatus = {
    params: Joi.object().keys({
        cohortId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        status: Joi.string()
            .valid('upcoming', 'ongoing', 'completed', 'cancelled')
            .required()
            .messages({ 'any.required': 'Status là bắt buộc' }),

        cancelReason: Joi.string().trim().max(500)
            .when('status', {
                is: 'cancelled',
                then: Joi.required().messages({ 'any.required': 'Vui lòng cung cấp lý do hủy' }),
                otherwise: Joi.optional().allow(''),
            }),
    }),
};

const assignInstructor = {
    params: Joi.object().keys({
        cohortId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        instructorId: Joi.string().custom(objectId).required()
            .messages({ 'any.required': 'Giảng viên là bắt buộc' }),
        role: Joi.string().valid('lead', 'assistant', 'guest').default('assistant'),
    }),
};

const removeInstructor = {
    params: Joi.object().keys({
        cohortId: Joi.string().custom(objectId).required(),
        instructorId: Joi.string().custom(objectId).required(),
    }),
};

const deleteCohort = {
    params: Joi.object().keys({
        cohortId: Joi.string().custom(objectId).required(),
    }),
};

module.exports = {
    createCohort,
    updateCohort,
    getCohorts,
    getCohort,
    updateStatus,
    assignInstructor,
    removeInstructor,
    deleteCohort,
};