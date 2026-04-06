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
        'uploadInstructorAvatar'
    ],
    admin: [
        'managerCourses',
        'deleteCourse',
        'managerCampus',
        'getCategories',
        'getCategory',
        'manageCategories',
        'managerCohorts',
        'managerCourseFormat',
        'deleteCourseFormat',
        'enroll',
        'managerEnrolls',
        'updateInstructor',
        'managerInstructor',
        'uploadInstructorAvatar',
        'uploadThumbnail'
    ],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
    roles,
    roleRights,
};