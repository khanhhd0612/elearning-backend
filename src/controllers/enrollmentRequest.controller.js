const catchAsync = require('../utils/catchAsync');
const requestService = require('../services/enrollmentRequest.service');

const getRequests = catchAsync(async (req, res) => {
    const result = await requestService.getRequests(req.query, req.query);
    res.status(200).json({ status: 'success', data: result });
});

const assignCounselor = catchAsync(async (req, res) => {
    const request = await requestService.assignCounselor(
        req.params.requestId,
        req.body.counselorId
    );
    res.status(200).json({ status: 'success', data: request });
});

const logCall = catchAsync(async (req, res) => {
    const request = await requestService.logCall(
        req.params.requestId,
        req.user._id,
        req.body
    );
    res.status(200).json({
        status: 'success',
        message: `Đã ghi nhận cuộc gọi — kết quả: ${req.body.outcome}`,
        data: request,
    });
});

const logInterview = catchAsync(async (req, res) => {
    const request = await requestService.logInterview(
        req.params.requestId,
        req.user._id,
        req.body
    );
    res.status(200).json({
        status: 'success',
        message: 'Đã ghi nhận phỏng vấn',
        data: request,
    });
});

const reviewRequest = catchAsync(async (req, res) => {
    const request = await requestService.reviewRequest(
        req.params.requestId,
        req.user._id,
        req.body
    );
    res.status(200).json({
        status: 'success',
        message: request.status === 'approved' ? 'Đã duyệt thành công' : 'Đã từ chối',
        data: request,
    });
});

module.exports = {
    getRequests,
    assignCounselor,
    logCall,
    logInterview,
    reviewRequest
}