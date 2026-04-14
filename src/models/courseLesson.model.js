const mongoose = require('mongoose');
const { Schema } = mongoose;
const { toJSON, paginate } = require('./plugins');

const quizOptionSchema = new Schema(
    {
        text: { type: String, required: true, trim: true },
        isCorrect: { type: Boolean, default: false },
    },
    { _id: true }
);

const quizQuestionSchema = new Schema(
    {
        question: { type: String, required: true, trim: true },
        options: { type: [quizOptionSchema], required: true },
        // Giải thích đáp án đúng
        explanation: { type: String, trim: true, default: '' },
    },
    { _id: true }
);

const courseLessonSchema = new Schema(
    {
        // Thuộc module nào (theo curriculum trong Course)
        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course',
            required: true,
            index: true,
        },

        moduleIndex: {
            type: Number,
            required: true,     // index của module trong course.curriculum
        },

        order: {
            type: Number,
            required: true,     // thứ tự trong module
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: [255, 'Tiêu đề không quá 255 ký tự'],
        },

        type: {
            type: String,
            enum: {
                values: ['video', 'document', 'quiz'],
                message: 'Loại bài học phải là video | document | quiz',
            },
            required: true,
            index: true,
        },
        //video
        videoUrl: {
            type: String,
            trim: true,
            default: '',
        },

        youtubeId: {
            type: String,
            trim: true,
            default: '',
        },

        durationSeconds: {
            type: Number,
            default: 0,
            min: 0,
        },

        // Document
        content: {
            type: String,
            default: '',
        },

        // File đính kèm
        attachmentUrl: {
            type: String,
            default: '',
        },

        attachmentName: {
            type: String,
            default: '',
        },

        //Quiz
        questions: {
            type: [quizQuestionSchema],
            default: [],
        },

        // Số điểm tối thiểu để pass quiz
        passingScore: {
            type: Number,
            default: 70,
            min: 0,
            max: 100,
        },

        // Số lần được làm lại quiz
        maxAttempts: {
            type: Number,
            default: 3,
            min: 1,
        },

        // Chung
        // Bài học có thể xem thử miễn phí không (preview)
        isFree: {
            type: Boolean,
            default: false,
            index: true,
        },

        isPublished: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// Thứ tự bài học trong module phải unique
courseLessonSchema.index(
    { courseId: 1, moduleIndex: 1, order: 1 },
    { unique: true }
);
courseLessonSchema.index({ courseId: 1, isPublished: 1 });

courseLessonSchema.virtual('embedUrl').get(function () {
    if (this.type !== 'video' || !this.youtubeId) return null;
    return `https://www.youtube.com/embed/${this.youtubeId}`;
});

courseLessonSchema.pre('save', function (next) {
    if (this.isModified('videoUrl') && this.videoUrl) {
        const id = extractYoutubeId(this.videoUrl);
        if (id) this.youtubeId = id;
    }

    // Validate type-specific fields
    if (this.type === 'video' && !this.videoUrl) {
        return next(new Error('Bài học dạng video phải có videoUrl'));
    }
    if (this.type === 'quiz' && this.questions.length === 0) {
        return next(new Error('Bài học dạng quiz phải có ít nhất 1 câu hỏi'));
    }

    next();
});

const extractYoutubeId = (url) => {
    const patterns = [
        /youtube\.com\/watch\?v=([^&]+)/,       // youtube.com/watch?v=ID
        /youtube\.com\/embed\/([^?]+)/,          // youtube.com/embed/ID
        /youtu\.be\/([^?]+)/,                    // youtu.be/ID
        /youtube\.com\/shorts\/([^?]+)/,         // youtube.com/shorts/ID
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
};

courseLessonSchema.plugin(toJSON);
courseLessonSchema.plugin(paginate);

const CourseLesson = mongoose.model('CourseLesson', courseLessonSchema);
module.exports = CourseLesson;