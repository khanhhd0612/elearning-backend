const express = require('express');
const validate = require('../../middlewares/validate');
const postValidation = require('../../validations/post.validation');
const postController = require('../../controllers/post.controller');
const auth = require('../../middlewares/auth');

const router = express.Router();

router.get('/', validate(postValidation.getPosts), postController.queryPublicPosts);

router.get('/:slug', validate(postValidation.getPostDetail), postController.getPostDetail);

router.get('/admin/list', auth('managePosts'), validate(postValidation.getPosts), postController.queryPosts);

router.post('/', auth('managePosts'), validate(postValidation.createPost), postController.createPost);

router.get('/admin/:postId', auth('managePosts'), validate(postValidation.getPost), postController.getPostById);

router.patch('/:postId', auth('managePosts'), validate(postValidation.updatePost), postController.updatePost);

router.delete('/:postId', auth('managePosts'), validate(postValidation.deletePost), postController.deletePost);

module.exports = router;