const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const uploadService = require('../services/upload.service');

const uploadUserAvatar = catchAsync(async (req, res) => {
    const user = await uploadService.uploadUserAvatar(req.params.userId, req.file);

    res.status(200).json({
        status: 'success',
        data: { avatarUrl: user.avatarUrl },
    });
});

const uploadInstructorAvatar = catchAsync(async (req, res) => {
    const instructor = await uploadService.uploadInstructorAvatar(
        req.params.instructorId,
        req.file
    );

    res.status(200).json({
        status: 'success',
        data: { avatarUrl: instructor.avatarUrl },
    });
});

const uploadCourseThumbnail = catchAsync(async (req, res) => {
    const course = await uploadService.uploadCourseThumbnail(req.params.courseId, req.file);

    res.status(200).json({
        status: 'success',
        data: { thumbnailUrl: course.thumbnailUrl },
    });
});

const uploadBlogImage = catchAsync(async (req, res) => {
    const result = await uploadService.uploadBlogImage(req.file);

    res.status(200).json({
        status: 'success',
        url: result.url,
    });
});

module.exports = {
    uploadUserAvatar,
    uploadInstructorAvatar,
    uploadCourseThumbnail,
    uploadBlogImage
};