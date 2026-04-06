const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/category.controller');
const categoryValidation = require('../../validations/category.validation');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');

router.get('/', validate(categoryValidation.getCategories), categoryController.getCategories);

router.get('/tree', categoryController.getCategoryTree);

router.get('/roots', categoryController.getRootCategories);

router.get('/slug/:slug', validate(categoryValidation.getCategoryBySlug), categoryController.getCategoryBySlug);

router.get('/:categoryId',auth('getCategory'), validate(categoryValidation.getCategory), categoryController.getCategory);

router.get('/:categoryId/children',auth('getCategories'), validate(categoryValidation.getChildCategories), categoryController.getChildCategories);

router.post('/', auth('manageCategories'), validate(categoryValidation.createCategory), categoryController.createCategory);

router.patch('/:categoryId', auth('manageCategories'), validate(categoryValidation.updateCategory), categoryController.updateCategory);

router.delete('/:categoryId', auth('manageCategories'), validate(categoryValidation.deleteCategory), categoryController.deleteCategory);

module.exports = router;