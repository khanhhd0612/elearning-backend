const catchAsync = require('../utils/catchAsync');
const courseService = require('../services/course.service');
const pick = require('../utils/pick');

const createCourse = catchAsync(async (req, res) => {
    const course = await courseService.createCourse(req.body);
    res.status(201).json({
        status: 'success',
        data: course,
    });
});

const getCourses = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['categoryId', 'formatType', 'enrollmentType', 'level', 'search', 'isActive','minPrice','maxPrice']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);
    const result = await courseService.queryCourses(filter, options);
    res.status(200).json({
        status: 'success',
        data: result,
    });
});

const getCourse = catchAsync(async (req, res) => {
    const course = await courseService.getCourseById(
        req.params.courseId,
        req.query.populate || ''
    );
    res.status(200).json({
        status: 'success',
        data: course,
    });
});

const getCourseBySlug = catchAsync(async (req, res) => {
    const course = await courseService.getCourseBySlug(req.params.slug);
    res.status(200).json({
        status: 'success',
        data: course,
    });
});

const updateCourse = catchAsync(async (req, res) => {
    const course = await courseService.updateCourse(
        req.params.courseId,
        req.body
    );
    res.status(200).json({
        status: 'success',
        data: course,
    });
});

const toggleCourse = catchAsync(async (req, res) => {
    const course = await courseService.toggleCourse(req.params.courseId);
    res.status(200).json({
        status: 'success',
        message: `Khóa học đã được ${course.isActive ? 'kích hoạt' : 'ẩn'}`,
        data: { id: course._id, isActive: course.isActive },
    });
});

const deleteCourse = catchAsync(async (req, res) => {
    await courseService.deleteCourse(req.params.courseId);
    res.status(204).send();
});

module.exports = {
    createCourse,
    getCourses,
    getCourse,
    getCourseBySlug,
    updateCourse,
    toggleCourse,
    deleteCourse,
};