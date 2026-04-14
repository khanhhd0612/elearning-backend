const Cohort = require('../models/cohort.model');
const CohortInstructor = require('../models/cohortInstructor.model');
const ApiError = require('../utils/ApiError');
const Enrollment = require('../models/enrollment.model');

const getById = async (cohortId, populate = '') => {
    let query = Cohort.findById(cohortId);
    if (populate.includes('instructors')) query = query.populate('instructors');
    if (populate.includes('enrollmentCount')) query = query.populate('enrollmentCount');
    if (populate.includes('courseFormatId')) query = query.populate({
        path: 'courseFormatId',
        select: 'formatType priceOverride courseId',
    });

    const cohort = await query;
    if (!cohort) throw new ApiError(404, 'Không tìm thấy cohort');
    return cohort;
};

const createCohort = async (courseFormatId, body) => {
    // Kiểm tra courseFormat tồn tại và đang active
    const CourseFormat = require('../models/courseFormat.model');
    const format = await CourseFormat.findOne({ _id: courseFormatId, isActive: true });
    if (!format) {
        throw new ApiError(404, 'Format không tồn tại hoặc đã bị ẩn');
    }

    return Cohort.create({ ...body, courseFormatId });
};

const getCohorts = async (courseFormatId, filter = {}, options = {}) => {
    const mongoFilter = { courseFormatId };
    if (filter.status) mongoFilter.status = filter.status;

    const populateOptions = [];
    if (options.populate?.includes('instructors')) {
        populateOptions.push({
            path: 'instructors',
            populate: { path: 'instructorId', select: 'userId bio', populate: { path: 'userId', select: 'firstName lastName' } },
        });
    }
    if (options.populate?.includes('enrollmentCount')) {
        populateOptions.push('enrollmentCount');
    }

    return Cohort.paginate(mongoFilter, {
        sortBy: options.sortBy || 'startDate:asc',
        limit: options.limit || 20,
        page: options.page || 1,
        populate: populateOptions.length ? populateOptions : undefined,
    });
};

const getCohortById = async (cohortId, populate = '') => getById(cohortId, populate);

const updateCohort = async (cohortId, updateBody) => {
    const cohort = await getById(cohortId);

    if (['ongoing', 'completed', 'cancelled'].includes(cohort.status)) {
        throw new ApiError(
            400,
            `Không thể chỉnh sửa cohort đang ở trạng thái "${cohort.status}"`
        );
    }

    Object.assign(cohort, updateBody);
    await cohort.save();
    return cohort;
};


const VALID_TRANSITIONS = {
    upcoming: ['ongoing', 'cancelled'],
    ongoing: ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
};

const updateStatus = async (cohortId, status, cancelReason = '') => {
    const cohort = await getById(cohortId);

    if (!VALID_TRANSITIONS[cohort.status].includes(status)) {
        throw new ApiError(
            400,
            `Không thể chuyển từ "${cohort.status}" sang "${status}"`
        );
    }

    // Nếu cancelled => kiểm tra không còn enrollment active
    if (status === 'cancelled') {
        const Enrollment = require('../models/enrollment.model');
        const activeCount = await Enrollment.countDocuments({
            cohortId,
            status: 'active',
        });
        if (activeCount > 0) {
            throw new ApiError(
                409,
                `Không thể hủy — còn ${activeCount} học viên đang học`
            );
        }
        if (cancelReason) cohort.cancelReason = cancelReason;
    }

    cohort.status = status;
    await cohort.save();
    return cohort;
};

const assignInstructor = async (cohortId, instructorId, role) => {
    await getById(cohortId);

    // Kiểm tra instructor tồn tại
    const Instructor = require('../models/instructor.model');
    const instructor = await Instructor.findOne({ _id: instructorId, isActive: true });
    if (!instructor) {
        throw new ApiError(404, 'Giảng viên không tồn tại hoặc đã bị ẩn');
    }

    // Nếu assign lead → kiểm tra đã có lead chưa
    if (role === 'lead') {
        const existingLead = await CohortInstructor.findOne({ cohortId, role: 'lead' });
        if (existingLead) {
            throw new ApiError(
                409,
                'Cohort đã có lead instructor. Hãy xóa lead cũ trước.'
            );
        }
    }

    const assignment = await CohortInstructor.create({ cohortId, instructorId, role });
    return assignment;
};

const removeInstructor = async (cohortId, instructorId) => {
    const assignment = await CohortInstructor.findOne({ cohortId, instructorId });
    if (!assignment) {
        throw new ApiError(404, 'Giảng viên không thuộc cohort này');
    }

    // Không cho xóa lead khi cohort đang ongoing
    const cohort = await getById(cohortId);
    if (assignment.role === 'lead' && cohort.status === 'ongoing') {
        throw new ApiError(
            409,
            'Không thể xóa lead instructor khi cohort đang chạy'
        );
    }

    await assignment.deleteOne();
};

const deleteCohort = async (cohortId) => {
    const cohort = await getById(cohortId);

    if (cohort.status !== 'upcoming') {
        throw new ApiError(
            409,
            'Chỉ có thể xóa cohort ở trạng thái upcoming'
        );
    }

    const enrollCount = await Enrollment.countDocuments({ cohortId });
    if (enrollCount > 0) {
        throw new ApiError(
            409,
            `Không thể xóa — cohort đã có ${enrollCount} enrollment`
        );
    }

    // Xóa cohort_instructors liên quan
    await CohortInstructor.deleteMany({ cohortId });
    await cohort.deleteOne();
};

module.exports = {
    createCohort,
    getCohorts,
    getCohortById,
    updateCohort,
    updateStatus,
    assignInstructor,
    removeInstructor,
    deleteCohort,
};