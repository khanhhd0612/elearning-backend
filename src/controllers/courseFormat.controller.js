const catchAsync = require('../utils/catchAsync');
const courseFormatService = require('../services/courseFormat.service');

const createCourseFormat = catchAsync(async (req, res) => {
    const format = await courseFormatService.createCourseFormat(
        req.params.courseId,
        req.body
    );
    res.status(201).json({
        status: 'success',
        data: format,
    });
});

const getCourseFormats = catchAsync(async (req, res) => {
    const filter = {};
    if (req.query.formatType) filter.formatType = req.query.formatType;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';

    const formats = await courseFormatService.getCourseFormats(
        req.params.courseId,
        filter
    );
    res.status(200).json({
        status: 'success',
        data: formats,
    });
});

const getCourseFormat = catchAsync(async (req, res) => {
    const format = await courseFormatService.getCourseFormatById(
        req.params.courseFormatId,
        req.params.courseId
    );
    res.status(200).json({
        status: 'success',
        data: format,
    });
});

const updateCourseFormat = catchAsync(async (req, res) => {
    const format = await courseFormatService.updateCourseFormat(
        req.params.courseFormatId,
        req.params.courseId,
        req.body
    );
    res.status(200).json({
        status: 'success',
        data: format,
    });
});

const toggleCourseFormat = catchAsync(async (req, res) => {
    const format = await courseFormatService.toggleCourseFormat(
        req.params.courseFormatId,
        req.params.courseId
    );
    res.status(200).json({
        status: 'success',
        message: `Format đã được ${format.isActive ? 'kích hoạt' : 'ẩn'}`,
        data: { id: format._id, formatType: format.formatType, isActive: format.isActive },
    });
});

const deleteCourseFormat = catchAsync(async (req, res) => {
    await courseFormatService.deleteCourseFormat(
        req.params.courseFormatId,
        req.params.courseId
    );
    res.status(204).json({
        status: 'success',
        message: `Xóa format thành công'}`,
    });
});

module.exports = {
    createCourseFormat,
    getCourseFormats,
    getCourseFormat,
    updateCourseFormat,
    toggleCourseFormat,
    deleteCourseFormat,
};