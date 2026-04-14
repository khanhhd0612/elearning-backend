const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const lessonValidation = require('../../validations/courseLesson.validation');
const lessonController = require('../../controllers/courseLesson.controller');
const cache = require('../../middlewares/cache');

const router = express.Router({ mergeParams: true });

// Public — bài free xem được, bài trả phí kiểm tra enrollment trong service
router.get('/', cache(300), validate(lessonValidation.getLessons), lessonController.getLessons);
router.get('/my-progress', auth(), validate(lessonValidation.markProgress), lessonController.getMyProgress);
router.get('/:lessonId', auth(), lessonController.getLesson);

// Student actions
router.post('/:lessonId/progress', auth(), validate(lessonValidation.markProgress), lessonController.markVideoProgress);
router.post('/:lessonId/quiz', auth(), validate(lessonValidation.submitQuiz), lessonController.submitQuiz);

// Admin / instructor
router.post('/', auth('managerCourses'), validate(lessonValidation.createLesson), lessonController.createLesson);
router.patch('/:lessonId', auth('managerCourses'), validate(lessonValidation.updateLesson), lessonController.updateLesson);
router.delete('/:lessonId', auth('managerCourses'), lessonController.deleteLesson);

module.exports = router;