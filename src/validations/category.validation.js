const Joi = require('joi');
const { objectId } = require('./custom.validation');

const colorHexRegex = /^#([0-9A-F]{3}){1,2}$/i;

const getCategories = {
    query: Joi.object().keys({
        parentId: Joi.string().custom(objectId).messages({
            'string.base': 'parentId phải là chuỗi',
        }),
        isActive: Joi.boolean(),
        sortBy: Joi.string(),
        limit: Joi.number().integer().min(1).max(100).messages({
            'number.base': 'Limit phải là số',
            'number.integer': 'Limit phải là số nguyên',
            'number.min': 'Limit tối thiểu là 1',
            'number.max': 'Limit tối đa là 100',
        }),
        page: Joi.number().integer().min(1).messages({
            'number.base': 'Page phải là số',
            'number.integer': 'Page phải là số nguyên',
            'number.min': 'Page tối thiểu là 1',
        }),
    }),
};

const getCategory = {
    params: Joi.object().keys({
        categoryId: Joi.string().required().custom(objectId).messages({
            'string.empty': 'categoryId không được để trống',
            'any.required': 'categoryId là bắt buộc',
        }),
    }),
};

const getCategoryBySlug = {
    params: Joi.object().keys({
        slug: Joi.string().required().trim().messages({
            'string.empty': 'Slug không được để trống',
            'any.required': 'Slug là bắt buộc',
        }),
    }),
};

const getChildCategories = {
    params: Joi.object().keys({
        categoryId: Joi.string().required().custom(objectId).messages({
            'string.empty': 'categoryId không được để trống',
            'any.required': 'categoryId là bắt buộc',
        }),
    }),
};

const createCategory = {
    body: Joi.object({
        name: Joi.string()
            .trim()
            .max(100)
            .required()
            .messages({
                'string.base': 'Tên danh mục phải là chuỗi',
                'string.empty': 'Tên danh mục không được để trống',
                'string.max': 'Tên danh mục không được vượt quá 100 ký tự',
                'any.required': 'Tên danh mục là bắt buộc',
            }),

        parentId: Joi.alternatives()
            .try(
                Joi.string().custom(objectId),
                Joi.valid(null)
            )
            .default(null)
            .messages({
                'string.base': 'ID danh mục cha không hợp lệ',
                'any.only': 'ID danh mục cha không hợp lệ',
            }),

        icon: Joi.string()
            .trim()
            .max(50)
            .allow('', null)
            .messages({
                'string.base': 'Icon phải là chuỗi',
                'string.max': 'Icon không được vượt quá 50 ký tự',
            }),

        colorHex: Joi.string()
            .trim()
            .pattern(colorHexRegex)
            .allow('', null)
            .messages({
                'string.base': 'Màu phải là chuỗi',
                'string.pattern.base': 'Màu phải đúng định dạng HEX, ví dụ #3B82F6',
            }),

        description: Joi.string()
            .trim()
            .max(500)
            .allow('', null)
            .messages({
                'string.base': 'Mô tả phải là chuỗi',
                'string.max': 'Mô tả không được vượt quá 500 ký tự',
            }),

        sortOrder: Joi.number()
            .integer()
            .min(0)
            .default(0)
            .messages({
                'number.base': 'Thứ tự hiển thị phải là số',
                'number.integer': 'Thứ tự hiển thị phải là số nguyên',
                'number.min': 'Thứ tự hiển thị không được nhỏ hơn 0',
            }),
        level: Joi.number()
            .integer()
            .min(0)
            .default(0)
            .messages({
                'number.base': 'Thứ tự hiển thị phải là số',
                'number.integer': 'Thứ tự hiển thị phải là số nguyên',
                'number.min': 'Thứ tự hiển thị không được nhỏ hơn 0',
            }),

        isActive: Joi.boolean()
            .default(true)
            .messages({
                'boolean.base': 'Trạng thái hoạt động phải là true hoặc false',
            }),
    }),
};

const updateCategory = {
    params: Joi.object({
        categoryId: Joi.string().custom(objectId).required().messages({
            'string.base': 'ID danh mục không hợp lệ',
            'any.required': 'ID danh mục là bắt buộc',
        }),
    }),

    body: Joi.object({
        name: Joi.string()
            .trim()
            .max(100)
            .messages({
                'string.base': 'Tên danh mục phải là chuỗi',
                'string.empty': 'Tên danh mục không được để trống',
                'string.max': 'Tên danh mục không được vượt quá 100 ký tự',
            }),

        parentId: Joi.alternatives()
            .try(
                Joi.string().custom(objectId),
                Joi.valid(null)
            )
            .messages({
                'string.base': 'ID danh mục cha không hợp lệ',
                'any.only': 'ID danh mục cha không hợp lệ',
            }),

        icon: Joi.string()
            .trim()
            .max(50)
            .allow('', null)
            .messages({
                'string.base': 'Icon phải là chuỗi',
                'string.max': 'Icon không được vượt quá 50 ký tự',
            }),

        colorHex: Joi.string()
            .trim()
            .pattern(colorHexRegex)
            .allow('', null)
            .messages({
                'string.base': 'Màu phải là chuỗi',
                'string.pattern.base': 'Màu phải đúng định dạng HEX, ví dụ #3B82F6',
            }),

        description: Joi.string()
            .trim()
            .max(500)
            .allow('', null)
            .messages({
                'string.base': 'Mô tả phải là chuỗi',
                'string.max': 'Mô tả không được vượt quá 500 ký tự',
            }),

        sortOrder: Joi.number()
            .integer()
            .min(0)
            .messages({
                'number.base': 'Thứ tự hiển thị phải là số',
                'number.integer': 'Thứ tự hiển thị phải là số nguyên',
                'number.min': 'Thứ tự hiển thị không được nhỏ hơn 0',
            }),
        level: Joi.number()
            .integer()
            .min(0)
            .default(0)
            .messages({
                'number.base': 'Thứ tự hiển thị phải là số',
                'number.integer': 'Thứ tự hiển thị phải là số nguyên',
                'number.min': 'Thứ tự hiển thị không được nhỏ hơn 0',
            }),

        isActive: Joi.boolean().messages({
            'boolean.base': 'Trạng thái hoạt động phải là true hoặc false',
        }),
    })
        .min(1)
        .messages({
            'object.min': 'Phải có ít nhất 1 trường để cập nhật',
        }),
};

const deleteCategory = {
    params: Joi.object().keys({
        categoryId: Joi.string().required().custom(objectId).messages({
            'string.empty': 'categoryId không được để trống',
            'any.required': 'categoryId là bắt buộc',
        }),
    }),
};

const reorderCategories = {
    body: Joi.object().keys({
        orders: Joi.array()
            .items(
                Joi.object().keys({
                    id: Joi.string().required().custom(objectId).messages({
                        'string.empty': 'id không được để trống',
                        'any.required': 'id là bắt buộc',
                    }),
                    order: Joi.number().integer().min(0).required().messages({
                        'number.base': 'Thứ tự phải là số',
                        'number.integer': 'Thứ tự phải là số nguyên',
                        'number.min': 'Thứ tự không được âm',
                        'any.required': 'Thứ tự là bắt buộc',
                    }),
                })
            )
            .min(1)
            .required()
            .messages({
                'array.base': 'orders phải là mảng',
                'array.min': 'orders cần ít nhất 1 phần tử',
                'any.required': 'orders là bắt buộc',
            }),
    }),
};

module.exports = {
    getCategories,
    getCategory,
    getCategoryBySlug,
    getChildCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
};