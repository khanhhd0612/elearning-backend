const express = require('express');
const validate = require('../../middlewares/validate');
const authValidation = require('../../validations/auth.validation');
const userController = require('../../controllers/user.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.get('/', auth("manageUsers"), validate(authValidation.queryUsers), userController.queryUsers);

router.post('/', auth('manageUsers'), validate(authValidation.createUser), userController.createUser);

router.get('/:userId', auth("manageUsers"), validate(authValidation.getUser), userController.getUser);

router.patch('/change-password', auth(), validate(authValidation.changePassword), userController.changePassword);

router.patch('/toggle/:userId', auth('manageUsers'), validate(authValidation.getUser), userController.toggleUser);

router.patch('/role', auth('manageUsers'), validate(authValidation.updateRole), userController.updateRole);

module.exports = router;