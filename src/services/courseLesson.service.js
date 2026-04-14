const CourseLesson = require('../models/courseLesson.model');
const LessonProgress = require('../models/lessonProgress.model');
const Enrollment = require('../models/enrollment.model');
const ApiError = require('../utils/ApiError');

const createLesson = async (courseId, body) => {
    return CourseLesson.create({ ...body, courseId });
};

const getLessons = async (courseId, filter = {}, isAdmin = false) => {
    const mongoFilter = { courseId };
    if (filter.moduleIndex !== undefined) mongoFilter.moduleIndex = filter.moduleIndex;

    // User thường chỉ thấy bài đã published
    if (!isAdmin) mongoFilter.isPublished = true;

    const lessons = await CourseLesson.find(mongoFilter)
        .sort({ moduleIndex: 1, order: 1 })
        .select(isAdmin ? '' : '-questions.options.isCorrect') // ẩn đáp án với user
        .lean();

    return lessons;
};

const getLessonById = async (lessonId, courseId) => {
    const lesson = await CourseLesson.findOne({ _id: lessonId, courseId });
    if (!lesson) throw new ApiError(404, 'Không tìm thấy bài học');
    return lesson;
};

const updateLesson = async (lessonId, courseId, updateBody) => {
    const lesson = await getLessonById(lessonId, courseId);
    Object.assign(lesson, updateBody);
    await lesson.save();
    return lesson;
};

const deleteLesson = async (lessonId, courseId) => {
    const lesson = await getLessonById(lessonId, courseId);
    await lesson.deleteOne();
};

const checkAccess = async (userId, lessonId) => {
    const lesson = await CourseLesson.findById(lessonId);
    if (!lesson) throw new ApiError(404, 'Không tìm thấy bài học');

    // Bài free → ai cũng xem được
    if (lesson.isFree) return { lesson, hasAccess: true };

    // Bài trả phí → phải có enrollment active
    const enrollment = await Enrollment.findOne({
        userId,
        courseId: lesson.courseId,
        status: 'active',
    });

    if (!enrollment) {
        throw new ApiError(403, 'Bạn chưa đăng ký khóa học này');
    }

    return { lesson, hasAccess: true, enrollment };
};

const markVideoProgress = async (userId, lessonId, { enrollmentId, watchedPercent }) => {
    const lesson = await CourseLesson.findById(lessonId);
    if (!lesson || lesson.type !== 'video') {
        throw new ApiError(404, 'Bài học không phải dạng video');
    }

    const isCompleted = watchedPercent >= 80; // xem 80% → tính là đã xem

    const progress = await LessonProgress.findOneAndUpdate(
        { enrollmentId, lessonId },
        {
            $set: {
                userId,
                watchedPercent,
                isCompleted,
                ...(isCompleted && { completedAt: new Date() }),
            },
        },
        { upsert: true, new: true }
    );

    // Cập nhật progressPercent trên Enrollment
    await updateEnrollmentProgress(enrollmentId, lesson.courseId);

    return progress;
};

const submitQuiz = async (userId, lessonId, { enrollmentId, answers }) => {
    const lesson = await CourseLesson.findById(lessonId);
    if (!lesson || lesson.type !== 'quiz') {
        throw new ApiError(404, 'Bài học không phải dạng quiz');
    }

    // Kiểm tra số lần làm
    const existing = await LessonProgress.findOne({ enrollmentId, lessonId });
    if (existing && existing.quizAttempts >= lesson.maxAttempts) {
        throw new ApiError(
            429,
            `Bạn đã dùng hết ${lesson.maxAttempts} lần làm quiz`
        );
    }

    // Chấm điểm
    let correctCount = 0;
    const results = lesson.questions.map((q) => {
        const selectedOptionId = answers[q._id.toString()];
        const selectedOption = q.options.id(selectedOptionId);
        const isCorrect = selectedOption?.isCorrect || false;
        if (isCorrect) correctCount++;
        return {
            questionId: q._id,
            isCorrect,
            explanation: q.explanation,
        };
    });

    const score = Math.round((correctCount / lesson.questions.length) * 100);
    const passed = score >= lesson.passingScore;
    const attempts = (existing?.quizAttempts || 0) + 1;

    const progress = await LessonProgress.findOneAndUpdate(
        { enrollmentId, lessonId },
        {
            $set: {
                userId,
                quizAttempts: attempts,
                quizScore: score,
                quizPassed: passed,
                isCompleted: passed,
                ...(passed && !existing?.completedAt && { completedAt: new Date() }),
            },
        },
        { upsert: true, new: true }
    );

    if (passed) {
        await updateEnrollmentProgress(enrollmentId, lesson.courseId);
    }

    return { score, passed, results, attemptsLeft: lesson.maxAttempts - attempts };
};

const updateEnrollmentProgress = async (enrollmentId, courseId) => {
    const [totalLessons, completedLessons] = await Promise.all([
        CourseLesson.countDocuments({ courseId, isPublished: true }),
        LessonProgress.countDocuments({ enrollmentId, isCompleted: true }),
    ]);

    if (totalLessons === 0) return;

    const progressPercent = Math.round((completedLessons / totalLessons) * 100);
    const status = progressPercent === 100 ? 'completed' : 'active';

    await Enrollment.findByIdAndUpdate(enrollmentId, {
        progressPercent,
        status,
        ...(status === 'completed' && { completedAt: new Date() }),
    });
};

const getMyProgress = async (enrollmentId) => {
    return LessonProgress.find({ enrollmentId })
        .select('lessonId isCompleted watchedPercent quizScore quizPassed completedAt')
        .lean();
};

module.exports = {
    createLesson,
    getLessons,
    getLessonById,
    updateLesson,
    deleteLesson,
    checkAccess,
    markVideoProgress,
    submitQuiz,
    getMyProgress,
};