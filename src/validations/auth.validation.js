const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

/**
 * Đăng ký user mới
 */
const register = {
    body: Joi.object().keys({
        email: Joi.string()
            .email()
            .required()
            .trim()
            .lowercase()
            .messages({
                'string.base': 'Email phải là chuỗi',
                'string.empty': 'Email không được để trống',
                'string.email': 'Email không hợp lệ',
                'any.required': 'Email là bắt buộc'
            }),

        password: Joi.string()
            .required()
            .custom(password)
            .messages({
                'string.base': 'Mật khẩu phải là chuỗi',
                'string.empty': 'Mật khẩu không được để trống',
                'any.required': 'Mật khẩu là bắt buộc'
            }),

        firstName: Joi.string()
            .required()
            .trim()
            .max(100)
            .messages({
                'string.base': 'Tên phải là chuỗi',
                'string.empty': 'Tên không được để trống',
                'string.max': 'Tên không quá 100 ký tự',
                'any.required': 'Tên là bắt buộc'
            }),
        lastName: Joi.string()
            .required()
            .trim()
            .max(100)
            .messages({
                'string.base': 'Họ phải là chuỗi',
                'string.empty': 'Họ không được để trống',
                'string.max': 'Họ không quá 100 ký tự',
                'any.required': 'Họ là bắt buộc'
            }),

        phone: Joi.string()
            .required()
            .pattern(/^(0[3|5|7|8|9])[0-9]{8}$/)
            .messages({
                'string.base': 'Số điện thoại phải là chuỗi',
                'string.empty': 'Số điện thoại không được để trống',
                'string.pattern.base': 'Số điện thoại Việt Nam không hợp lệ (bắt đầu 03, 05, 07, 08, 09)',
                'any.required': 'Số điện thoại là bắt buộc'
            }),

    })
};

/**
 * Đăng nhập
 */
const login = {
    body: Joi.object().keys({
        email: Joi.string()
            .email()
            .required()
            .trim()
            .lowercase()
            .messages({
                'string.base': 'Email phải là chuỗi',
                'string.empty': 'Email không được để trống',
                'string.email': 'Email không hợp lệ',
                'any.required': 'Email là bắt buộc'
            }),

        password: Joi.string()
            .required()
            .messages({
                'string.base': 'Mật khẩu phải là chuỗi',
                'string.empty': 'Mật khẩu không được để trống',
                'any.required': 'Mật khẩu là bắt buộc'
            })
    })
};

/**
 * Làm mới token 
 */
const refreshAccessToken = {
    body: Joi.object().keys({})
    // Refresh token lấy từ req.cookies.refreshToken
};

/**
 * Đăng xuất 
 */
const logout = {
    body: Joi.object().keys({})
};

/**
 * Quên mật khẩu
 */
const forgotPassword = {
    body: Joi.object().keys({
        email: Joi.string()
            .email()
            .required()
            .trim()
            .lowercase()
            .messages({
                'string.base': 'Email phải là chuỗi',
                'string.empty': 'Email không được để trống',
                'string.email': 'Email không hợp lệ',
                'any.required': 'Email là bắt buộc'
            })
    })
};

/**
 * Đặt lại mật khẩu
 */
const resetPassword = {
    params: Joi.object().keys({
        resetToken: Joi.string()
            .required()
            .messages({
                'string.base': 'Token phải là chuỗi',
                'string.empty': 'Token không được để trống',
                'any.required': 'Token là bắt buộc'
            })
    }),

    body: Joi.object().keys({
        newPassword: Joi.string()
            .required()
            .custom(password)
            .messages({
                'string.base': 'Mật khẩu phải là chuỗi',
                'string.empty': 'Mật khẩu không được để trống',
                'any.required': 'Mật khẩu là bắt buộc'
            })
    })
};

/**
 * Xác minh email
 */
const verifyEmail = {
    params: Joi.object().keys({
        token: Joi.string()
            .required()
            .messages({
                'string.base': 'Token phải là chuỗi',
                'string.empty': 'Token không được để trống',
                'any.required': 'Token là bắt buộc'
            })
    })
};

/**
 * Thay đổi mật khẩu
 */
const changePassword = {
    body: Joi.object().keys({
        password: Joi.string()
            .required()
            .messages({
                'string.base': 'Mật khẩu cũ phải là chuỗi',
                'string.empty': 'Mật khẩu cũ không được để trống',
                'any.required': 'Mật khẩu cũ là bắt buộc'
            }),

        newPassword: Joi.string()
            .required()
            .custom(password)
            .messages({
                'string.base': 'Mật khẩu mới phải là chuỗi',
                'string.empty': 'Mật khẩu mới không được để trống',
                'any.required': 'Mật khẩu mới là bắt buộc'
            })
    })
};

/**
 * Cập nhật profile
 */
