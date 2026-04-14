const mongoose = require('mongoose');
const { Schema } = mongoose;
const { toJSON } = require('./plugins');

const lessonProgressSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        enrollmentId: {
            type: Schema.Types.ObjectId,
            ref: 'Enrollment',
            required: true,
            index: true,
        },

        lessonId: {
            type: Schema.Types.ObjectId,
            ref: 'CourseLesson',
            required: true,
        },

        // Video: đã xem bao nhiêu %
        watchedPercent: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },

        // Coi là đã hoàn thành khi watchedPercent >= 80
        isCompleted: {
            type: Boolean,
            default: false,
            index: true,
        },

        completedAt: {
            type: Date,
            default: null,
        },

        // Quiz: lưu lần làm gần nhất
        quizAttempts: {
            type: Number,
            default: 0,
        },

        quizScore: {
            type: Number,
            default: null,
            min: 0,
            max: 100,
        },

        quizPassed: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

// Mỗi user chỉ có 1 progress record cho mỗi bài trong 1 enrollment
lessonProgressSchema.index(
    { enrollmentId: 1, lessonId: 1 },
    { unique: true }
);

lessonProgressSchema.plugin(toJSON);

const LessonProgress = mongoose.model('LessonProgress', lessonProgressSchema);
module.exports = LessonProgress;