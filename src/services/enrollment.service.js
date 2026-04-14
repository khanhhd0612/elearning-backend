const crypto = require('crypto');
const Course = require('../models/course.model');
const Cohort = require('../models/cohort.model');
const CourseFormat = require('../models/courseFormat.model');
const Enrollment = require('../models/enrollment.model');
const EnrollmentRequest = require('../models/enrollmentRequest.model');
const CourseInvite = require('../models/courseInvite.model');
const ApiError = require('../utils/ApiError');
const User = require('../models/user.model');
const emailService = require('./email.service');

const getCohortWithCourse = async (cohortId) => {
    const cohort = await Cohort.findById(cohortId).populate({
        path: 'courseFormatId',
        populate: { path: 'courseId' },
    });
    if (!cohort) throw new ApiError(404, 'Không tìm thấy cohort');
    if (!['upcoming', 'ongoing'].includes(cohort.status)) {
        throw new ApiError(400, 'Cohort này không còn nhận đăng ký');
    }
    const course = cohort.courseFormatId?.courseId;
    if (!course?.isActive) throw new ApiError(404, 'Khóa học không tồn tại hoặc đã bị ẩn');
    return { cohort, course, format: cohort.courseFormatId };
};

const getFormatWithCourse = async (courseFormatId) => {
    const format = await CourseFormat.findOne({ _id: courseFormatId, isActive: true })
        .populate('courseId');
    if (!format) throw new ApiError(404, 'Format không tồn tại hoặc đã bị ẩn');
    const course = format.courseId;
    if (!course?.isActive) throw new ApiError(404, 'Khóa học không tồn tại');
    return { format, course };
};

const checkAlreadyEnrolledInCohort = async (userId, cohortId) => {
    const existing = await Enrollment.findOne({ userId, cohortId });
    if (existing) throw new ApiError(409, 'Bạn đã đăng ký lớp học này rồi');
};

const checkAlreadyEnrolledSelfPaced = async (userId, courseId) => {
    const existing = await Enrollment.findOne({
        userId,
        courseId,
        deliveryMode: 'self_paced',
    });
    if (existing) throw new ApiError(409, 'Bạn đã đăng ký khóa học này rồi');
};

const enroll = async (userId, { cohortId, courseFormatId }) => {

    //Self-paced: không có cohort
    if (!cohortId && courseFormatId) {
        const { format, course } = await getFormatWithCourse(courseFormatId);

        if (course.deliveryMode !== 'self_paced') {
            throw new ApiError(
                400,
                'Khóa học này cần chọn lớp học. Vui lòng cung cấp cohortId.'
            );
        }
        if (course.enrollmentType !== 'public') {
            throw new ApiError(
                405,
                course.enrollmentType === 'approval'
                    ? 'Khóa học này yêu cầu gửi request. Dùng POST /enrollments/request'
                    : 'Khóa học này chỉ dành cho người được mời. Dùng POST /enrollments/accept-invite'
            );
        }

        await checkAlreadyEnrolledSelfPaced(userId, course._id);
        return enrollSelfPaced(userId, format, course);
    }

    //Instructor-led: có cohort
    if (cohortId) {
        const { cohort, course, format } = await getCohortWithCourse(cohortId);

        if (course.deliveryMode === 'self_paced') {
            throw new ApiError(
                400,
                'Khóa học này không có lớp học. Vui lòng dùng courseFormatId.'
            );
        }
        if (course.enrollmentType !== 'public') {
            throw new ApiError(
                405,
                course.enrollmentType === 'approval'
                    ? 'Khóa học này yêu cầu gửi request. Dùng POST /enrollments/request'
                    : 'Khóa học này chỉ dành cho người được mời. Dùng POST /enrollments/accept-invite'
            );
        }

        await checkAlreadyEnrolledInCohort(userId, cohortId);
        return enrollInstructorLed(userId, cohort, course);
    }

    throw new ApiError(400, 'Vui lòng cung cấp cohortId hoặc courseFormatId');
};

//Tạo enrollment self_paced
const enrollSelfPaced = async (userId, format, course) => {
    const enrollment = await Enrollment.create({
        userId,
        courseId: course._id,
        cohortId: null,
        deliveryMode: 'self_paced',
        status: 'active',
        startedAt: new Date(), // bắt đầu ngay
        expiresAt: format.onlineDetail?.hasLifetimeAccess
            ? null
            : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 năm nếu không lifetime
        amountPaid: 0,
        paymentStatus: 'pending',
    });
    return enrollment;
};

//Tạo enrollment instructor_led
const enrollInstructorLed = async (userId, cohort, course) => {
    const enrollment = await Enrollment.create({
        userId,
        courseId: course._id,
        cohortId: cohort._id,
        deliveryMode: 'instructor_led',
        status: 'active',
        startedAt: cohort.startDate, // bắt đầu theo lịch cohort
        amountPaid: 0,
        paymentStatus: 'pending',
    });
    return enrollment;
};

