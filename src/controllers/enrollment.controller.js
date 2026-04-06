const catchAsync = require('../utils/catchAsync');
const enrollmentService = require('../services/enrollment.service');

//Public
const enroll = catchAsync(async (req, res) => {
    const enrollment = await enrollmentService.enroll(
        req.user._id,
        req.body.cohortId
    );
    res.status(201).json({
        status: 'success',
        data: enrollment,
    });
});

// Approval — gửi request
const requestEnrollment = catchAsync(async (req, res) => {
    const request = await enrollmentService.requestEnrollment(
        req.user._id,
        req.body.cohortId,
        req.body.motivation
    );
    res.status(201).json({
        status: 'success',
        message: 'Yêu cầu đã được gửi, vui lòng chờ xét duyệt',
        data: request,
    });
});

// Approval — admin/instructor duyệt
const reviewEnrollmentRequest = catchAsync(async (req, res) => {
    const request = await enrollmentService.reviewEnrollmentRequest(
        req.params.requestId,
        req.user._id,
        req.body.action,
        req.body.rejectionReason
    );
    res.status(200).json({
        status: 'success',
        message: request.status === 'approved' ? 'Đã duyệt thành công' : 'Đã từ chối',
        data: request,
    });
});

//Approval — lấy danh sách request
const getPendingRequests = catchAsync(async (req, res) => {
    const filter = {};
    if (req.query.cohortId) filter.cohortId = req.query.cohortId;
    if (req.query.courseId) filter.courseId = req.query.courseId;
    if (req.query.status) filter.status = req.query.status;

    const result = await enrollmentService.getPendingRequests(filter, req.query);
    res.status(200).json({
        status: 'success',
        data: result,
    });
});

//Invite only — admin/instructor gửi lời mời
const sendInvite = catchAsync(async (req, res) => {
    const invite = await enrollmentService.sendInvite(
        req.body.courseId,
        req.body.email,
        req.user._id
    );
    res.status(201).json({
        status: 'success',
        message: `Lời mời đã được gửi đến ${req.body.email}`,
        data: invite,
    });
});

//Invite only — user xác nhận lời mời
const acceptInvite = catchAsync(async (req, res) => {
    const enrollment = await enrollmentService.acceptInvite(
        req.body.token,
        req.user._id,
        req.body.cohortId
    );
    res.status(201).json({
        status: 'success',
        message: 'Đăng ký thành công',
        data: enrollment,
    });
});

module.exports = {
    enroll,
    requestEnrollment,
    reviewEnrollmentRequest,
    getPendingRequests,
    sendInvite,
    acceptInvite,
};