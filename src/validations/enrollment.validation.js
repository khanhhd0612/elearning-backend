const Joi = require('joi');
const { objectId } = require('./custom.validation');

const enroll = {
    body: Joi.object().keys({
        cohortId: Joi.string().custom(objectId).required()
            .messages({ 'any.required': 'Cohort là bắt buộc' }),
    }),
};

const requestEnrollment = {
    body: Joi.object().keys({
        cohortId: Joi.string().custom(objectId).required()
            .messages({ 'any.required': 'Cohort là bắt buộc' }),

        motivation: Joi.string().trim().min(50).max(2000).required()
            .messages({
                'any.required': 'Vui lòng cho biết lý do bạn muốn tham gia',
                'string.min':   'Lý do phải có ít nhất 50 ký tự',
                'string.max':   'Lý do không quá 2000 ký tự',
            }),
    }),
};

const reviewRequest = {
    params: Joi.object().keys({
        requestId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        action: Joi.string().valid('approved', 'rejected').required()
            .messages({
                'any.required': 'Action là bắt buộc',
                'any.only':     'Action phải là approved hoặc rejected',
            }),

        rejectionReason: Joi.string().trim().max(1000)
            .when('action', {
                is:   'rejected',
                then: Joi.required()
                    .messages({ 'any.required': 'Vui lòng cung cấp lý do từ chối' }),
                otherwise: Joi.optional().allow(''),
            }),
    }),
};

const getPendingRequests = {
    query: Joi.object().keys({
        cohortId: Joi.string().custom(objectId),
        courseId: Joi.string().custom(objectId),
        status:   Joi.string().valid('pending', 'approved', 'rejected').default('pending'),
        sortBy:   Joi.string().valid('createdAt:asc', 'createdAt:desc').default('createdAt:asc'),
        limit:    Joi.number().integer().min(1).max(100).default(20),
        page:     Joi.number().integer().min(1).default(1),
    }),
};

const sendInvite = {
    body: Joi.object().keys({
        courseId: Joi.string().custom(objectId).required()
            .messages({ 'any.required': 'Khóa học là bắt buộc' }),

        email: Joi.string().email().lowercase().trim().required()
            .messages({
                'any.required':  'Email là bắt buộc',
                'string.email':  'Email không hợp lệ',
            }),
    }),
};

const acceptInvite = {
    body: Joi.object().keys({
        token: Joi.string().trim().length(64).required()
            .messages({
                'any.required':  'Token là bắt buộc',
                'string.length': 'Token không hợp lệ',
            }),

        cohortId: Joi.string().custom(objectId).required()
            .messages({ 'any.required': 'Cohort là bắt buộc' }),
    }),
};

module.exports = {
    enroll,
    requestEnrollment,
    reviewRequest,
    getPendingRequests,
    sendInvite,
    acceptInvite,
};