const express = require('express');
const authRoute = require('./auth.route');
const categoryRoute = require('./category.route');
const courseRoute = require('./course.route');
const courseFormatRoute = require('./courseFormat.route');
const { router: cohortRouter, nestedRouter: cohortNestedRouter } = require('./cohort.route');
const enrollmentRoute = require('./enrollment.route');
const campusRoute = require('./campus.route');
const instructorRoute = require('./instructor.route');
const uploadRoute = require('./upload.route');
const enrollmentRequestRoute = require('./enrollmentRequest.route');
const postRoute = require('./post.route');
const userRoute = require('./user.route');
const { router: financingRouter, nestedRouter: financingNestedRouter } = require('./financingOption.route');
const walletRoute = require('./wallet.route');
const lessonRoute = require('./courseLesson.route');

const router = express.Router();

const defaultRoutes = [
    { path: '/auth', route: authRoute },
    { path: '/categories', route: categoryRoute },
    { path: '/campuses', route: campusRoute },
    { path: '/instructors', route: instructorRoute },
    { path: '/courses', route: courseRoute },
    { path: '/courses/:courseId/formats', route: courseFormatRoute },
    { path: '/course-formats/:courseFormatId/cohorts', route: cohortNestedRouter },
    { path: '/cohorts', route: cohortRouter },
    { path: '/enrollments', route: enrollmentRoute },
    { path: '/enrollments/:enrollmentId/financing', route: financingNestedRouter },
    { path: '/financing', route: financingRouter },
    { path: '/enrollment-requests', route: enrollmentRequestRoute },
    { path: '/posts', route: postRoute },
    { path: '/users', route: userRoute },
    { path: '/upload', route: uploadRoute },
    { path: '/wallet', route: walletRoute },
    { path: '/courses/:courseId/lessons', route: lessonRoute },
];

defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
});

module.exports = router;