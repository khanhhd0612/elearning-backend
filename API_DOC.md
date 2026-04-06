# E-Learning Platform API Documentation

## Base URL
```
https://elearning-backend-uyu0.onrender.com/v1
```

## Authentication
- **JWT Bearer Token**: `Authorization: Bearer <accessToken>`
- **Cookies**: Refresh token stored in `refreshToken` cookie (7 days expiry)

---

## Table of Contents
1. [Auth](#auth)
2. [Categories](#categories)
3. [Courses](#courses)
4. [Course Formats](#course-formats)
5. [Cohorts](#cohorts)
6. [Enrollments](#enrollments)
7. [Financing Options](#financing-options)
8. [Campuses](#campuses)
9. [Instructors](#instructors)
10. [Upload](#upload)
11. [Models](#models)
12. [Roles & Permissions](#roles--permissions)

---

## Auth

### Register
```
POST /auth/register
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "Nguyen",
  "lastName": "Van A",
  "phone": "0912345678"
}
```
**Response:** `201 Created`
```json
{
  "status": "success",
  "message": "Đăng ký thành công. Vui lòng kiểm tra email để xác minh",
  "data": { "user": {...} }
}
```

### Login
```
POST /auth/login
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```
**Response:** `200 OK`
```json
{
  "status": "success",
  "message": "Đăng nhập thành công",
  "data": {
    "user": {...},
    "accessToken": "eyJhbG..."
  }
}
```

### Get Me
```
GET /auth/me
```
**Headers:** `Authorization: Bearer <accessToken>`

### Logout
```
POST /auth/logout
```
**Headers:** `Authorization: Bearer <accessToken>`

### Refresh Token
```
POST /auth/refresh
```
**Cookies:** Reads `refreshToken` from cookie

### Forgot Password
```
POST /auth/forgot-password
```
**Body:**
```json
{
  "email": "user@example.com"
}
```

### Reset Password
```
POST /auth/reset-password/:resetToken
```
**Body:**
```json
{
  "newPassword": "NewSecurePass123"
}
```

---

## Categories

### Get All Categories
```
GET /categories
```
**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| parentId | string | Filter by parent category ID |
| isActive | boolean | Filter by active status |
| sortBy | string | Sort field (e.g., `createdAt:desc`) |
| limit | number | Items per page (default: 20) |
| page | number | Page number (default: 1) |

### Get Category Tree
```
GET /categories/tree
```
Returns hierarchical category structure.

### Get Root Categories
```
GET /categories/roots
```
Returns only top-level categories (parentId: null).

### Get Category by Slug
```
GET /categories/slug/:slug
```

### Get Category by ID
```
GET /categories/:categoryId
```
**Auth:** Required (role: `getCategory`)

### Get Child Categories
```
GET /categories/:categoryId/children
```
**Auth:** Required (role: `getCategories`)

### Create Category
```
POST /categories
```
**Auth:** Required (role: `manageCategories`)
**Body:**
```json
{
  "name": "Programming",
  "parentId": "64abc123...",
  "icon": "code",
  "colorHex": "#3B82F6",
  "sortOrder": 1,
  "description": "Programming courses"
}
```

### Update Category
```
PATCH /categories/:categoryId
```
**Auth:** Required (role: `manageCategories`)

### Delete Category
```
DELETE /categories/:categoryId
```
**Auth:** Required (role: `manageCategories`)

---

## Courses

### Get All Courses
```
GET /courses
```
**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| categoryId | string | Filter by category |
| enrollmentType | string | `public`, `approval`, `invite_only` |
| level | string | `beginner`, `intermediate`, `advanced`, `expert` |
| isActive | boolean | Filter by active status |
| minPrice | number | Minimum price |
| maxPrice | number | Maximum price |
| search | string | Search in title |
| sortBy | string | Sort field |
| limit | number | Items per page |
| page | number | Page number |
| populate | string | `formats`, `categoryId` |

### Get Course by Slug
```
GET /courses/slug/:slug
```

### Get Course by ID
```
GET /courses/:courseId
```
**Query:** `?populate=formats,categoryId`

### Create Course
```
POST /courses
```
**Auth:** Required (role: `managerCourses`)
**Body:**
```json
{
  "categoryId": "64abc123...",
  "title": "Web Development Bootcamp",
  "description": "Full-stack web development",
  "durationWeeks": 12,
  "basePrice": 15000000,
  "enrollmentType": "public",
  "level": "beginner",
  "requiredSkills": [
    { "name": "HTML/CSS", "isRequired": true },
    { "name": "JavaScript", "isRequired": true }
  ]
}
```

### Update Course
```
PATCH /courses/:courseId
```
**Auth:** Required (role: `managerCourses`)

### Toggle Course Status
```
PATCH /courses/:courseId/toggle
```
**Auth:** Required (role: `managerCourses`)

### Delete Course
```
DELETE /courses/:courseId
```
**Auth:** Required (role: `deleteCourse`)

---

## Course Formats

### Get Course Formats
```
GET /courses/:courseId/formats
```
**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| formatType | string | `oncampus`, `online`, `remote`, `hybrid` |
| isActive | boolean | Filter by active status |

### Get Course Format by ID
```
GET /courses/:courseId/formats/:courseFormatId
```

### Create Course Format
```
POST /courses/:courseId/formats
```
**Auth:** Required (role: `managerCourseFormat`)
**Body (Online):**
```json
{
  "formatType": "online",
  "priceOverride": 12000000,
  "onlineDetail": {
    "totalVideos": 50,
    "totalHours": 120,
    "platform": "LMS",
    "hasLifetimeAccess": true,
    "hasCertificate": true
  }
}
```
**Body (On-campus):**
```json
{
  "formatType": "oncampus",
  "priceOverride": 20000000,
  "oncampusDetail": {
    "campusId": "64abc123...",
    "hoursPerWeek": 20,
    "schedule": "Thứ 2-6, 8h-12h",
    "maxSeats": 30
  }
}
```
**Body (Remote):**
```json
{
  "formatType": "remote",
  "remoteDetail": {
    "timezone": "Asia/Ho_Chi_Minh",
    "zoomLink": "https://zoom.us/j/...",
    "hoursPerWeek": 15,
    "schedule": "Thứ 2-4-6, 19h-22h",
    "maxSeats": 25
  }
}
```
**Body (Hybrid):**
```json
{
  "formatType": "hybrid",
  "hybridDetail": {
    "campusId": "64abc123...",
    "oncampusHours": 60,
    "remoteHours": 60,
    "onlineHours": 20,
    "schedule": "Thứ 2-4, 8h-16h + Thứ 6 online",
    "maxSeats": 20
  }
}
```

### Update Course Format
```
PATCH /courses/:courseId/formats/:courseFormatId
```
**Auth:** Required (role: `managerCourseFormat`)

### Toggle Course Format
```
PATCH /courses/:courseId/formats/:courseFormatId/toggle
```
**Auth:** Required (role: `managerCourseFormat`)

### Delete Course Format
```
DELETE /courses/:courseId/formats/:courseFormatId
```
**Auth:** Required (role: `deleteCourseFormat`)

---

## Cohorts

### Get Cohorts (Nested)
```
GET /course-formats/:courseFormatId/cohorts
```
**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| status | string | `upcoming`, `ongoing`, `completed`, `cancelled` |
| sortBy | string | `startDate:asc`, `startDate:desc`, `createdAt:desc` |
| limit | number | Items per page |
| page | number | Page number |
| populate | string | `instructors`, `enrollmentCount` |

### Create Cohort (Nested)
```
POST /course-formats/:courseFormatId/cohorts
```
**Auth:** Required (role: `managerCohorts`)
**Body:**
```json
{
  "name": "WebDev 2024-A",
  "startDate": "2024-03-01T00:00:00Z",
  "endDate": "2024-05-31T00:00:00Z",
  "maxSeats": 30
}
```

### Get Cohort by ID
```
GET /cohorts/:cohortId
```

### Update Cohort
```
PATCH /cohorts/:cohortId
```
**Auth:** Required (role: `managerCohorts`)

### Update Cohort Status
```
PATCH /cohorts/:cohortId/status
```
**Auth:** Required (role: `managerCohorts`)
**Body:**
```json
{
  "status": "ongoing",
  "cancelReason": ""
}
```
Or for cancellation:
```json
{
  "status": "cancelled",
  "cancelReason": "Insufficient enrollment"
}
```

### Assign Instructor
```
POST /cohorts/:cohortId/instructors
```
**Auth:** Required (role: `managerCohorts`)
**Body:**
```json
{
  "instructorId": "64abc123...",
  "role": "lead"
}
```
**Roles:** `lead`, `assistant`, `guest`

### Remove Instructor
```
DELETE /cohorts/:cohortId/instructors/:instructorId
```
**Auth:** Required (role: `managerCohorts`)

### Delete Cohort
```
DELETE /cohorts/:cohortId
```
**Auth:** Required (role: `admin`)

---

## Enrollments

### Enroll (Public Course)
```
POST /enrollments
```
**Auth:** Required (role: `enroll`)
**Body:**
```json
{
  "cohortId": "64abc123..."
}
```

### Request Enrollment (Approval Course)
```
POST /enrollments/request
```
**Auth:** Required (role: `enroll`)
**Body:**
```json
{
  "cohortId": "64abc123...",
  "motivation": "I want to learn web development to change my career..."
}
```

### Review Enrollment Request
```
PATCH /enrollments/request/:requestId/review
```
**Auth:** Required (role: `managerEnrolls`)
**Body:**
```json
{
  "action": "approved",
  "rejectionReason": ""
}
```
**Actions:** `approved`, `rejected`

### Get Pending Requests
```
GET /enrollments/requests
```
**Auth:** Required (role: `managerEnrolls`)
**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| cohortId | string | Filter by cohort |
| courseId | string | Filter by course |
| status | string | `pending`, `approved`, `rejected` |
| sortBy | string | Sort field |
| limit | number | Items per page |
| page | number | Page number |

### Send Invite (Invite-Only Course)
```
POST /enrollments/invite
```
**Auth:** Required (role: `managerEnrolls`)
**Body:**
```json
{
  "courseId": "64abc123...",
  "email": "student@example.com"
}
```

### Accept Invite
```
POST /enrollments/accept-invite
```
**Auth:** Required (role: `enroll`)
**Body:**
```json
{
  "token": "abc123...",
  "cohortId": "64abc123..."
}
```

---

## Financing Options

### Get Financing by Enrollment
```
GET /enrollments/:enrollmentId/financing
```
**Auth:** Required (roles: `getFinancing` or `getMyFinancing`)

### Create Financing Option
```
POST /enrollments/:enrollmentId/financing
```
**Auth:** Required (role: `managerFinancing`)
**Body (Full Payment):**
```json
{
  "type": "full",
  "totalAmount": 15000000
}
```
**Body (Installment):**
```json
{
  "type": "installment",
  "totalAmount": 15000000,
  "installments": [
    { "dueDate": "2024-03-01T00:00:00Z", "amount": 5000000 },
    { "dueDate": "2024-04-01T00:00:00Z", "amount": 5000000 },
    { "dueDate": "2024-05-01T00:00:00Z", "amount": 5000000 }
  ]
}
```
**Body (Scholarship):**
```json
{
  "type": "scholarship",
  "totalAmount": 15000000,
  "scholarshipCode": "SCHOOL2024",
  "discountAmount": 5000000,
  "discountPercentage": 33.33
}
```
**Body (ISA - Income Share Agreement):**
```json
{
  "type": "isa",
  "totalAmount": 15000000,
  "isaPercentage": 17,
  "isaDurationMonths": 24,
  "isaStartDate": "2024-06-01T00:00:00Z"
}
```

### Get Financing Option
```
GET /financing/:financingId
```
**Auth:** Required (roles: `getFinancing` or `getMyFinancing`)

### Record Payment
```
POST /financing/:financingId/payment
```
**Auth:** Required (role: `managerFinancing`)
**Body:**
```json
{
  "amount": 5000000,
  "installmentId": "64abc123...",
  "notes": "Payment via bank transfer"
}
```

### Update ISA
```
PATCH /financing/:financingId/isa
```
**Auth:** Required (role: `managerFinancing`)
**Body:**
```json
{
  "isaStartDate": "2024-07-01T00:00:00Z",
  "isaPercentage": 15,
  "isaDurationMonths": 18
}
```

### Cancel Financing
```
PATCH /financing/:financingId/cancel
```
**Auth:** Required (role: `cancelFinancing`)
**Body:**
```json
{
  "notes": "Student requested cancellation"
}
```

---

## Campuses

### Get All Campuses
```
GET /campuses
```
**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| isActive | boolean | Filter by active status |
| city | string | Filter by city |
| sortBy | string | Sort field |
| limit | number | Items per page |
| page | number | Page number |

### Get Campus by ID
```
GET /campuses/:campusId
```

### Create Campus
```
POST /campuses
```
**Auth:** Required (role: `managerCampus`)
**Body:**
```json
{
  "name": "Hanoi Campus",
  "city": "Hanoi",
  "country": "Vietnam",
  "timezone": "Asia/Ho_Chi_Minh",
  "address": "123 ABC Street",
  "phone": "02412345678",
  "email": "hanoi@school.edu.vn"
}
```

### Update Campus
```
PATCH /campuses/:campusId
```
**Auth:** Required (role: `managerCampus`)

### Toggle Campus
```
PATCH /campuses/:campusId/toggle
```
**Auth:** Required (role: `managerCampus`)

### Delete Campus
```
DELETE /campuses/:campusId
```
**Auth:** Required (role: `managerCampus`)

---

## Instructors

### Get My Profile
```
GET /instructors/me
```
**Auth:** Required (role: `instructorGetProfile`)

### Get All Instructors
```
GET /instructors
```
**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| campusId | string | Filter by campus |
| isActive | boolean | Filter by active status |
| search | string | Search by name |
| sortBy | string | Sort field |
| limit | number | Items per page |
| page | number | Page number |
| populate | string | `userId`, `campusId`, `cohorts` |

### Get Instructor by ID
```
GET /instructors/:instructorId
```

### Create Instructor
```
POST /instructors
```
**Auth:** Required (role: `managerInstructor`)
**Body:**
```json
{
  "userId": "64abc123...",
  "campusId": "64abc123...",
  "bio": "Senior web developer with 10 years experience",
  "linkedinUrl": "https://linkedin.com/in/...",
  "expertise": ["React", "Node.js", "MongoDB"]
}
```

### Update Instructor
```
PATCH /instructors/:instructorId
```
**Auth:** Required (role: `updateInstructor`)

### Toggle Instructor
```
PATCH /instructors/:instructorId/toggle
```
**Auth:** Required (role: `managerInstructor`)

### Delete Instructor
```
DELETE /instructors/:instructorId
```
**Auth:** Required (role: `managerInstructor`)

---

## Upload

### Upload User Avatar
```
PATCH /upload/users/:userId/avatar
```
**Auth:** Required
**Content-Type:** `multipart/form-data`
**Body:** `file` (image, max 5MB)

### Upload Instructor Avatar
```
PATCH /upload/instructors/:instructorId/avatar
```
**Auth:** Required (role: `uploadInstructorAvatar`)
**Content-Type:** `multipart/form-data`
**Body:** `file` (image, max 5MB)

### Upload Course Thumbnail
```
PATCH /upload/courses/:courseId/thumbnail
```
**Auth:** Required (role: `uploadThumbnail`)
**Content-Type:** `multipart/form-data`
**Body:** `file` (image, max 5MB)

---

## Models

### User
```json
{
  "_id": "64abc123...",
  "firstName": "Nguyen",
  "lastName": "Van A",
  "email": "user@example.com",
  "phone": "0912345678",
  "role": "student",
  "profileImage": "https://cloudinary.com/...",
  "isActive": true,
  "isVerified": false,
  "lastLogin": "2024-01-15T10:30:00Z",
  "createdAt": "2024-01-01T00:00:00Z"
}
```
**Roles:** `student`, `instructor`, `admin`

### Category
```json
{
  "_id": "64abc123...",
  "parentId": null,
  "name": "Programming",
  "slug": "programming",
  "icon": "code",
  "colorHex": "#3B82F6",
  "level": 0,
  "sortOrder": 1,
  "description": "Programming courses",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Course
```json
{
  "_id": "64abc123...",
  "categoryId": "64abc123...",
  "slug": "web-development-bootcamp",
  "title": "Web Development Bootcamp",
  "description": "Full-stack web development course",
  "durationWeeks": 12,
  "basePrice": 15000000,
  "enrollmentType": "public",
  "level": "beginner",
  "requiredSkills": [
    { "name": "HTML/CSS", "isRequired": true }
  ],
  "thumbnailUrl": "https://cloudinary.com/...",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```
**enrollmentType:** `public`, `approval`, `invite_only`
**level:** `beginner`, `intermediate`, `advanced`, `expert`

### CourseFormat
```json
{
  "_id": "64abc123...",
  "courseId": "64abc123...",
  "formatType": "oncampus",
  "priceOverride": 20000000,
  "isActive": true,
  "oncampusDetail": {
    "campusId": "64abc123...",
    "hoursPerWeek": 20,
    "schedule": "Thứ 2-6, 8h-12h",
    "maxSeats": 30
  }
}
```
**formatType:** `oncampus`, `online`, `remote`, `hybrid`

### Cohort
```json
{
  "_id": "64abc123...",
  "courseFormatId": "64abc123...",
  "name": "WebDev 2024-A",
  "startDate": "2024-03-01T00:00:00Z",
  "endDate": "2024-05-31T00:00:00Z",
  "status": "upcoming",
  "maxSeats": 30
}
```
**status:** `upcoming`, `ongoing`, `completed`, `cancelled`

### Enrollment
```json
{
  "_id": "64abc123...",
  "userId": "64abc123...",
  "cohortId": "64abc123...",
  "courseId": "64abc123...",
  "status": "active",
  "amountPaid": 5000000,
  "paymentStatus": "partial",
  "completedAt": null,
  "droppedAt": null,
  "dropReason": "",
  "createdAt": "2024-02-01T00:00:00Z"
}
```
**status:** `active`, `completed`, `dropped`, `deferred`
**paymentStatus:** `pending`, `partial`, `paid`, `refunded`

### FinancingOption
```json
{
  "_id": "64abc123...",
  "enrollmentId": "64abc123...",
  "type": "installment",
  "totalAmount": 15000000,
  "paidAmount": 5000000,
  "status": "active",
  "installments": [
    { "_id": "...", "dueDate": "...", "amount": 5000000, "status": "paid", "paidAt": "..." },
    { "_id": "...", "dueDate": "...", "amount": 5000000, "status": "pending" },
    { "_id": "...", "dueDate": "...", "amount": 5000000, "status": "pending" }
  ],
  "scholarshipCode": "",
  "discountAmount": 0,
  "isaPercentage": 0,
  "isaDurationMonths": 0,
  "provider": "",
  "notes": "",
  "createdAt": "2024-02-01T00:00:00Z"
}
```
**type:** `full`, `installment`, `scholarship`, `isa`
**status:** `pending`, `active`, `completed`, `defaulted`, `cancelled`

### Campus
```json
{
  "_id": "64abc123...",
  "slug": "hanoi-campus",
  "name": "Hanoi Campus",
  "city": "Hanoi",
  "country": "Vietnam",
  "timezone": "Asia/Ho_Chi_Minh",
  "address": "123 ABC Street",
  "phone": "02412345678",
  "email": "hanoi@school.edu.vn",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Instructor
```json
{
  "_id": "64abc123...",
  "userId": "64abc123...",
  "campusId": "64abc123...",
  "bio": "Senior web developer...",
  "linkedinUrl": "https://linkedin.com/in/...",
  "expertise": ["React", "Node.js"],
  "avatarUrl": "https://cloudinary.com/...",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### EnrollmentRequest
```json
{
  "_id": "64abc123...",
  "userId": "64abc123...",
  "cohortId": "64abc123...",
  "courseId": "64abc123...",
  "status": "pending",
  "motivation": "I want to learn...",
  "rejectionReason": "",
  "reviewedBy": "64abc123...",
  "reviewedAt": null,
  "createdAt": "2024-02-01T00:00:00Z"
}
```
**status:** `pending`, `approved`, `rejected`

### CourseInvite
```json
{
  "_id": "64abc123...",
  "courseId": "64abc123...",
  "email": "student@example.com",
  "token": "abc123...",
  "status": "pending",
  "sentBy": "64abc123...",
  "acceptedAt": null,
  "expiresAt": "2024-03-01T00:00:00Z",
  "createdAt": "2024-02-01T00:00:00Z"
}
```
**status:** `pending`, `accepted`, `expired`

---

## Roles & Permissions

| Role | Permissions |
|------|-------------|
| student | `enroll`, `getMyFinancing`, `cancelFinancing` |
| instructor | `instructorGetProfile`, `uploadInstructorAvatar`, `getFinancing` |
| managerCourses | `managerCourses`, `deleteCourse`, `uploadThumbnail` |
| managerCohorts | `managerCohorts`, `assignInstructor` |
| managerEnrolls | `managerEnrolls`, `sendInvite` |
| managerFinancing | `managerFinancing`, `recordPayment` |
| managerCampus | `managerCampus` |
| managerInstructor | `managerInstructor` |
| managerCategory | `manageCategories` |
| getCategory | `getCategory` |
| getCategories | `getCategories` |
| updateInstructor | `updateInstructor` |
| deleteCourseFormat | `deleteCourseFormat` |
| admin | All permissions |

---

## Common Response Format

### Success
```json
{
  "status": "success",
  "data": {...}
}
```
Or with message:
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": {...}
}
```

### Paginated Response
```json
{
  "status": "success",
  "data": {
    "docs": [...],
    "totalDocs": 100,
    "limit": 20,
    "page": 1,
    "totalPages": 5
  }
}
```

### Error
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [...]
}
```

---

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful delete) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Rate Limiting

- **Production:** Auth endpoints limited to 100 requests per 15 minutes
- **Development:** No rate limiting

---

## Environment Variables

```env
NODE_ENV=development
PORT=3000
MONGODB_URL=mongodb://localhost:27017/elearning
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_RESET_PASSWORD_EXPIRES_IN=15m
JWT_EMAIL_VERIFY_EXPIRES_IN=15m
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
MAILJET_API_KEY=your-api-key
MAILJET_API_SECRET=your-api-secret
MAILJET_FROM_EMAIL=noreply@example.com
MAILJET_FROM_NAME=E-Learning
```
