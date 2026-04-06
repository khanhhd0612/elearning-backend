const express = require('express');
const auth = require('../../middlewares/auth');
const { uploadAvatar, uploadThumbnail } = require('../../middlewares/upload');
const uploadController = require('../../controllers/upload.controller');

const router = express.Router();

router.patch('/users/:userId/avatar', auth(), uploadAvatar, uploadController.uploadUserAvatar);

router.patch('/instructors/:instructorId/avatar', auth('uploadInstructorAvatar'), uploadAvatar, uploadController.uploadInstructorAvatar);

router.patch('/courses/:courseId/thumbnail', auth('uploadThumbnail'), uploadThumbnail, uploadController.uploadCourseThumbnail);

module.exports = router;