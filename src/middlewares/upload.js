const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const avatarStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'avatars',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
    },
});

const thumbnailStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'thumbnails',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 800, height: 450, crop: 'fill', gravity: 'center' }],
    },
});

const postImageStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'posts_content',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, crop: 'limit' }],
    },
});


const FILE_SIZE_LIMIT = 5 * 1024 * 1024;

const avatarUpload = multer({
    storage: avatarStorage,
    limits: {
        fileSize: FILE_SIZE_LIMIT
    }
});
const thumbnailUpload = multer({
    storage: thumbnailStorage,
    limits: {
        fileSize: FILE_SIZE_LIMIT
    }
});

const postImageUpload = multer({
    storage: postImageStorage,
    limits: {
        fileSize: FILE_SIZE_LIMIT
    }
});

const parseJsonFields = (...fields) => (req, res, next) => {
    fields.forEach((field) => {
        if (req.body?.[field] && typeof req.body[field] === 'string') {
            try {
                req.body[field] = JSON.parse(req.body[field]);
            } catch {
            }
        }
    });
    next();
};

module.exports = {
    uploadAvatar: avatarUpload.single('avatar'),

    uploadThumbnail: thumbnailUpload.single('thumbnail'),

    uploadSingle: (fieldName, preset = 'avatar') => {
        const instance = preset === 'thumbnail' ? thumbnailUpload : avatarUpload;
        return instance.single(fieldName);
    },

    uploadPostImage: postImageUpload.single('image'),

    parseJsonFields,
};