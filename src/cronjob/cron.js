const cron = require('node-cron');
const Cohort = require('../models/cohort.model');
const Enrollment = require('../models/enrollment.model');
const emailService = require('../services/email.service');
const logger = require('../config/logger');

// lấy ngày hôm nay không có giờ phút giây
const today = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};

// upcoming => ongoing
// Chạy lúc 00:05 mỗi ngày
// Tìm tất cả cohort upcoming có startDate <= hôm nay chuyển sang ongoing
const activateCohorts = async () => {
    try {
        const result = await Cohort.updateMany(
            { status: 'upcoming', startDate: { $lte: today() } },
            { $set: { status: 'ongoing' } }
        );

        if (result.modifiedCount > 0) {
            logger.info(`[Cron] activateCohorts: ${result.modifiedCount} cohort(s) → ongoing`);
        }
    } catch (err) {
        logger.error(`[Cron] activateCohorts failed: ${err.message}`);
    }
};

// ongoing => completed
// Chạy lúc 00:10 mỗi ngày
// Tìm tất cả cohort ongoing có endDate < hôm nay => chuyển sang completed
// Đồng thời cập nhật enrollment active => completed
const completeCohorts = async () => {
    try {
        const expiredCohorts = await Cohort.find({
            status: 'ongoing',
            endDate: { $lt: today() },
        }).select('_id');

        if (expiredCohorts.length === 0) return;

        const cohortIds = expiredCohorts.map((c) => c._id);

        // Cập nhật cohort status
        await Cohort.updateMany(
            { _id: { $in: cohortIds } },
            { $set: { status: 'completed' } }
        );

        // Cập nhật enrollment active → completed
        const enrollResult = await Enrollment.updateMany(
            { cohortId: { $in: cohortIds }, status: 'active' },
            { $set: { status: 'completed', completedAt: new Date() } }
        );

        logger.info(
            `[Cron] completeCohorts: ${expiredCohorts.length} cohort(s) → completed` +
            `, ${enrollResult.modifiedCount} enrollment(s) → completed`
        );
    } catch (err) {
        logger.error(`[Cron] completeCohorts failed: ${err.message}`);
    }
};

// gửi reminder trước khai giảng 3 ngày
// Chạy lúc 08:00 mỗi ngày
// Tìm cohort sẽ khai giảng đúng 3 ngày nữa => gửi email nhắc nhở học viên
const sendStartReminders = async () => {
    try {
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 3);
        targetDate.setHours(0, 0, 0, 0);

        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const cohorts = await Cohort.find({
            status: 'upcoming',
            startDate: { $gte: targetDate, $lt: nextDay },
        }).populate({
            path: 'courseFormatId',
            select: 'formatType courseId',
            populate: { path: 'courseId', select: 'title' },
        });

        if (cohorts.length === 0) return;

        let totalSent = 0;

        for (const cohort of cohorts) {
            const enrollments = await Enrollment.find({
                cohortId: cohort._id,
                status: 'active',
            }).populate('userId', 'firstName email');

            if (enrollments.length === 0) continue;

            const result = await emailService.sendBulkCohortStartReminder(enrollments, {
                courseName: cohort.courseFormatId?.courseId?.title || 'Khóa học',
                cohortName: cohort.name,
                startDate: cohort.startDate,
                formatType: cohort.courseFormatId?.formatType,
            });

            totalSent += result.succeeded;
            logger.info(
                `[Cron] sendStartReminders: cohort "${cohort.name}" — ` +
                `${result.succeeded}/${result.total} email(s) sent`
            );
        }

        logger.info(`[Cron] sendStartReminders: total ${totalSent} reminder(s) sent`);
    } catch (err) {
        logger.error(`[Cron] sendStartReminders failed: ${err.message}`);
    }
};

//xóa CourseInvite hết hạn
// Chạy lúc 02:00 mỗi ngày
// MongoDB TTL index đã tự xóa, nhưng job này cập nhật status → expired
// cho các record chưa bị TTL xóa nhưng đã quá hạn
const expireInvites = async () => {
    try {
        const CourseInvite = require('../models/courseInvite.model');
        const result = await CourseInvite.updateMany(
            { status: 'pending', expiresAt: { $lt: new Date() } },
            { $set: { status: 'expired' } }
        );

        if (result.modifiedCount > 0) {
            logger.info(`[Cron] expireInvites: ${result.modifiedCount} invite(s) → expired`);
        }
    } catch (err) {
        logger.error(`[Cron] expireInvites failed: ${err.message}`);
    }
};

const initCronJobs = () => {
    // '5 0 * * *'   = 00:05 mỗi ngày
    cron.schedule('5 0 * * *', activateCohorts, { timezone: 'Asia/Ho_Chi_Minh' });

    // '10 0 * * *'  = 00:10 mỗi ngày
    cron.schedule('10 0 * * *', completeCohorts, { timezone: 'Asia/Ho_Chi_Minh' });

    // '0 8 * * *'   = 08:00 mỗi ngày
    cron.schedule('0 8 * * *', sendStartReminders, { timezone: 'Asia/Ho_Chi_Minh' });

    // '0 2 * * *'   = 02:00 mỗi ngày
    cron.schedule('0 2 * * *', expireInvites, { timezone: 'Asia/Ho_Chi_Minh' });

    logger.info('[Cron] All jobs registered');
};

module.exports = {
    initCronJobs,
    activateCohorts,
    completeCohorts,
    sendStartReminders,
    expireInvites,
};