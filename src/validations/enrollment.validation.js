const Joi = require('joi');
const { objectId } = require('./custom.validation');

const enroll = {
    body: Joi.object()
        .keys({
            // instructor_led: cung cấp cohortId
            cohortId: Joi.string().custom(objectId),
            // self_paced: cung cấp courseFormatId
            courseFormatId: Joi.string().custom(objectId),
        })
        .or('cohortId', 'courseFormatId') // phải có ít nhất 1 trong 2
        .messages({
            'object.missing': 'Vui lòng cung cấp cohortId (có lớp) hoặc courseFormatId (tự học)',
        }),
};

const requestEnrollment = {
    body: Joi.object().keys({
        courseFormatId: Joi.string().custom(objectId).required()
            .messages({ 'any.required': 'Course Format là bắt buộc' }),
        motivation: Joi.string().trim().min(50).max(2000).required()
            .messages({
                'any.required': 'Vui lòng cho biết lý do bạn muốn tham gia',
                'string.min': 'Lý do phải có ít nhất 50 ký tự',
            }),
    }),
};

const reviewRequest = {
    params: Joi.object().keys({
        requestId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        action: Joi.string().valid('approved', 'rejected').required()
            .messages({ 'any.required': 'Action là bắt buộc' }),
        rejectionReason: Joi.string().trim().max(1000)
            .when('action', {
                is: 'rejected',
                then: Joi.required().messages({ 'any.required': 'Vui lòng cung cấp lý do từ chối' }),
                otherwise: Joi.optional().allow(''),
            }),
    }),
};

const getPendingRequests = {
    query: Joi.object().keys({
        cohortId: Joi.string().custom(objectId),
        courseId: Joi.string().custom(objectId),
        status: Joi.string().valid('pending', 'called', 'interviewed', 'approved', 'rejected').default('pending'),
        sortBy: Joi.string().valid('createdAt:asc', 'createdAt:desc').default('createdAt:asc'),
        limit: Joi.number().integer().min(1).max(100).default(20),
        page: Joi.number().integer().min(1).default(1),
    }),
};

const sendInvite = {
    body: Joi.object().keys({
        courseId: Joi.string().custom(objectId).required(),
        email: Joi.string().email().lowercase().trim().required(),
    }),
};

const acceptInvite = {
    body: Joi.object().keys({
        token: Joi.string().trim().length(64).required()
            .messages({ 'string.length': 'Token không hợp lệ' }),
        // cohortId optional — null với self_paced, required với instructor_led
        cohortId: Joi.string().custom(objectId).allow(null).default(null),
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