const Joi = require('joi');
const { objectId } = require('./custom.validation');

const initiateTopup = {
    body: Joi.object().keys({
        amount: Joi.number()
            .integer()
            .min(10000)     // tối thiểu 10k
            .max(50000000)  // tối đa 50M / lần nạp
            .required()
            .messages({
                'any.required': 'Số tiền nạp là bắt buộc',
                'number.min': 'Số tiền tối thiểu là 10.000 VND',
                'number.max': 'Số tiền tối đa mỗi lần nạp là 50.000.000 VND',
            }),

        gateway: Joi.string()
            .valid('vnpay', 'vietqr')
            .required()
            .messages({ 'any.required': 'Vui lòng chọn phương thức nạp tiền' }),
    }),
};

const purchaseWithWallet = {
    body: Joi.object().keys({
        enrollmentId: Joi.string().custom(objectId).required()
            .messages({ 'any.required': 'Enrollment là bắt buộc' }),
    }),
};

const getTransactions = {
    query: Joi.object().keys({
        type: Joi.string().valid('topup', 'purchase', 'refund'),
        status: Joi.string().valid('pending', 'completed', 'failed'),
        limit: Joi.number().integer().min(1).max(100).default(20),
        page: Joi.number().integer().min(1).default(1),
    }),
};

module.exports = {
    initiateTopup,
    purchaseWithWallet,
    getTransactions
};