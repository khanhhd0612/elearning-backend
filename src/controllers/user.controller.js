const userService = require("../services/user.service");
const catchAsync = require('../utils/catchAsync');
const pick = require('../utils/pick');

const getUser = catchAsync(async (req, res) => {
    const user = await userService.getUserById(req.params.userId);

    res.status(200).json({
        status: 'success',
        data: user
    });
});

const queryUsers = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['role', 'isActive']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);

    const users = await userService.queryUsers(filter, options);

    res.status(200).json({
        status: 'success',
        data: users,
    });
});

const changePassword = catchAsync(async (req, res) => {
    const { password, newPassword } = req.body;
    const user = await userService.changePassword(req.user.id, password, newPassword);

    res.status(200).json({
        status: 'success',
        message: 'Mật khẩu đã được thay đổi',
        data: user
    });
});

const toggleUser = catchAsync(async (req, res) => {
    const user = await userService.toggleUser(req.params.userId);

    res.status(200).json({
        status: 'success',
        message: `Đã ${user.isActive ? 'kích hoạt' : 'vô hiệu hóa'} người dùng thành công`,
        data: user
    });
});

const createUser = catchAsync(async (req, res) => {
    const user = await userService.createUser(req.body);

    res.status(201).json({
        status: 'success',
        message: 'Tạo user thành công',
        data: user
    });
});

const updateRole = catchAsync(async (req, res) => {
    const { userId, role } = req.body;

    const user = await userService.updateRole(userId, role);

    res.status(201).json({
        status: 'success',
        message: 'Cập nhật role thành công',
        data: user
    });
})

module.exports = {
    getUser,
    queryUsers,
    changePassword,
    toggleUser,
    createUser,
    updateRole
}