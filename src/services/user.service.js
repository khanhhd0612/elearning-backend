const User = require('../models/user.model');
const { initWallet } = require('./wallet.service');
const ApiError = require('../utils/ApiError');

const getUserById = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, 'User không tồn tại');
    }

    return user;
}

const changePassword = async (userId, password, newPassword) => {
    const user = await User.findById(userId).select('+password');

    if (!user) {
        throw new ApiError(404, 'User không tồn tại');
    }

    const isPasswordMatch = await user.isPasswordMatch(password);
    if (!isPasswordMatch) {
        throw new ApiError(403, 'Mật khẩu cũ không đúng');
    }

    user.password = newPassword;
    await user.save();

    return user;
};

const queryUsers = async (filter, options) => {
    return User.paginate(filter, {
        sortBy: options.sortBy || 'firstName:asc',
        limit: options.limit || 10,
        page: options.page || 1,
    });
}

const toggleUser = async (userId) => {
    const user = await getUserById(userId);

    user.isActive = !user.isActive;

    await user.save();
    return user;
}

const createUser = async (userBody) => {
    if (await User.isEmailTaken(userBody.email)) {
        throw new ApiError(404, 'Email đã được sử dụng');
    }

    const user = await User.create({
        firstName: userBody.firstName,
        lastName: userBody.lastName,
        email: userBody.email,
        password: userBody.password,
        phone: userBody.phone,
        role: userBody.role
    });

    await initWallet(user._id);

    return user;
}

const updateRole = async (userId, role) => {
    const user = await getUserById(userId);

    if (user.role === 'admin') {
        throw new ApiError(403, 'Không thể thay đổi role của admin');
    }

    if (role === 'admin') {
        throw new ApiError(403, 'Không được phép gán role admin');
    }

    user.role = role;
    await user.save();

    return user;
};

module.exports = {
    getUserById,
    changePassword,
    toggleUser,
    queryUsers,
    createUser,
    updateRole
}