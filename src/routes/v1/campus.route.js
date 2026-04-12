const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const campusValidation = require('../../validations/campus.validation');
const campusController = require('../../controllers/campus.controller');
const cache = require('../../middlewares/cache');

const router = express.Router();

router.get('/', cache(86400), validate(campusValidation.getCampuses), campusController.getCampuses);

router.post('/', auth('managerCampus'), validate(campusValidation.createCampus), campusController.createCampus);

router.get('/:campusId', cache(86400), validate(campusValidation.getCampus), campusController.getCampus);

router.patch('/:campusId', auth('managerCampus'), validate(campusValidation.updateCampus), campusController.updateCampus);

router.delete('/:campusId', auth('managerCampus'), validate(campusValidation.deleteCampus), campusController.deleteCampus);

router.patch('/:campusId/toggle', auth('managerCampus'), validate(campusValidation.getCampus), campusController.toggleCampus);

module.exports = router;