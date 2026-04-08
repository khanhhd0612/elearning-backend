const { sendMail } = require('../config/emailTransport');
const templates = require('../templates/email.templates');
const logger = require('../config/logger');

/**
 * Base function — tất cả hàm khác đều gọi qua đây.
 * Không throw khi lỗi — email fail không crash request chính.
 */
const sendEmail = async ({ to, subject, html, text = '' }) => {
    if (process.env.NODE_ENV === 'test') return;

    try {
        const result = await sendMail({ to, subject, html, text });
        logger.info(`[Email] Sent to ${to} | subject: "${subject}"`);
        return result;
    } catch (err) {
        logger.error(`[Email] Failed to send to ${to}: ${err.message}`);
    }
};

// ── 1. Xác nhận email đăng ký ─────────────────────────────────────────────
const sendVerifyEmail = (user, token) => {
    const { subject, html } = templates.verifyEmail({ name: user.firstName, token });
    return sendEmail({ to: user.email, subject, html });
};

const sendResetPassword = (user, token) => {
    const { subject, html } = templates.resetPassword({ name: user.name, token });
    return sendEmail({
        to: user.email,
        subject,
        html
    });
};

// lời mời tham gia khóa học invite_only
const sendCourseInvite = ({ email, courseName, token, expiresAt }) => {
    const { subject, html } = templates.courseInvite({ courseName, token, expiresAt });
    return sendEmail({
        to: email,
        subject,
        html
    });
};

// ── 4. Xác nhận enroll thành công ─────────────────────────────────────────
const sendEnrollmentConfirmed = (user, { courseName, cohortName, startDate, formatType }) => {
    const { subject, html } = templates.enrollmentConfirmed({
        name: user.firstName, courseName, cohortName, startDate, formatType,
    });
    return sendEmail({ to: user.email, subject, html });
};

// ── 5. Kết quả duyệt enrollment request ───────────────────────────────────
const sendEnrollmentRequestReviewed = (user, { courseName, cohortName, status, rejectionReason }) => {
    const { subject, html } = templates.enrollmentRequestReviewed({
        name: user.firstName, courseName, cohortName, status, rejectionReason,
    });
    return sendEmail({ to: user.email, subject, html });
};

// ── 6. Nhắc nhở khai giảng ────────────────────────────────────────────────
const sendCohortStartReminder = (user, { courseName, cohortName, startDate, formatType, details }) => {
    const { subject, html } = templates.cohortStartReminder({
        name: user.firstName, courseName, cohortName, startDate, formatType, details,
    });
    return sendEmail({ to: user.email, subject, html });
};

// ── Bulk: gửi reminder cho nhiều học viên ────────────────────────────────
const sendBulkCohortStartReminder = async (enrollments, cohortInfo) => {
    const results = await Promise.allSettled(
        enrollments.map(({ user }) => sendCohortStartReminder(user, cohortInfo))
    );

    const failed = results.filter((r) => r.status === 'rejected');
    if (failed.length > 0) {
        logger.warn(`[Email] Bulk reminder: ${failed.length}/${enrollments.length} failed`);
    }

    return {
        total: enrollments.length,
        succeeded: results.length - failed.length,
        failed: failed.length,
    };
};

module.exports = {
    sendVerifyEmail,
    sendResetPassword,
    sendCourseInvite,
    sendEnrollmentConfirmed,
    sendEnrollmentRequestReviewed,
    sendCohortStartReminder,
    sendBulkCohortStartReminder,
};