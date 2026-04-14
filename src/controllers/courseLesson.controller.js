const catchAsync = require('../utils/catchAsync');
const lessonService = require('../services/courseLesson.service');

const createLesson = catchAsync(async (req, res) => {

    const lesson = await lessonService.createLesson(req.params.courseId, req.body);

    res.status(201).json({
        status: 'success',
        data: lesson
    });
});

const getLessons = catchAsync(async (req, res) => {
    const isAdmin = ['admin', 'instructor'].includes(req.user?.role);

    const lessons = await lessonService.getLessons(req.params.courseId, req.query, isAdmin);

    res.status(200).json({
        status: 'success',
        data: lessons
    });
});

const getLesson = catchAsync(async (req, res) => {
    const { lesson } = await lessonService.checkAccess(req.user._id, req.params.lessonId);

    res.status(200).json({
        status: 'success',
        data: lesson
    });
});

const updateLesson = catchAsync(async (req, res) => {

    const lesson = await lessonService.updateLesson(
        req.params.lessonId, req.params.courseId, req.body
    );

    res.status(200).json({
        status: 'success',
        data: lesson
    });
});

const deleteLesson = catchAsync(async (req, res) => {

    await lessonService.deleteLesson(req.params.lessonId, req.params.courseId);

    res.status(204).json({
        status: 'success',
        message: 'Xóa thành công'
    });
});

const markVideoProgress = catchAsync(async (req, res) => {
    const progress = await lessonService.markVideoProgress(
        req.user._id, req.params.lessonId, req.body
    );

    res.status(200).json({
        status: 'success',
        data: progress
    });
});

const submitQuiz = catchAsync(async (req, res) => {
    const result = await lessonService.submitQuiz(
        req.user._id, req.params.lessonId, req.body
    );
    res.status(200).json({
        status: 'success',
        data: result
    });
});

const getMyProgress = catchAsync(async (req, res) => {
    const progress = await lessonService.getMyProgress(req.query.enrollmentId);
    res.status(200).json({
        status: 'success',
        data: progress
    });
});

module.exports = {
    createLesson,
    getLessons,
    getLesson,
    updateLesson,
    deleteLesson,
    markVideoProgress,
    submitQuiz,
    getMyProgress
}