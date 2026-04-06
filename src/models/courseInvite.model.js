const mongoose = require('mongoose');
const { Schema } = mongoose;
const { toJSON } = require('./plugins');

const courseInviteSchema = new Schema(
    {
        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
            index: true,
        },

        // Người được mời
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },

        // Nếu user đã có tài khoản thì gắn luôn
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
            index: true,
        },

        // Người gửi lời mời
        invitedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        token: {
            type: String,
            required: true,
            unique: true,  // token dùng để xác nhận
        },

        status: {
            type: String,
            enum: ['pending', 'accepted', 'declined', 'expired'],
            default: 'pending',
            index: true,
        },

        expiresAt: {
            type: Date,
            required: true,
            index: { expireAfterSeconds: 0 }, //tự xóa sau khi hết hạn
        },

        acceptedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Một email chỉ có 1 invite pending cho mỗi course
courseInviteSchema.index(
    { courseId: 1, email: 1, status: 1 },
    { unique: true, partialFilterExpression: { status: 'pending' } }
);

courseInviteSchema.plugin(toJSON);

const CourseInvite = mongoose.model('CourseInvite', courseInviteSchema);
module.exports = CourseInvite;