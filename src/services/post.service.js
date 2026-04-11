const Post = require("../models/post.model");
const ApiError = require("../utils/ApiError");


const createPost = async (body) => {
    return Post.create(body);
}

const queryPosts = async (filter = {}, options = {}) => {
    const searchFilter = filter.search ? {
        ...filter,
        title: {
            $regex: filter.search,
            $options: 'i'
        }
    } : filter;
    delete searchFilter.search;

    return Post.paginate(searchFilter, {
        sortBy: options.sortBy || 'title:asc',
        limit: options.limit || 10,
        page: options.page || 1,
    });
}

const getPostById = async (postId) => {
    const post = await Post.findById(postId)
        .populate('createdBy', 'firstName lastName');

    if (!post) throw new ApiError(404, "Bài viết không tồn tại")

    return post;
}

const updatePost = async (postId, updateBody) => {
    const post = await getPostById(postId);

    Object.assign(post, updateBody);
    await post.save();
    return post;
}

const deletePost = async (postId) => {
    const post = await getPostById(postId);

    await post.deleteOne();
}

const getPostDetail = async (slug) => {
    const post = await Post.findOneAndUpdate(
        { slug, status: 'published' },
        { $inc: { views: 1 } },
        { new: true }
    ).populate('createdBy', 'firstName lastName');

    if (!post) throw new ApiError(404, "Bài viết không tồn tại hoặc đã bị ẩn");
    return post;
};

const queryPublicPosts = async (filter = {}, options = {}) => {
    const publicFilter = {
        ...filter,
        status: 'published'
    };

    const publicOptions = {
        ...options,
        select: 'title slug summary thumbnail createdAt views category',
        populate: 'createdBy:name'
    };

    return Post.paginate(publicFilter, publicOptions);
};

module.exports = {
    createPost,
    queryPosts,
    getPostById,
    updatePost,
    deletePost,
    getPostDetail,
    queryPublicPosts
}