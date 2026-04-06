const catchAsync = require('../utils/catchAsync');
const instructorService = require('../services/instructor.service');

const createInstructor = catchAsync(async (req, res) => {
    const instructor = await instructorService.createInstructor(req.body);
    res.status(201).json({
        status: 'success',
        data: instructor
    });
});

const getInstructors = catchAsync(async (req, res) => {
    const result = await instructorService.getInstructors(req.query, req.query);
    res.status(200).json({
        status: 'success',
        data: result
    });
});

const getInstructor = catchAsync(async (req, res) => {
    const instructor = await instructorService.getInstructorById(
        req.params.instructorId,
        req.query.populate || ''
    );
    res.status(200).json({
        status: 'success',
        data: instructor
    });
});

const getMyProfile = catchAsync(async (req, res) => {
    const instructor = await instructorService.getInstructorByUserId(req.user._id);
    res.status(200).json({
        status: 'success',
        data: instructor
    });
});

const updateInstructor = catchAsync(async (req, res) => {
    const instructor = await instructorService.updateInstructor(
        req.params.instructorId,
        req.body
    );
    res.status(200).json({
        status: 'success',
        data: instructor
    });
});

const toggleInstructor = catchAsync(async (req, res) => {
    const instructor = await instructorService.toggleInstructor(req.params.instructorId);
    res.status(200).json({
        status: 'success',
        message: `Giảng viên đã được ${instructor.isActive ? 'kích hoạt' : 'ẩn'}`,
        data: {
            id: instructor._id,
            isActive: instructor.isActive
        },
    });
});

const deleteInstructor = catchAsync(async (req, res) => {
    await instructorService.deleteInstructor(req.params.instructorId);
    res.status(204).send();
});

module.exports = {
    createInstructor,
    getInstructors,
    getInstructor,
    getMyProfile,
    updateInstructor,
    toggleInstructor,
    deleteInstructor,
};