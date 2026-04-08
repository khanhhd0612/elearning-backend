const allRoles = {
    student: [
        'getCategories',
        'getCategory',
        'enroll',
        'getMyFinancing',
    ],
    instructor: [
        'managerCourses',
        'getCategories',
        'getCategory',
        'managerCohorts',
        'managerCourseFormat',
        'enroll',
        'managerEnrolls',
        'instructorGetProfile',
        'updateInstructor',
        'uploadInstructorAvatar',
        'managerFinancing',
        'logInterview', 

    ],
    counselor: [
        'getCategories',
        'getCategory',
        'getEnrollmentRequests',
        'logCall',
        'logInterview',
        'assignCounselor',
        'getFinancing',
    ],
    admin: [
        'managerCourses',
        'deleteCourse',
        'managerCampus',
        'getCategories',
        'getCategory',
        'manageCategories',
        'managerCohorts',
        'deleteCohorts',
        'managerCourseFormat',
        'deleteCourseFormat',
        'enroll',
        'managerEnrolls',
        'updateInstructor',
        'managerInstructor',
        'uploadInstructorAvatar',
        'uploadThumbnail',
        'managerFinancing',
        'getFinancing',
        'reviewEnrollmentRequest',
    ],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
    roles,
    roleRights,
};