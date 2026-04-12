const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const courseFormatValidation = require('../../validations/courseFormat.validation');
const courseFormatController = require('../../controllers/courseFormat.controller');
const cache = require('../../middlewares/cache');

const router = express.Router({ mergeParams: true });

router.get('/', cache(1800), validate(courseFormatValidation.getCourseFormats), courseFormatController.getCourseFormats);

router.get('/:courseFormatId', cache(1800), validate(courseFormatValidation.getCourseFormat), courseFormatController.getCourseFormat);

router.post('/', auth('managerCourseFormat'), validate(courseFormatValidation.createCourseFormat), courseFormatController.createCourseFormat);

router.patch('/:courseFormatId', auth('managerCourseFormat'), validate(courseFormatValidation.updateCourseFormat), courseFormatController.updateCourseFormat);

router.delete('/:courseFormatId', auth('deleteCourseFormat'), validate(courseFormatValidation.deleteCourseFormat), courseFormatController.deleteCourseFormat);

router.patch('/:courseFormatId/toggle', auth('managerCourseFormat'), validate(courseFormatValidation.toggleCourseFormat), courseFormatController.toggleCourseFormat);

module.exports = router;