// - Approval - tạo EnrollmentRequest
const requestEnrollment = async (userId, courseFormatId, motivation) => {
    const { format, course } = await getFormatWithCourse(courseFormatId);

    if (course.enrollmentType !== 'approval') {
        throw new ApiError(400, `Khóa học này là "${course.enrollmentType}", không cần gửi request`);
    }

    const cohort = await Cohort.findOne({
        courseFormatId: format._id,
        status: { $in: ['upcoming', 'ongoing'] }
    }).sort({ startDate: 1 });

    if (!cohort) {
        throw new ApiError(404, 'Hiện không có lớp học nào đang mở đăng ký cho định dạng này');
    }

    const cohortId = cohort._id;

    await checkAlreadyEnrolledInCohort(userId, cohortId);

    const existingRequest = await EnrollmentRequest.findOne({
        userId,
        cohortId,
        status: { $in: ['pending', 'called', 'interviewed'] },
    });

    if (existingRequest) {
        throw new ApiError(409, `Bạn đã có yêu cầu đang được xử lý (Trạng thái: ${existingRequest.status})`);
    }

    return EnrollmentRequest.create({
        courseId: course._id,
        cohortId,
        userId,
        motivation,
        status: 'pending',
    });
};

//Admin duyệt request
const reviewEnrollmentRequest = async (requestId, reviewerId, action, rejectionReason = '') => {
    const request = await EnrollmentRequest.findById(requestId)
        .populate('cohortId')
        .populate('courseId');

    if (!request) throw new ApiError(404, 'Không tìm thấy request');
    if (request.status !== 'interviewed') {
        throw new ApiError(
            400,
            `Chỉ duyệt được sau khi đã phỏng vấn. Trạng thái hiện tại: "${request.status}"`
        );
    }
    if (!['approved', 'rejected'].includes(action)) {
        throw new ApiError(400, 'Action phải là approved hoặc rejected');
    }

    request.status = action;
    request.reviewedBy = reviewerId;
    request.reviewedAt = new Date();
    if (action === 'rejected') request.rejectionReason = rejectionReason;
    await request.save();

    if (action === 'approved') {
        await enrollInstructorLed(
            request.userId,
            request.cohortId,
            request.courseId
        );
    }

    return request;
};

const sendInvite = async (courseId, email, invitedBy) => {
    const course = await Course.findById(courseId);
    if (!course?.isActive) throw new ApiError(404, 'Khóa học không tồn tại');
    if (course.enrollmentType !== 'invite_only') {
        throw new ApiError(400, 'Khóa học này không phải invite_only');
    }

    const existing = await CourseInvite.findOne({ courseId, email, status: 'pending' });
    if (existing) throw new ApiError(409, `${email} đã có lời mời đang chờ xác nhận`);

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
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

    await emailService.sendCourseInvite({
        email,
        name: existingUser?.firstName || '',
        courseName: course.title,
        inviterName: '',
        token,
        expiresAt,
    });

    return invite;
};

const acceptInvite = async (token, userId, cohortId) => {
    const invite = await CourseInvite.findOne({ token }).populate('courseId');

    if (!invite) throw new ApiError(404, 'Lời mời không hợp lệ');
    if (invite.status !== 'pending') throw new ApiError(400, `Lời mời này đã ${invite.status}`);
    if (invite.expiresAt < new Date()) {
        invite.status = 'expired';
        await invite.save();
        throw new ApiError(410, 'Lời mời đã hết hạn');
    }

    const course = invite.courseId;

    // self_paced invite — không cần cohort
    if (course.deliveryMode === 'self_paced') {
        await checkAlreadyEnrolledSelfPaced(userId, course._id);
        const format = await CourseFormat.findOne({ courseId: course._id, isActive: true });
        invite.status = 'accepted';
        invite.userId = userId;
        invite.acceptedAt = new Date();
        await invite.save();
        return enrollSelfPaced(userId, format, course);
    }

    // instructor_led invite — cần cohortId
    if (!cohortId) throw new ApiError(400, 'Vui lòng chọn lớp học để xác nhận lời mời');

    const { cohort } = await getCohortWithCourse(cohortId);
    await checkAlreadyEnrolledInCohort(userId, cohortId);

    const courseFormatCourseId = cohort.courseFormatId?.courseId?.toString();
    if (courseFormatCourseId !== course._id.toString()) {
        throw new ApiError(400, 'Cohort không thuộc khóa học này');
    }

    invite.status = 'accepted';
    invite.userId = userId;
    invite.acceptedAt = new Date();
    await invite.save();

    return enrollInstructorLed(userId, cohort, course);
};

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