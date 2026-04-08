const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const requestValidation = require('../../validations/enrollmentRequest.validation');
const requestController = require('../../controllers/enrollmentRequest.controller');

const router = express.Router();

router.get('/', auth('getEnrollmentRequests'), validate(requestValidation.getRequests), requestController.getRequests);

router.patch('/:requestId/assign', auth('assignCounselor'), validate(requestValidation.assignCounselor), requestController.assignCounselor);

router.post('/:requestId/call', auth('logCall'), validate(requestValidation.logCall), requestController.logCall);

router.post('/:requestId/interview', auth('logInterview'), validate(requestValidation.logInterview), requestController.logInterview);

router.patch('/:requestId/review', auth('reviewEnrollmentRequest'), validate(requestValidation.reviewRequest), requestController.reviewRequest);

module.exports = router;