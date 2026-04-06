const Campus = require('../models/campus.model');
const Instructor = require('../models/instructor.model');
const ApiError = require('../utils/ApiError');

const createCampus = async (body) => Campus.create(body);

const getCampuses = async (filter = {}, options = {}) => {
    const populateOptions = [];
    if (options.populate?.includes('instructorCount')) {
        populateOptions.push('instructorCount');
    }

    return Campus.paginate(filter, {
        sortBy: options.sortBy || 'name:asc',
        limit: options.limit || 10,
        page: options.page || 1,
        populate: populateOptions.length ? populateOptions : undefined,
    });
};

const getCampusById = async (campusId) => {
    const campus = await Campus.findById(campusId);

    if (!campus) throw new ApiError(404, 'Không tìm thấy trường');

    return campus;
};

const updateCampus = async (campusId, updateBody) => {
    const campus = await getCampusById(campusId);

    Object.assign(campus, updateBody);
    await campus.save();
    return campus;
};

const toggleCampus = async (campusId) => {
    const campus = await getCampusById(campusId);

    campus.isActive = !campus.isActive;
    await campus.save();
    return campus;
};

const deleteCampus = async (campusId) => {
    const campus = await getCampusById(campusId);

    // Không xóa nếu còn instructor đang active
    const count = await Instructor.countDocuments({ campusId, isActive: true });
    if (count > 0) {
        throw new ApiError(
            409,
            `Không thể xóa — trường đang có ${count} giảng viên`
        );
    }

    await campus.deleteOne();
};

module.exports = {
    createCampus,
    getCampuses,
    getCampusById,
    updateCampus,
    toggleCampus,
    deleteCampus
};