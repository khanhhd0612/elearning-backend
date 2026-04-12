const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const cohortValidation = require('../../validations/cohort.validation');
const cohortController = require('../../controllers/cohort.controller');
const cache = require('../../middlewares/cache');

//nested dưới /course-formats/:courseFormatId/cohorts
const nestedRouter = express.Router({ mergeParams: true });

nestedRouter.get('/', cache(300), validate(cohortValidation.getCohorts), cohortController.getCohorts);

nestedRouter.post('/', auth('managerCohorts'), validate(cohortValidation.createCohort), cohortController.createCohort);

const router = express.Router();

router.get('/:cohortId', cache(300), validate(cohortValidation.getCohort), cohortController.getCohort);

router.patch('/:cohortId', auth('managerCohorts'), validate(cohortValidation.updateCohort), cohortController.updateCohort);

router.delete('/:cohortId', auth('deleteCohorts'), validate(cohortValidation.deleteCohort), cohortController.deleteCohort);

router.patch('/:cohortId/status', auth('managerCohorts'), validate(cohortValidation.updateStatus), cohortController.updateStatus);

router.post('/:cohortId/instructors', auth('managerCohorts'), validate(cohortValidation.assignInstructor), cohortController.assignInstructor);

router.delete('/:cohortId/instructors/:instructorId', auth('managerCohorts'), validate(cohortValidation.removeInstructor), cohortController.removeInstructor);

module.exports = { router, nestedRouter };