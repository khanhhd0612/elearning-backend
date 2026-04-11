const postService = require("../services/post.service");
const catchAsync = require("../utils/catchAsync");
const pick = require("../utils/pick");

const createPost = catchAsync(async (req, res) => {
    const postData = {
        ...req.body,
        createdBy: req.user.id
    };

    const post = await postService.createPost(postData);

    res.status(201).json({
        status: 'success',
        data: post,
    })
});

const queryPosts = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['search', 'status', 'isFeatured']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);

    const result = await postService.queryPosts(filter, options);

    res.status(200).json({
        status: 'success',
        data: result,
    })
});

const queryPublicPosts = catchAsync(async (req, res) => {
    const filter = pick(req.query, ['search', 'status', 'isFeatured']);
    const options = pick(req.query, ['sortBy', 'limit', 'page']);

    const result = await postService.queryPublicPosts(filter, options);

    res.status(200).json({
        status: 'success',
        data: result,
    })
});

const getPostDetail = catchAsync(async (req, res) => {
    const post = await postService.getPostDetail(req.params.slug);

    res.status(200).json({
        status: 'success',
        data: post,
    })
});

const updatePost = catchAsync(async (req, res) => {
    const post = await postService.updatePost(req.params.postId, req.body);

    res.status(200).json({
        status: 'success',
        data: post,
    })
});

const deletePost = catchAsync(async (req, res) => {
    await postService.deletePost(req.params.postId);

    res.status(204).send()
})

const getPostById = catchAsync(async (req, res) => {
    const post = await postService.getPostById(req.params.postId);

    res.status(200).json({
        status: 'success',
        data: post,
    })
})

module.exports = {
    createPost,
    queryPosts,
    getPostById,
    updatePost,
    deletePost,
    getPostDetail,
    queryPublicPosts
}

