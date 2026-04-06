const Instructor = require('../models/instructor.model');
const ApiError = require('../utils/ApiError');
const User = require('../models/user.model');
const CohortInstructor = require('../models/cohortInstructor.model');
const Campus = require('../models/campus.model');
const { deleteImage } = require('./upload.service');

const createInstructor = async (body) => {
    const exists = await Instructor.findOne({ userId: body.userId });
    if (exists) {
        throw new ApiError(409, 'User này đã có hồ sơ giảng viên');
    }

    const user = await User.findById(body.userId);
    if (!user) {
        throw new ApiError(404, 'Không tìm thấy user');
    }
    if (user.role !== 'instructor') {
        throw new ApiError(
            400,
            'User phải có role "instructor" trước khi tạo hồ sơ giảng viên'
        );
    }

    // Kiểm tra campus tồn tại
    const campus = await Campus.findOne({ _id: body.campusId, isActive: true });
    if (!campus) {
        throw new ApiError(404, 'Campus không tồn tại hoặc đã bị ẩn');
    }

    return Instructor.create(body);
};

const getInstructors = async (filter = {}, options = {}) => {
    const mongoFilter = {};
    if (filter.campusId) mongoFilter.campusId = filter.campusId;
    if (typeof filter.isActive === 'boolean') mongoFilter.isActive = filter.isActive;
    else mongoFilter.isActive = true;

    const populateOptions = [];
    if (options.populate?.includes('userId')) {
        populateOptions.push({ path: 'userId', select: 'firstName lastName email avatarUrl' });
    }
    if (options.populate?.includes('campusId')) {
        populateOptions.push({ path: 'campusId', select: 'name city' });
    }
    if (options.populate?.includes('cohorts')) {
        populateOptions.push('cohorts');
    }

    return Instructor.paginate(mongoFilter, {
        sortBy: options.sortBy || 'createdAt:desc',
        limit: options.limit || 10,
        page: options.page || 1,
        populate: populateOptions.length ? populateOptions : undefined,
    });
};

const getInstructorById = async (instructorId, populate = '') => {
    let query = Instructor.findById(instructorId);
    if (populate.includes('userId')) query = query.populate('userId', 'firstName lastName email phone');
    if (populate.includes('campusId')) query = query.populate('campusId', 'name city address');
    if (populate.includes('cohorts')) query = query.populate('cohorts');

    const instructor = await query;
    if (!instructor) throw new ApiError(404, 'Không tìm thấy giảng viên');
    return instructor;
};

const getInstructorByUserId = async (userId) => {
    const instructor = await Instructor.findOne({ userId })
        .populate('userId', 'firstName lastName email')
        .populate('campusId', 'name city');
    if (!instructor) throw new ApiError(404, 'Không tìm thấy hồ sơ giảng viên');
    return instructor;
};

const updateInstructor = async (instructorId, updateBody) => {
    const instructor = await getInstructorById(instructorId);

    // Kiểm tra campus mới nếu đổi campusId
    if (updateBody.campusId && updateBody.campusId !== instructor.campusId.toString()) {
        const Campus = require('../models/campus.model');
        const campus = await Campus.findOne({ _id: updateBody.campusId, isActive: true });
        if (!campus) {
            throw new ApiError(404, 'Campus không tồn tại hoặc đã bị ẩn');
        }
    }

    Object.assign(instructor, updateBody);
    await instructor.save();
    return instructor;
};

const toggleInstructor = async (instructorId) => {
    const instructor = await getInstructorById(instructorId);

    // Không tắt nếu đang là lead của cohort ongoing
    if (instructor.isActive) {
        const CohortInstructor = require('../models/cohortInstructor.model');
        const Cohort = require('../models/cohort.model');

        const assignments = await CohortInstructor.find({
            instructorId,
            role: 'lead',
        }).select('cohortId');

        const cohortIds = assignments.map((a) => a.cohortId);
        const activeCount = await Cohort.countDocuments({
            _id: { $in: cohortIds },
            status: 'ongoing',
        });

        if (activeCount > 0) {
            throw new ApiError(
                409,
                `Không thể ẩn — giảng viên đang là lead của ${activeCount} cohort đang chạy`
            );
        }
    }

    instructor.isActive = !instructor.isActive;
    await instructor.save();
    return instructor;
};

const deleteInstructor = async (instructorId) => {
    const instructor = await getInstructorById(instructorId);

    // Không xóa nếu còn gán vào cohort
    const count = await CohortInstructor.countDocuments({ instructorId });
    if (count > 0) {
        throw new ApiError(
            409,
            `Không thể xóa — giảng viên đang được gán vào ${count} cohort. Dùng toggle để ẩn.`
        );
    }
    await deleteImage(instructor.avatarUrl);
    await instructor.deleteOne();
};

module.exports = {
    createInstructor,
    getInstructors,
    getInstructorById,
    getInstructorByUserId,
    updateInstructor,
    toggleInstructor,
    deleteInstructor,
};