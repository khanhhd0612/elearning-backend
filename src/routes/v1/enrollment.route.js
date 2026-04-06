const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const enrollmentController = require('../../controllers/enrollment.controller');
const enrollmentValidation = require('../../validations/enrollment.validation');

const router = express.Router();

//Public
router.post('/', auth('enroll'), validate(enrollmentValidation.enroll), enrollmentController.enroll);

//Approval
router.post('/request', auth('enroll'), validate(enrollmentValidation.requestEnrollment), enrollmentController.requestEnrollment);

router.patch('/request/:requestId/review', auth('managerEnrolls'), validate(enrollmentValidation.reviewRequest), enrollmentController.reviewEnrollmentRequest);

router.get('/requests', auth('managerEnrolls'), validate(enrollmentValidation.getPendingRequests), enrollmentController.getPendingRequests);

// Invite only
router.post('/invite', auth('managerEnrolls'), validate(enrollmentValidation.sendInvite), enrollmentController.sendInvite);

router.post('/accept-invite', auth('enroll'), validate(enrollmentValidation.acceptInvite), enrollmentController.acceptInvite);

module.exports = router;