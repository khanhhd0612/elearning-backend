const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const courseValidation = require('../../validations/course.validation');
const courseController = require('../../controllers/course.controller');
const cache = require('../../middlewares/cache');

const router = express.Router();

router.get('/public', cache(600), validate(courseValidation.getCourses), courseController.getPublicCourses);

router.get('/slug/:slug', cache(3600), validate(courseValidation.getCourseBySlug), courseController.getCourseBySlug);

router.get('/:courseId', cache(300), validate(courseValidation.getCourse), courseController.getCourse);

//Admin
router.route('/')
    .get(auth('managerCourses'), cache(120), validate(courseValidation.getCourses), courseController.getCourses)
    .post(auth('managerCourses'), validate(courseValidation.createCourse), courseController.createCourse);

router.route('/:courseId')
    .patch(auth('managerCourses'), validate(courseValidation.updateCourse), courseController.updateCourse)
    .delete(auth('deleteCourse'), validate(courseValidation.deleteCourse), courseController.deleteCourse);

router.patch('/:courseId/toggle', auth('managerCourses'), validate(courseValidation.toggleCourse), courseController.toggleCourse);

module.exports = router;