const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const cohortValidation = require('../../validations/cohort.validation');
const cohortController = require('../../controllers/cohort.controller');

//nested dưới /course-formats/:courseFormatId/cohorts
const nestedRouter = express.Router({ mergeParams: true });

nestedRouter.route('/').get(validate(cohortValidation.getCohorts), cohortController.getCohorts);

nestedRouter.route('/').post(auth('managerCohorts'), validate(cohortValidation.createCohort), cohortController.createCohort);

const router = express.Router();

router.route('/:cohortId').get(validate(cohortValidation.getCohort), cohortController.getCohort);

router.route('/:cohortId').patch(auth('managerCohorts'), validate(cohortValidation.updateCohort), cohortController.updateCohort);

router.route('/:cohortId').delete(auth('admin'), validate(cohortValidation.deleteCohort), cohortController.deleteCohort);

router.route('/:cohortId/status').patch(auth('managerCohorts'), validate(cohortValidation.updateStatus), cohortController.updateStatus);

router.route('/:cohortId/instructors').post(auth('managerCohorts'), validate(cohortValidation.assignInstructor), cohortController.assignInstructor);

router.route('/:cohortId/instructors/:instructorId').delete(auth('managerCohorts'), validate(cohortValidation.removeInstructor), cohortController.removeInstructor);

module.exports = { router, nestedRouter };