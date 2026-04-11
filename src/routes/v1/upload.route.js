const express = require('express');
const auth = require('../../middlewares/auth');
const { uploadAvatar, uploadThumbnail, uploadPostImage } = require('../../middlewares/upload');
const uploadController = require('../../controllers/upload.controller');

const router = express.Router();

router.patch('/users/:userId/avatar', auth(), uploadAvatar, uploadController.uploadUserAvatar);

router.patch('/instructors/:instructorId/avatar', auth('uploadInstructorAvatar'), uploadAvatar, uploadController.uploadInstructorAvatar);

router.patch('/courses/:courseId/thumbnail', auth('uploadThumbnail'), uploadThumbnail, uploadController.uploadCourseThumbnail);

router.post('/blog-image', auth('managePosts'), uploadPostImage, uploadController.uploadBlogImage);

module.exports = router;