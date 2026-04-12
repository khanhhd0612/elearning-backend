const Joi = require('joi');
const { objectId } = require('./custom.validation');

const oncampusDetailSchema = Joi.object({
    campusId: Joi.string().custom(objectId).required().messages({ 'any.required': 'Campus là bắt buộc' }),
    hoursPerWeek: Joi.number().integer().min(1).required(),
    schedule: Joi.string().trim().allow(''),
    maxSeats: Joi.number().integer().min(1).required(),
});

const onlineDetailSchema = Joi.object({
    totalVideos: Joi.number().integer().min(0).default(0),
    totalHours: Joi.number().min(0).default(0),
    platform: Joi.string().trim().allow(''),
    hasLifetimeAccess: Joi.boolean().default(false),
    hasCertificate: Joi.boolean().default(true),
});

const remoteDetailSchema = Joi.object({
    timezone: Joi.string().default('Asia/Ho_Chi_Minh'),
    hoursPerWeek: Joi.number().integer().min(1).required(),
    schedule: Joi.string().trim().allow(''),
    maxSeats: Joi.number().integer().min(1).required(),
});

const hybridDetailSchema = Joi.object({
    campusId: Joi.string().custom(objectId).required(),
    oncampusHours: Joi.number().min(0).required(),
    remoteHours: Joi.number().min(0).required(),
    onlineHours: Joi.number().min(0).default(0),
    schedule: Joi.string().trim().allow(''),
    maxSeats: Joi.number().integer().min(1).required(),
});

const detailSchemaMap = {
    oncampus: oncampusDetailSchema,
    online: onlineDetailSchema,
    remote: remoteDetailSchema,
    hybrid: hybridDetailSchema,
};

const createCourseFormat = {
    params: Joi.object().keys({
        courseId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object()
        .keys({
            formatType: Joi.string()
                .valid('oncampus', 'online', 'remote', 'hybrid')
                .required()
                .messages({ 'any.required': 'Loại hình học là bắt buộc' }),

            priceOverride: Joi.number().min(0).allow(null).default(null),
            isActive: Joi.boolean().default(true),

            oncampusDetail: oncampusDetailSchema,
            onlineDetail: onlineDetailSchema,
            remoteDetail: remoteDetailSchema,
            hybridDetail: hybridDetailSchema,
        })
        .custom((value, helpers) => {
            const { formatType } = value;
            const detailKey = `${formatType}Detail`;

            if (!value[detailKey]) {
                return helpers.error('any.invalid', {
                    message: `Thiếu ${detailKey} cho format type "${formatType}"`,
                });
            }

            // Validate detail tương ứng
            const { error } = detailSchemaMap[formatType].validate(value[detailKey]);
            if (error) {
                return helpers.error('any.invalid', { message: error.message });
            }

            return value;
        }),
};

const updateCourseFormat = {
    params: Joi.object().keys({
        courseId: Joi.string().custom(objectId).required(),
        courseFormatId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object()
        .keys({
            priceOverride: Joi.number().min(0).allow(null),
            isActive: Joi.boolean(),
            oncampusDetail: oncampusDetailSchema,
            onlineDetail: onlineDetailSchema,
            remoteDetail: remoteDetailSchema,
            hybridDetail: hybridDetailSchema,
        })
        .min(1)
        .messages({ 'object.min': 'Cần ít nhất 1 trường để cập nhật' }),
    // Lưu ý: không cho phép đổi formatType sau khi tạo
};

const getCourseFormats = {
    params: Joi.object().keys({
        courseId: Joi.string().custom(objectId).required(),
    }),
    query: Joi.object().keys({
        formatType: Joi.string().valid('oncampus', 'online', 'remote', 'hybrid'),
        isActive: Joi.boolean(),
    }),
};

const getCourseFormat = {
    params: Joi.object().keys({
        courseId: Joi.string().custom(objectId).required(),
        courseFormatId: Joi.string().custom(objectId).required(),
    }),
};

const toggleCourseFormat = {
    params: Joi.object().keys({
        courseId: Joi.string().custom(objectId).required(),
        courseFormatId: Joi.string().custom(objectId).required(),
    }),
};

const deleteCourseFormat = {
    params: Joi.object().keys({
        courseId: Joi.string().custom(objectId).required(),
        courseFormatId: Joi.string().custom(objectId).required(),
    }),
};

module.exports = {
    createCourseFormat,
    updateCourseFormat,
    getCourseFormats,
    getCourseFormat,
    toggleCourseFormat,
    deleteCourseFormat,
};