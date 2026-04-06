const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const jwt = require("jsonwebtoken");

const register = async (userBody) => {
    if (await User.isEmailTaken(userBody.email)) {
        throw new ApiError(404, 'Email đã được sử dụng');
    }

    const user = await User.create({
        firstName: userBody.firstName,
        lastName: userBody.lastName,
        email: userBody.email,
        password: userBody.password,
        phone: userBody.phone,
    });

    return user;
};

const login = async (email, password) => {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        throw new ApiError(403, 'Email hoặc mật khẩu không đúng');
    }

    if (!user.isActive) {
        throw new ApiError(403, 'Tài khoản này đã bị vô hiệu hóa');
    }

    const isPasswordMatch = await user.isPasswordMatch(password);
    if (!isPasswordMatch) {
        throw new ApiError(403, 'Email hoặc mật khẩu không đúng');
    }

    await user.updateLastLogin();

    const accessToken = jwt.sign({
        id: user._id.toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
    },
        process.env.JWT_SECRET, { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign({
        id: user._id.toString(),
        type: 'refresh'
    },
        process.env.REFRESH_SECRET,
        { expiresIn: "7d" }
    );

    return {
        user: user.toAuthJSON(),
        accessToken: accessToken,
        refreshToken: refreshToken
    };
};

const refreshAccessToken = async (refreshToken) => {
    if (!refreshToken) {
        throw new ApiError(401, 'Refresh token không tồn tại');
    }

    let decoded;
    try {
        decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    } catch (err) {
        throw new ApiError(401, 'Refresh token không hợp lệ hoặc đã hết hạn');
    }

    if (decoded.type !== 'refresh') {
        throw new ApiError(401, 'Token không hợp lệ');
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
        throw new ApiError(401, 'User không tồn tại hoặc bị khoá');
    }

    const accessToken = jwt.sign(
        {
            id: user._id.toString(),
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    const newRefreshToken = jwt.sign(
        {
            id: user._id.toString(),
            type: 'refresh'
        },
        process.env.REFRESH_SECRET,
        { expiresIn: '7d' }
    );

    return {
        accessToken,
        refreshToken: newRefreshToken,
        user: user.toAuthJSON()
    };
};

const forgotPassword = async (email) => {
    const user = await User.findOne({ email });

    if (!user) {
        return { user: null, token: null };
    }

    const token = user.createResetToken();

    await user.save();

    return {
        user,
        token
    };
};

const resetPassword = async (resetToken, newPassword) => {
    const user = await User.findByResetToken(resetToken);

    if (!user) {
        throw new ApiError(404, 'Reset token không hợp lệ hoặc đã hết hạn');
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return user;
};

module.exports = {
    refreshAccessToken,
    login,
    register,
    forgotPassword,
    resetPassword
}