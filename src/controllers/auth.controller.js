const catchAsync = require('../utils/catchAsync');
const authService = require('../services/auth.service');
const userService = require('../services/user.service');
const emailService = require('../services/email.service');

const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.login(email, password);

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7d
    });

    return res.json({
        status: "success",
        message: "Đăng nhập thành công",
        data: {
            user,
            accessToken: accessToken
        }
    })
});

const register = catchAsync(async (req, res) => {
    const user = await authService.register(req.body);

    return res.json({
        status: "success",
        message: "Đăng ký thành công. Vui lòng kiểm tra email để xác minh",
        data: {
            user
        }
    });
});

const logout = catchAsync(async (req, res) => {
    await authService.logout();
    res.clearCookie('refreshToken');

    return res.json({
        status: "success",
        message: "Đăng xuất thành công"
    });
});

const refreshAccessToken = catchAsync(async (req, res) => {
    const { refreshToken } = req.cookies;

    const { accessToken, refreshToken: newRefreshToken, user } =
        await authService.refreshAccessToken(refreshToken);

    res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
        status: "success",
        message: "Token được làm mới thành công",
        data: {
            user,
            accessToken: accessToken
        }
    });
});

const getMe = catchAsync(async (req, res) => {
    const userId = req.user.id;

    const user = await userService.getUserById(userId);

    res.status(200).json({
        status: 'success',
        message: 'Lấy profile thành công',
        data: {
            user: user.getPublicProfile()
        }
    });
});

const forgotPassword = catchAsync(async (req, res) => {
    const { email } = req.body;

    const { user, token } = await authService.forgotPassword(email);

    if (!user) {
        return res.status(200).json({ status: 'success', message: 'Email đặt lại mật khẩu đã được gửi' });
    }

    await emailService.sendResetPassword(user, token);

    res.status(200).json({
        status: 'success',
        message: 'Email đặt lại mật khẩu đã được gửi',
        ...(process.env.NODE_ENV === 'development' && { token }),
    });
});

const resetPassword = catchAsync(async (req, res) => {
    const { resetToken } = req.params;
    const { newPassword } = req.body;

    const user = await authService.resetPassword(resetToken, newPassword);

    res.status(200).json({
        status: 'success',
        message: 'Reset mật khẩu thành công',
        data: {
            user: user.toAuthJSON()
        }
    });
});

module.exports = {
    login,
    logout,
    register,
    refreshAccessToken,
    getMe,
    forgotPassword,
    resetPassword
}