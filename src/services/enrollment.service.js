const crypto = require('crypto');
const Course = require('../models/course.model');
const Cohort = require('../models/cohort.model');
const Enrollment = require('../models/enrollment.model');
const EnrollmentRequest = require('../models/enrollmentRequest.model');
const CourseInvite = require('../models/courseInvite.model');
const ApiError = require('../utils/ApiError');
const User = require('../models/user.model');
const emailService = require('./email.service');
const config = require('../config/config');


const getCohortWithCourse = async (cohortId) => {
    const cohort = await Cohort.findById(cohortId).populate({
        path: 'courseFormatId',
        populate: {
            path: 'courseId'
        }
    });
    if (!cohort) throw new ApiError(404, 'Không tìm thấy cohort');
    if (cohort.status !== 'upcoming' && cohort.status !== 'ongoing') {
        throw new ApiError(400, 'Cohort này không còn nhận đăng ký');
    }

    const course = cohort.courseFormatId.courseId;
    if (!course || !course.isActive) {
        throw new ApiError(404, 'Khóa học không tồn tại hoặc đã bị ẩn');
    }
    return { cohort, course };
};

const checkAlreadyEnrolled = async (userId, cohortId) => {
    const existing = await Enrollment.findOne({ userId, cohortId });
    if (existing) throw new ApiError(409, 'Bạn đã đăng ký cohort này rồi');
};

const enroll = async (userId, cohortId) => {
    const { cohort, course } = await getCohortWithCourse(cohortId);
    await checkAlreadyEnrolled(userId, cohortId);

    switch (course.enrollmentType) {
        case 'public':
            return enrollPublic(userId, cohort, course);
        case 'approval':
            throw new ApiError(
                405,
                'Khóa học này yêu cầu gửi request. Dùng POST /enrollments/request'
            );
        case 'invite_only':
            throw new ApiError(
                405,
                'Khóa học này chỉ dành cho người được mời. Dùng POST /enrollments/accept-invite'
            );
    }
};

// Public — tạo enrollment ngay
const enrollPublic = async (userId, cohort, course) => {
    const enrollment = await Enrollment.create({
        userId,
        cohortId: cohort._id,
        courseId: course._id,
        status: 'active',
        amountPaid: 0,
        paymentStatus: 'pending',
    });
    return enrollment;
};

//Approval — tạo EnrollmentRequest
const requestEnrollment = async (userId, cohortId, motivation) => {
    const { cohort, course } = await getCohortWithCourse(cohortId);
    await checkAlreadyEnrolled(userId, cohortId);

    if (course.enrollmentType !== 'approval') {
        throw new ApiError(
            400,
            `Khóa học này là "${course.enrollmentType}", không cần gửi request`
        );
    }

    // Kiểm tra đã có request pending chưa
    const existingRequest = await EnrollmentRequest.findOne({
        userId,
        cohortId,
        status: 'pending',
    });
    if (existingRequest) {
        throw new ApiError(409, 'Bạn đã gửi request rồi, đang chờ duyệt');
    }

    const request = await EnrollmentRequest.create({
        courseId: course._id,
        cohortId,
        userId,
        motivation,
        status: 'pending',
    });
    return request;
};

//Admin/instructor duyệt request
const reviewEnrollmentRequest = async (requestId, reviewerId, action, rejectionReason = '') => {
    const request = await EnrollmentRequest.findById(requestId)
        .populate('cohortId')
        .populate('courseId');

    if (!request) throw new ApiError(404, 'Không tìm thấy request');
    if (request.status !== 'pending') {
        throw new ApiError(400, `Request này đã được xử lý: ${request.status}`);
    }
    if (!['approved', 'rejected'].includes(action)) {
        throw new ApiError(400, 'Action phải là approved hoặc rejected');
    }

    request.status = action;
    request.reviewedBy = reviewerId;
    request.reviewedAt = new Date();
    if (action === 'rejected') request.rejectionReason = rejectionReason;
    await request.save();

    // Nếu approved => tạo enrollment
    if (action === 'approved') {
        await Enrollment.create({
            userId: request.userId,
            cohortId: request.cohortId._id,
            courseId: request.courseId._id,
            status: 'active',
            amountPaid: 0,
            paymentStatus: 'pending',
        });
    }

    return request;
};

//Invite only — admin gửi lời mời 
const sendInvite = async (courseId, email, invitedBy) => {
    const course = await Course.findById(courseId);
    if (!course || !course.isActive) {
        throw new ApiError(404, 'Khóa học không tồn tại');
    }
    if (course.enrollmentType !== 'invite_only') {
        throw new ApiError(400, 'Khóa học này không phải invite_only');
    }

    // Kiểm tra invite pending đã tồn tại chưa
    const existing = await CourseInvite.findOne({ courseId, email, status: 'pending' });
    if (existing) {
        throw new ApiError(409, `${email} đã có lời mời đang chờ xác nhận`);
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày

    // Kiểm tra email có phải user đã có tài khoản không
    const existingUser = await User.findOne({ email });

    const invite = await CourseInvite.create({
        courseId,
        email,
        userId: existingUser?._id || null,
        invitedBy,
        token,
        expiresAt,
        status: 'pending',
    });

    await emailService.sendCourseInvite({ email, courseName: course.title, token, expiresAt });

    return invite;
};

//User accept invite
const acceptInvite = async (token, userId, cohortId) => {
    const invite = await CourseInvite.findOne({ token }).populate('courseId');

    if (!invite) throw new ApiError(404, 'Lời mời không hợp lệ');
    if (invite.status !== 'pending') {
        throw new ApiError(400, `Lời mời này đã ${invite.status}`);
    }
    if (invite.expiresAt < new Date()) {
        invite.status = 'expired';
        await invite.save();
        throw new ApiError(410, 'Lời mời đã hết hạn');
    }

    const course = invite.courseId;

    const { cohort } = await getCohortWithCourse(cohortId);
    await checkAlreadyEnrolled(userId, cohortId);

    // Đảm bảo cohort thuộc đúng course
    const courseFormatCourseId = cohort.courseFormatId?.courseId?.toString();
    if (courseFormatCourseId !== course._id.toString()) {
        throw new ApiError(400, 'Cohort không thuộc khóa học này');
    }

    invite.status = 'accepted';
    invite.userId = userId;
    invite.acceptedAt = new Date();
    await invite.save();

    const enrollment = await Enrollment.create({
        userId,
        cohortId,
        courseId: course._id,
        status: 'active',
        amountPaid: 0,
        paymentStatus: 'pending',
    });

    return enrollment;
};

//Get pending requests (cho admin/instructor)
const getPendingRequests = async (filter = {}, options = {}) => {
    return EnrollmentRequest.paginate(
        { status: 'pending', ...filter },
        {
            sortBy: options.sortBy || 'createdAt:asc',
            limit: options.limit,
            page: options.page,
            populate: ['userId', 'cohortId', 'courseId'],
        }
    );
};

module.exports = {
    enroll,
    requestEnrollment,
    reviewEnrollmentRequest,
    sendInvite,
    acceptInvite,
    getPendingRequests,
};