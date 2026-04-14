const Joi = require('joi');
const { objectId } = require('./custom.validation');

const quizOptionRule = Joi.object({
    text: Joi.string().trim().max(500).required(),
    isCorrect: Joi.boolean().default(false),
});

const quizQuestionRule = Joi.object({
    question: Joi.string().trim().max(1000).required(),
    options: Joi.array().items(quizOptionRule).min(2).max(6).required()
        .messages({ 'array.min': 'Câu hỏi cần ít nhất 2 lựa chọn' }),
    explanation: Joi.string().trim().max(1000).allow('').default(''),
}).custom((value, helpers) => {
    // Phải có ít nhất 1 đáp án đúng
    const hasCorrect = value.options.some((o) => o.isCorrect);
    if (!hasCorrect) return helpers.error('any.invalid', { message: 'Phải có ít nhất 1 đáp án đúng' });
    return value;
});

const createLesson = {
    params: Joi.object().keys({
        courseId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object()
        .keys({
            moduleIndex: Joi.number().integer().min(0).required(),
            order: Joi.number().integer().min(1).required(),
            title: Joi.string().trim().max(255).required(),
            type: Joi.string().valid('video', 'document', 'quiz').required(),
            isFree: Joi.boolean().default(false),
            isPublished: Joi.boolean().default(false),

            // Video
            videoUrl: Joi.string().uri().when('type', {
                is: 'video',
                then: Joi.required().messages({ 'any.required': 'Video URL là bắt buộc' }),
            }),
            durationSeconds: Joi.number().min(0).default(0),

            // Document
            content: Joi.string().allow('').default(''),
            attachmentUrl: Joi.string().uri().allow('').default(''),
            attachmentName: Joi.string().trim().allow('').default(''),

            // Quiz
            questions: Joi.array().items(quizQuestionRule).when('type', {
                is: 'quiz',
                then: Joi.array().min(1).required()
                    .messages({ 'array.min': 'Quiz cần ít nhất 1 câu hỏi' }),
            }),
            passingScore: Joi.number().min(0).max(100).default(70),
            maxAttempts: Joi.number().integer().min(1).default(3),
        })
        .custom((value, helpers) => {
            // videoUrl phải là YouTube
            if (value.videoUrl) {
                const ytPatterns = [/youtube\.com/, /youtu\.be/];
                const isYT = ytPatterns.some((p) => p.test(value.videoUrl));
                if (!isYT) return helpers.error('any.invalid', { message: 'Chỉ hỗ trợ link YouTube' });
            }
            return value;
        }),
};

const updateLesson = {
    params: Joi.object().keys({
        courseId: Joi.string().custom(objectId).required(),
        lessonId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object()
        .keys({
            order: Joi.number().integer().min(1),
            title: Joi.string().trim().max(255),
            isFree: Joi.boolean(),
            isPublished: Joi.boolean(),
            videoUrl: Joi.string().uri(),
            durationSeconds: Joi.number().min(0),
            content: Joi.string().allow(''),
            attachmentUrl: Joi.string().uri().allow(''),
            attachmentName: Joi.string().trim().allow(''),
            questions: Joi.array().items(quizQuestionRule),
            passingScore: Joi.number().min(0).max(100),
            maxAttempts: Joi.number().integer().min(1),
        })
        .min(1),
};

const getLessons = {
    params: Joi.object().keys({
        courseId: Joi.string().custom(objectId).required(),
    }),
    query: Joi.object().keys({
        moduleIndex: Joi.number().integer().min(0),
        isPublished: Joi.boolean(),
    }),
};

const markProgress = {
    params: Joi.object().keys({
        lessonId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        watchedPercent: Joi.number().min(0).max(100),
        enrollmentId: Joi.string().custom(objectId).required(),
    }),
};

const submitQuiz = {
    params: Joi.object().keys({
        lessonId: Joi.string().custom(objectId).required(),
    }),
    body: Joi.object().keys({
        enrollmentId: Joi.string().custom(objectId).required(),
        // answers: { questionId: optionId }
        answers: Joi.object().pattern(
            Joi.string().custom(objectId),
            Joi.string().custom(objectId)
        ).required(),
    }),
};

module.exports = { createLesson, updateLesson, getLessons, markProgress, submitQuiz };