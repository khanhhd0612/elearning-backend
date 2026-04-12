const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const instructorValidation = require('../../validations/instructor.validation');
const instructorController = require('../../controllers/instructor.controller');
const cache = require('../../middlewares/cache');

const router = express.Router();

router.get('/me', auth('instructorGetProfile'), cache(300, { isPrivate: true }), instructorController.getMyProfile);

router.get('/', cache(600), validate(instructorValidation.getInstructors), instructorController.getInstructors);

router.post('/', auth('managerInstructor'), validate(instructorValidation.createInstructor), instructorController.createInstructor);

router.get('/:instructorId', cache(600), validate(instructorValidation.getInstructor), instructorController.getInstructor);

router.patch('/:instructorId', auth('updateInstructor'), validate(instructorValidation.updateInstructor), instructorController.updateInstructor);

router.delete('/:instructorId', auth('managerInstructor'), validate(instructorValidation.deleteInstructor), instructorController.deleteInstructor);

router.patch('/:instructorId/toggle', auth('managerInstructor'), validate(instructorValidation.getInstructor), instructorController.toggleInstructor);

module.exports = router;