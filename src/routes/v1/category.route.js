const express = require('express');
const router = express.Router();
const categoryController = require('../../controllers/category.controller');
const categoryValidation = require('../../validations/category.validation');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const cache = require('../../middlewares/cache');

router.get('/', cache(3600), validate(categoryValidation.getCategories), categoryController.getCategories);

router.get('/tree', cache(3600), categoryController.getCategoryTree);

router.get('/roots', cache(3600), categoryController.getRootCategories);

router.get('/slug/:slug', cache(3600), validate(categoryValidation.getCategoryBySlug), categoryController.getCategoryBySlug);

router.get('/:categoryId', cache(3600), validate(categoryValidation.getCategory), categoryController.getCategory);

router.get('/:categoryId/children', cache(3600), validate(categoryValidation.getChildCategories), categoryController.getChildCategories);

// Admin
router.post('/', auth('manageCategories'), validate(categoryValidation.createCategory), categoryController.createCategory);

router.patch('/:categoryId', auth('manageCategories'), validate(categoryValidation.updateCategory), categoryController.updateCategory);

router.delete('/:categoryId', auth('manageCategories'), validate(categoryValidation.deleteCategory), categoryController.deleteCategory);

module.exports = router;