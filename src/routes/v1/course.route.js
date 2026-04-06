const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const courseValidation = require('../../validations/course.validation');
const courseController = require('../../controllers/course.controller');

const router = express.Router();

router.route('/').get(validate(courseValidation.getCourses), courseController.getCourses);

router.route('/slug/:slug').get(validate(courseValidation.getCourseBySlug), courseController.getCourseBySlug);

router.route('/:courseId').get(validate(courseValidation.getCourse), courseController.getCourse);

router.route('/').post(auth('managerCourses'), validate(courseValidation.createCourse), courseController.createCourse);

router.route('/:courseId').patch(auth('managerCourses'), validate(courseValidation.updateCourse), courseController.updateCourse);

router.route('/:courseId').delete(auth('deleteCourse'), validate(courseValidation.deleteCourse), courseController.deleteCourse);

router.route('/:courseId/toggle').patch(auth('managerCourses'), validate(courseValidation.toggleCourse), courseController.toggleCourse);

module.exports = router;