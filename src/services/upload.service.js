const cloudinary = require('../config/cloudinary');
const User = require('../models/user.model');
const Instructor = require('../models/instructor.model');
const Course = require('../models/course.model');
const ApiError = require('../utils/ApiError');

const deleteOldImage = async (imageUrl) => {
    if (!imageUrl) return;

    try {
        // Lấy public_id từ URL cloudinary
        const parts = imageUrl.split('/');
        const file = parts[parts.length - 1];
        const folder = parts[parts.length - 2];
        const publicId = `${folder}/${file.split('.')[0]}`;

        await cloudinary.uploader.destroy(publicId);
    } catch (err) {
        console.warn(`[Upload] Failed to delete old image: ${err.message}`);
    }
};

const uploadUserAvatar = async (userId, file) => {
    if (!file) throw new ApiError(400, 'Không có file được upload');

    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, 'Không tìm thấy user');

    // Xóa avatar cũ
    await deleteOldImage(user.avatarUrl);

    user.avatarUrl = file.path;
    await user.save();
    return user;
};

const uploadInstructorAvatar = async (instructorId, file) => {
    if (!file) throw new ApiError(400, 'Không có file được upload');

    const instructor = await Instructor.findById(instructorId);
    if (!instructor) throw new ApiError(404, 'Không tìm thấy giảng viên');

    await deleteOldImage(instructor.avatarUrl);

    instructor.avatarUrl = file.path;
    await instructor.save();
    return instructor;
};

const uploadCourseThumbnail = async (courseId, file) => {
    if (!file) throw new ApiError(400, 'Không có file được upload');

    const course = await Course.findById(courseId);
    if (!course) throw new ApiError(404, 'Không tìm thấy khóa học');

    await deleteOldImage(course.thumbnailUrl);

    course.thumbnailUrl = file.path;
    await course.save();
    return course;
};

const deleteImage = async (imageUrl) => {
    await deleteOldImage(imageUrl);
};

const uploadBlogImage = async (file) => {
    if (!file) throw new ApiError(400, 'Không có file được upload');

    return {
        url: file.path
    };
};

module.exports = {
    uploadUserAvatar,
    uploadInstructorAvatar,
    uploadCourseThumbnail,
    deleteImage,
    uploadBlogImage
};