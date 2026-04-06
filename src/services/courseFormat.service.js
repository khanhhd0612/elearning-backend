const CourseFormat = require('../models/courseFormat.model');
const ApiError = require('../utils/ApiError');

const buildPopulate = (formatType) => {
    if (['oncampus', 'hybrid'].includes(formatType)) {
        return [{ path: `${formatType}Detail.campusId`, select: 'name city' }];
    }
    return [];
};

const createCourseFormat = async (courseId, body) => {
    // Unique check: một course không được có 2 format cùng loại
    const exists = await CourseFormat.findOne({ courseId, formatType: body.formatType });
    if (exists) {
        throw new ApiError(
            409,
            `Khóa học đã có format "${body.formatType}"`
        );
    }

    const courseFormat = await CourseFormat.create({ ...body, courseId });
    return courseFormat;
};

const getCourseFormats = async (courseId, filter = {}) => {
    const mongoFilter = { courseId, ...filter };

    const formats = await CourseFormat.find(mongoFilter)
        .populate('oncampusDetail.campusId', 'name city')
        .populate('hybridDetail.campusId', 'name city')
        .sort({ createdAt: 1 })
        .lean();

    return formats;
};

const getCourseFormatById = async (courseFormatId, courseId) => {
    const format = await CourseFormat.findOne({ _id: courseFormatId, courseId })
        .populate('oncampusDetail.campusId', 'name city address')
        .populate('hybridDetail.campusId', 'name city address');

    if (!format) {
        throw new ApiError(404, 'Không tìm thấy format');
    }
    return format;
};

const updateCourseFormat = async (courseFormatId, courseId, updateBody) => {
    const format = await getCourseFormatById(courseFormatId, courseId);

    // Không cho đổi formatType sau khi tạo
    if (updateBody.formatType && updateBody.formatType !== format.formatType) {
        throw new ApiError(
            400,
            'Không thể thay đổi loại format sau khi tạo. Hãy xóa và tạo mới.'
        );
    }

    // Chỉ update detail đúng loại, bỏ qua các detail khác trong body
    const detailKey = `${format.formatType}Detail`;
    if (updateBody[detailKey]) {
        format[detailKey] = { ...format[detailKey].toObject(), ...updateBody[detailKey] };
        delete updateBody[detailKey];
    }

    Object.assign(format, updateBody);
    await format.save();
    return format;
};

const toggleCourseFormat = async (courseFormatId, courseId) => {
    const format = await getCourseFormatById(courseFormatId, courseId);

    // Không cho tắt format nếu còn cohort đang chạy
    if (format.isActive) {
        const Cohort = require('../models/cohort.model');
        const activeCohorts = await Cohort.countDocuments({
            courseFormatId,
            status: { $in: ['upcoming', 'ongoing'] },
        });
        if (activeCohorts > 0) {
            throw new ApiError(
                409,
                `Không thể ẩn — format đang có ${activeCohorts} cohort hoạt động`
            );
        }
    }

    format.isActive = !format.isActive;
    await format.save();
    return format;
};

const deleteCourseFormat = async (courseFormatId, courseId) => {
    const format = await getCourseFormatById(courseFormatId, courseId);

    // Không xóa nếu còn cohort bất kỳ (kể cả completed — giữ lịch sử)
    const Cohort = require('../models/cohort.model');
    const cohortCount = await Cohort.countDocuments({ courseFormatId });
    if (cohortCount > 0) {
        throw new ApiError(
            409,
            `Không thể xóa — format đang liên kết với ${cohortCount} cohort. Hãy dùng toggle để ẩn.`
        );
    }

    await format.deleteOne();
};

module.exports = {
    createCourseFormat,
    getCourseFormats,
    getCourseFormatById,
    updateCourseFormat,
    toggleCourseFormat,
    deleteCourseFormat,
};