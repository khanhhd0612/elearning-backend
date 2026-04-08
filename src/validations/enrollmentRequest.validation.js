const Joi = require('joi');
const { objectId } = require('./custom.validation');

const assignCounselor = {
    params: Joi.object().keys({
        requestId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        counselorId: Joi.string().custom(objectId).required()
            .messages({ 'any.required': 'Counselor là bắt buộc' }),
    }),
};

const logCall = {
    params: Joi.object().keys({
        requestId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        outcome: Joi.string()
            .valid('reached', 'no_answer', 'rescheduled')
            .required()
            .messages({ 'any.required': 'Kết quả cuộc gọi là bắt buộc' }),

        notes: Joi.string().trim().max(1000).allow('').default(''),

        rescheduleAt: Joi.date().iso()
            .when('outcome', {
                is: 'rescheduled',
                then: Joi.required()
                    .messages({ 'any.required': 'Vui lòng cung cấp thời gian gọi lại' }),
                otherwise: Joi.optional().allow(null),
            }),
    }),
};

const logInterview = {
    params: Joi.object().keys({
        requestId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        recommendation: Joi.string()
            .valid('approve', 'reject', 'consider')
            .required()
            .messages({ 'any.required': 'Đánh giá phỏng vấn là bắt buộc' }),

        notes: Joi.string().trim().max(2000).allow('').default(''),
        score: Joi.number().min(0).max(10).allow(null).default(null),
    }),
};

const reviewRequest = {
    params: Joi.object().keys({
        requestId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        action: Joi.string()
            .valid('approved', 'rejected')
            .required()
            .messages({ 'any.required': 'Action là bắt buộc' }),

        rejectionReason: Joi.string().trim().max(1000)
            .when('action', {
                is: 'rejected',
                then: Joi.required()
                    .messages({ 'any.required': 'Vui lòng cung cấp lý do từ chối' }),
                otherwise: Joi.optional().allow(''),
            }),
    }),
};

const getRequests = {
    query: Joi.object().keys({
        status: Joi.string().valid('pending', 'called', 'interviewed', 'approved', 'rejected'),
        courseId: Joi.string().custom(objectId),
        cohortId: Joi.string().custom(objectId),
        assignedCounselor: Joi.string().custom(objectId),
        sortBy: Joi.string().valid('createdAt:asc', 'createdAt:desc').default('createdAt:asc'),
        limit: Joi.number().integer().min(1).max(100).default(20),
        page: Joi.number().integer().min(1).default(1),
    }),
};

module.exports = { assignCounselor, logCall, logInterview, reviewRequest, getRequests };