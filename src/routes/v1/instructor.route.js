const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const instructorValidation = require('../../validations/instructor.validation');
const instructorController = require('../../controllers/instructor.controller');

const router = express.Router();

router.route('/me').get(auth('instructorGetProfile'), instructorController.getMyProfile);

router.route('/').get(validate(instructorValidation.getInstructors), instructorController.getInstructors);

router.route('/').post(auth('managerInstructor'), validate(instructorValidation.createInstructor), instructorController.createInstructor);

router.route('/:instructorId').get(validate(instructorValidation.getInstructor), instructorController.getInstructor);

router.route('/:instructorId').patch(auth('updateInstructor'), validate(instructorValidation.updateInstructor), instructorController.updateInstructor);

router.route('/:instructorId').delete(auth('managerInstructor'), validate(instructorValidation.deleteInstructor), instructorController.deleteInstructor);

router.route('/:instructorId/toggle').patch(auth('managerInstructor'), validate(instructorValidation.getInstructor), instructorController.toggleInstructor);

module.exports = router;