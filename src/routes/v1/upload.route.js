const express = require('express');
const auth = require('../../middlewares/auth');
const { uploadAvatar, uploadThumbnail, uploadPostImage } = require('../../middlewares/upload');
const uploadController = require('../../controllers/upload.controller');

const router = express.Router();

router.patch('/users/:userId/avatar', auth(), uploadAvatar, (req, res, next) => {
    if (req.user.id !== req.params.userId) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }
    next();
}, uploadController.uploadUserAvatar);

router.patch('/instructors/:instructorId/avatar',
    auth('uploadInstructorAvatar'),
    uploadAvatar,
    async (req, res, next) => {
        const instructor = await require('../models/instructor.model').findById(req.params.instructorId);
        if (!instructor) return res.status(404).json({ error: 'Instructor not found' });

        const isOwner = instructor.userId.toString() === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        next();
    },
    uploadController.uploadInstructorAvatar
);

router.patch('/courses/:courseId/thumbnail', auth('uploadThumbnail'), uploadThumbnail, uploadController.uploadCourseThumbnail);

router.post('/blog-image', auth('managePosts'), uploadPostImage, uploadController.uploadBlogImage);

module.exports = router;