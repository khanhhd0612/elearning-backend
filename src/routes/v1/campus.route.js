const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const campusValidation = require('../../validations/campus.validation');
const campusController = require('../../controllers/campus.controller');

const router = express.Router();

router.route('/').get(validate(campusValidation.getCampuses), campusController.getCampuses);

router.route('/').post(auth('managerCampus'), validate(campusValidation.createCampus), campusController.createCampus);

router.route('/:campusId').get(validate(campusValidation.getCampus), campusController.getCampus);

router.route('/:campusId').patch(auth('managerCampus'), validate(campusValidation.updateCampus), campusController.updateCampus);

router.route('/:campusId').delete(auth('managerCampus'), validate(campusValidation.deleteCampus), campusController.deleteCampus);

router.route('/:campusId/toggle').patch(auth('managerCampus'), validate(campusValidation.getCampus), campusController.toggleCampus);

module.exports = router;