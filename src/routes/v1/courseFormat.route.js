const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const courseFormatValidation = require('../../validations/courseFormat.validation');
const courseFormatController = require('../../controllers/courseFormat.controller');

const router = express.Router({ mergeParams: true });

router.route('/').get(validate(courseFormatValidation.getCourseFormats), courseFormatController.getCourseFormats);

router.route('/:courseFormatId').get(validate(courseFormatValidation.getCourseFormat), courseFormatController.getCourseFormat);

router.route('/').post(auth('managerCourseFormat'), validate(courseFormatValidation.createCourseFormat), courseFormatController.createCourseFormat);

router.route('/:courseFormatId').patch(auth('managerCourseFormat'), validate(courseFormatValidation.updateCourseFormat), courseFormatController.updateCourseFormat);

router.route('/:courseFormatId').delete(auth('deleteCourseFormat'), validate(courseFormatValidation.deleteCourseFormat), courseFormatController.deleteCourseFormat);

router.route('/:courseFormatId/toggle').patch(auth('managerCourseFormat'),validate(courseFormatValidation.toggleCourseFormat),courseFormatController.toggleCourseFormat);

module.exports = router;