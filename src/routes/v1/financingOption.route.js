const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const financingValidation = require('../../validations/financingOption.validation');
const financingController = require('../../controllers/financingOption.controller');

const nestedRouter = express.Router({ mergeParams: true });

nestedRouter.route('/').get(auth('getFinancing'), validate(financingValidation.getByEnrollment), financingController.getByEnrollment);

nestedRouter.route('/').post(auth('managerFinancing'), validate(financingValidation.createFinancingOption), financingController.createFinancingOption);

const router = express.Router();

router.route('/:financingId').get(auth('getFinancing', 'getMyFinancing'), validate(financingValidation.getFinancingOption), financingController.getFinancingOption);

router.route('/:financingId/payment').post(auth('managerFinancing'), validate(financingValidation.recordPayment), financingController.recordPayment);

router.route('/:financingId/isa').patch(auth('managerFinancing'), validate(financingValidation.updateIsa), financingController.updateIsa);

router.route('/:financingId/cancel').patch(auth('cancelFinancing'), validate(financingValidation.cancelFinancingOption), financingController.cancelFinancingOption);

module.exports = { router, nestedRouter };