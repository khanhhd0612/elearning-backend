const EnrollmentRequest = require('../models/enrollmentRequest.model');
const Enrollment = require('../models/enrollment.model');
const ApiError = require('../utils/ApiError');

const VALID_TRANSITIONS = {
    pending: ['called'],
    called: ['interviewed', 'called'], // called lại nếu no_answer/rescheduled
    interviewed: ['approved', 'rejected'],
};

const getRequest = async (requestId) => {
    const request = await EnrollmentRequest.findById(requestId)
        .populate('userId', 'firstName lastName email phone')
        .populate('courseId', 'title enrollmentType')
        .populate('cohortId', 'name startDate')
        .populate('assignedCounselor', 'firstName lastName');
    if (!request) throw new ApiError(404, 'Không tìm thấy request');
    return request;
};

const assignCounselor = async (requestId, counselorId) => {
    const request = await getRequest(requestId);

    if (['approved', 'rejected'].includes(request.status)) {
        throw new ApiError(400, 'Request này đã được xử lý xong');
    }

    request.assignedCounselor = counselorId;
    await request.save();
    return request;
};

const logCall = async (requestId, callerId, { notes, outcome, rescheduleAt }) => {
    const request = await getRequest(requestId);

    if (!['pending', 'called'].includes(request.status)) {
        throw new ApiError(
            400,
            `Không thể ghi nhận cuộc gọi — request đang ở trạng thái "${request.status}"`
        );
    }

    // Thêm vào call log
    request.callLogs.push({
        calledBy: callerId,
        calledAt: new Date(),
        notes,
        outcome,
        rescheduleAt: outcome === 'rescheduled' ? rescheduleAt : null,
    });

    // Chỉ chuyển sang 'called' khi gọi được
    if (outcome === 'reached' && request.status === 'pending') {
        request.status = 'called';
    }

    await request.save();
    return request;
};

//Ghi nhận phỏng vấn
const logInterview = async (requestId, interviewerId, { notes, score, recommendation }) => {
    const request = await getRequest(requestId);

    if (request.status !== 'called') {
        throw new ApiError(
            400,
            `Chỉ có thể phỏng vấn sau khi đã gọi điện xác nhận. Trạng thái hiện tại: "${request.status}"`
        );
    }

    request.interviewLog = {
        interviewedBy: interviewerId,
        interviewedAt: new Date(),
        notes,
        score: score ?? null,
        recommendation,
    };

    request.status = 'interviewed';
    await request.save();
    return request;
};

//Admin duyệt cuối
const reviewRequest = async (requestId, adminId, { action, rejectionReason }) => {
    const request = await getRequest(requestId);

    if (request.status !== 'interviewed') {
        throw new ApiError(
            400,
            `Chỉ có thể duyệt sau khi đã phỏng vấn. Trạng thái hiện tại: "${request.status}"`
        );
    }

    if (!['approved', 'rejected'].includes(action)) {
        throw new ApiError(400, 'Action phải là approved hoặc rejected');
    }

    request.status = action;
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();
    if (action === 'rejected') request.rejectionReason = rejectionReason;

    await request.save();

    // Nếu approved → tạo Enrollment
    if (action === 'approved') {
        await Enrollment.create({
            userId: request.userId._id,
            cohortId: request.cohortId._id,
            courseId: request.courseId._id,
            status: 'active',
            amountPaid: 0,
            paymentStatus: 'pending',
        });
    }

    return request;
};

const getRequests = async (filter = {}, options = {}) => {
    const mongoFilter = {};
    if (filter.status) mongoFilter.status = filter.status;
    if (filter.courseId) mongoFilter.courseId = filter.courseId;
    if (filter.cohortId) mongoFilter.cohortId = filter.cohortId;
    if (filter.assignedCounselor) mongoFilter.assignedCounselor = filter.assignedCounselor;

    return EnrollmentRequest.paginate(mongoFilter, {
        sortBy: options.sortBy || 'createdAt:asc',
        limit: options.limit || 20,
        page: options.page || 1,
        populate: ['userId', 'courseId', 'cohortId', 'assignedCounselor'],
    });
};

module.exports = {
    assignCounselor,
    logCall,
    logInterview,
    reviewRequest,
    getRequests,
};