const updateProfile = {
    body: Joi.object().keys({
        firstName: Joi.string()
            .trim()
            .max(100)
            .messages({
                'string.base': 'Tên phải là chuỗi',
                'string.max': 'Tên không quá 100 ký tự'
            }),
        lastName: Joi.string()
            .trim()
            .max(100)
            .messages({
                'string.base': 'Họ phải là chuỗi',
                'string.max': 'Họ không quá 100 ký tự'
            }),

        phone: Joi.string()
            .pattern(/^(0[3|5|7|8|9])[0-9]{8}$/)
            .messages({
                'string.pattern.base': 'Số điện thoại Việt Nam không hợp lệ'
            }),

        position: Joi.string()
            .trim()
            .max(50)
            .messages({
                'string.base': 'Chức vụ phải là chuỗi',
                'string.max': 'Chức vụ không quá 50 ký tự'
            }),

        profileImage: Joi.string()
            .uri()
            .messages({
                'string.uri': 'URL ảnh không hợp lệ'
            })
    })
};

const queryUsers = {
    query: Joi.object().keys({
        isActive: Joi.boolean(),
        role: Joi.string(),
        sortBy: Joi.string().valid('createdAt:desc', 'createdAt:asc').default('createdAt:desc'),
        limit: Joi.number().integer().min(1).max(100).default(10),
        page: Joi.number().integer().min(1).default(1),
    }),
}

/**
 * Tạo user (chỉ admin)
 */
const createUser = {
    body: Joi.object().keys({
        email: Joi.string()
            .email()
            .required()
            .trim()
            .lowercase()
            .messages({
                'string.email': 'Email không hợp lệ',
                'any.required': 'Email là bắt buộc'
            }),

        password: Joi.string()
            .required()
            .custom(password)
            .messages({
                'any.required': 'Mật khẩu là bắt buộc'
            }),

        firstName: Joi.string()
            .required()
            .trim()
            .max(100)
            .messages({
                'any.required': 'Tên là bắt buộc'
            }),
        lastName: Joi.string()
            .required()
            .trim()
            .max(100)
            .messages({
                'any.required': 'Họ là bắt buộc'
            }),

        phone: Joi.string()
            .required()
            .pattern(/^(0[3|5|7|8|9])[0-9]{8}$/)
            .messages({
                'any.required': 'Số điện thoại là bắt buộc'
            }),

        role: Joi.string()
            .valid('student', 'instructor', 'counselor', 'admin')
            .default('student')
            .messages({
                'any.only': 'Role phải là: student instructor counselor admin'
            })
    })
};

/**
 * Cập nhật user (chỉ admin)
 */
const updateUser = {
    params: Joi.object().keys({
        userId: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/) // MongoDB ObjectId
            .required()
            .messages({
                'string.pattern.base': 'User ID không hợp lệ',
                'any.required': 'User ID là bắt buộc'
            })
    }),

    body: Joi.object().keys({
        email: Joi.string()
            .email()
            .trim()
            .lowercase()
            .messages({
                'string.email': 'Email không hợp lệ'
            }),

        firstName: Joi.string()
            .trim()
            .max(100)
            .messages({
                'string.max': 'Tên không quá 100 ký tự'
            }),

        lastName: Joi.string()
            .trim()
            .max(100)
            .messages({
                'string.max': 'Họ không quá 100 ký tự'
            }),

        phone: Joi.string()
            .pattern(/^(0[3|5|7|8|9])[0-9]{8}$/)
            .messages({
                'string.pattern.base': 'Số điện thoại Việt Nam không hợp lệ'
            }),

        position: Joi.string()
            .trim()
            .max(50)
            .messages({
                'string.max': 'Chức vụ không quá 50 ký tự'
            }),

        role: Joi.string()
            .valid('student', 'instructor', 'counselor', 'admin')
            .messages({
                'any.only': 'Role phải là: student, instructor, counselor, admin'
            }),

        isActive: Joi.boolean()
            .messages({
                'boolean.base': 'isActive phải là true hoặc false'
            })
    })
};

/**
 * Xóa user (chỉ admin)
 */
const deleteUser = {
    params: Joi.object().keys({
        userId: Joi.string().custom(objectId).required(),
    })
};

const getUser = {
    params: Joi.object().keys({
        userId: Joi.string().custom(objectId).required(),
    }),
};

const updateRole = {
    body: Joi.object().keys({
        userId: Joi.string().custom(objectId).required(),
        role: Joi.string().required()
            .valid('student', 'instructor', 'counselor', 'admin')
            .messages({
                'any.only': 'Role phải là: student, instructor, counselor, admin'
            }),
    })
}

module.exports = {
    register,
    login,
    logout,
    refreshAccessToken,
    forgotPassword,
    resetPassword,
    verifyEmail,
    changePassword,
    updateProfile,
    createUser,
    updateUser,
    deleteUser,
    queryUsers,
    getUser,
    updateRole
};