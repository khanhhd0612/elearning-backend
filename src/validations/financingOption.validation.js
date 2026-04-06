const Joi = require('joi');
const { objectId } = require('./custom.validation');

const installmentRule = Joi.object({
    dueDate: Joi.date().iso().required()
        .messages({ 'any.required': 'Ngày đến hạn là bắt buộc' }),
    amount: Joi.number().min(0).required()
        .messages({ 'any.required': 'Số tiền đợt là bắt buộc' }),
});

const createFinancingOption = {
    params: Joi.object().keys({
        enrollmentId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object()
        .keys({
            type: Joi.string()
                .valid('full', 'installment', 'scholarship', 'isa')
                .required()
                .messages({ 'any.required': 'Loại thanh toán là bắt buộc' }),

            totalAmount: Joi.number().min(0).required()
                .messages({ 'any.required': 'Tổng tiền là bắt buộc' }),

            provider: Joi.string().trim().allow('').default(''),
            notes: Joi.string().trim().max(1000).allow('').default(''),

            // installment
            installments: Joi.array().items(installmentRule).when('type', {
                is: 'installment',
                then: Joi.array().min(2).required()
                    .messages({
                        'any.required': 'Cần ít nhất 2 đợt thanh toán',
                        'array.min': 'Cần ít nhất 2 đợt thanh toán',
                    }),
                otherwise: Joi.array().max(0).default([]),
            }),

            // scholarship
            scholarshipCode: Joi.string().trim().when('type', { is: 'scholarship', then: Joi.required() }),
            discountAmount: Joi.number().min(0).default(0),
            discountPercentage: Joi.number().min(0).max(100).default(0),

            // isa
            isaPercentage: Joi.number().min(0).max(100).when('type', {
                is: 'isa', then: Joi.required()
                    .messages({ 'any.required': 'Phần trăm ISA là bắt buộc' }),
            }),
            isaDurationMonths: Joi.number().integer().min(1).when('type', {
                is: 'isa', then: Joi.required()
                    .messages({ 'any.required': 'Thời hạn ISA là bắt buộc' }),
            }),
            isaStartDate: Joi.date().iso().allow(null).default(null),
        })
        .custom((value, helpers) => {
            // Validate: tổng installment phải bằng totalAmount
            if (value.type === 'installment' && value.installments?.length) {
                const sum = value.installments.reduce((acc, i) => acc + i.amount, 0);
                if (Math.abs(sum - value.totalAmount) > 1) { // cho phép sai số 1 đồng
                    return helpers.error('any.invalid', {
                        message: `Tổng các đợt (${sum.toLocaleString()}) phải bằng totalAmount (${value.totalAmount.toLocaleString()})`,
                    });
                }
            }
            // Validate: discountAmount không vượt totalAmount
            if (value.type === 'scholarship' && value.discountAmount > value.totalAmount) {
                return helpers.error('any.invalid', {
                    message: 'discountAmount không được lớn hơn totalAmount',
                });
            }
            return value;
        }),
};

const recordPayment = {
    params: Joi.object().keys({
        financingId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        amount: Joi.number().min(1).required()
            .messages({ 'any.required': 'Số tiền thanh toán là bắt buộc' }),

        // Nếu là installment, chỉ định đợt nào được thanh toán
        installmentId: Joi.string().custom(objectId).allow(null).default(null),

        notes: Joi.string().trim().max(500).allow('').default(''),
    }),
};

const updateIsa = {
    params: Joi.object().keys({
        financingId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        isaStartDate: Joi.date().iso().required(),
        isaPercentage: Joi.number().min(0).max(100),
        isaDurationMonths: Joi.number().integer().min(1),
    }).min(1),
};

const getFinancingOption = {
    params: Joi.object().keys({
        financingId: Joi.string().custom(objectId).required(),
    }),
};

const getByEnrollment = {
    params: Joi.object().keys({
        enrollmentId: Joi.string().custom(objectId).required(),
    }),
};

const cancelFinancingOption = {
    params: Joi.object().keys({
        financingId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        notes: Joi.string().trim().max(500).allow('').default(''),
    }),
};

module.exports = {
    createFinancingOption,
    recordPayment,
    updateIsa,
    getFinancingOption,
    getByEnrollment,
    cancelFinancingOption,
};