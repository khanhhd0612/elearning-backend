# E-Learning Platform API Documentation

## Base URL
```
https://elearning-backend-uyu0.onrender.com/v1
```

## Global Headers
| Header | Value | Required | Description |
|--------|-------|----------|-------------|
| Content-Type | application/json | Yes | Request body format (for POST/PATCH) |
| Authorization | Bearer {accessToken} | Conditional | JWT token for authenticated endpoints |

## Content Types
| Type | Value | Usage |
|------|-------|-------|
| JSON | application/json | All standard API requests |
| FormData | multipart/form-data | File uploads (avatar, thumbnail) |

---

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
7. [Enrollment Requests](#enrollment-requests)
8. [Financing Options](#financing-options)
9. [Campuses](#campuses)
10. [Instructors](#instructors)
11. [Upload](#upload)
12. [Models](#models)
13. [Roles & Permissions](#roles--permissions)

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Missing or invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Duplicate resource |
| 500 | Internal Server Error |

---

## Common Error Response Format
```json
{
  "status": "error",
  "message": "Mô tả lỗi",
  "errors": [
    {
      "field": "email",
      "message": "Email không hợp lệ"
    }
  ]
}
```

---

## Auth

### Register - Đăng ký tài khoản mới
```
POST /auth/register
```
**Mô tả:** Tạo tài khoản người dùng mới, gửi email xác minh.

**Content-Type:** `application/json`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Email hợp lệ (sẽ được lowercase) |
| password | string | Yes | Mật khẩu (tối thiểu 8 ký tự, có chữ hoa, chữ thường, số) |
| firstName | string | Yes | Tên (tối đa 100 ký tự) |
| lastName | string | Yes | Họ (tối đa 100 ký tự) |
| phone | string | Yes | Số điện thoại VN (bắt đầu 03, 05, 07, 08, 09) |

**Example:**
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

### Login - Đăng nhập
```
POST /auth/login
```
**Mô tả:** Xác thực người dùng và trả về JWT access token.

**Content-Type:** `application/json`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Email đã đăng ký |
| password | string | Yes | Mật khẩu |

**Example:**
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

### Get Me - Lấy thông tin user hiện tại
```
GET /auth/me
```
**Mô tả:** Lấy thông tin profile của user đang đăng nhập.

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer {accessToken} | Yes |

**Response:** `200 OK`

### Logout - Đăng xuất
```
POST /auth/logout
```
**Mô tả:** Xóa refresh token khỏi cookie, vô hiệu hóa session.

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer {accessToken} | Yes |

**Response:** `200 OK`

### Refresh Token - Làm mới token
```
POST /auth/refresh
```
**Mô tả:** Sử dụng refresh token trong cookie để lấy access token mới.

**Cookies:** `refreshToken` (HTTP-only cookie)

**Response:** `200 OK`

### Forgot Password - Quên mật khẩu
```
POST /auth/forgot-password
```
**Mô tả:** Gửi email chứa link đặt lại mật khẩu.

**Content-Type:** `application/json`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Email đã đăng ký |

**Example:**
```json
{
  "email": "user@example.com"
}
```
**Response:** `200 OK`

### Reset Password - Đặt lại mật khẩu
```
POST /auth/reset-password/:resetToken
```
**Mô tả:** Đặt lại mật khẩu mới sử dụng token từ email.

**Headers:** Không cần auth token

**URL Params:**
| Param | Type | Description |
|-------|------|-------------|
| resetToken | string | Token từ email quên mật khẩu |

**Content-Type:** `application/json`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| newPassword | string | Yes | Mật khẩu mới |

**Example:**
```json
{
  "newPassword": "NewSecurePass123"
}
```
**Response:** `200 OK`

---

## Categories

### Get All Categories - Lấy danh sách danh mục
```
GET /categories
```
**Mô tả:** Lấy danh sách tất cả các danh mục khóa học với bộ lọc và phân trang.

**Content-Type:** `application/json`

**Headers:** Không cần authentication (public endpoint)

**Query Parameters:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| parentId | string (ObjectId) | No | - | Lọc theo danh mục cha |
| isActive | boolean | No | - | Lọc theo trạng thái hoạt động |
| sortBy | string | No | createdAt:desc | Trường sắp xếp |
| limit | number | No | 20 | Số item mỗi trang (1-100) |
| page | number | No | 1 | Số trang |

**Example Request:**
```
GET /categories?isActive=true&limit=10&page=1
```

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "docs": [...],
    "totalDocs": 25,
    "limit": 10,
    "page": 1,
    "totalPages": 3
  }
}
```

### Get Category Tree - Lấy cây danh mục
```
GET /categories/tree
```
**Mô tả:** Trả về cấu trúc phân cấp của tất cả danh mục (dạng cây).

**Headers:** Không cần authentication (public endpoint)

**Response:** `200 OK` - Trả về nested structure của categories

### Get Root Categories - Lấy danh mục gốc
```
GET /categories/roots
```
**Mô tả:** Trả về chỉ các danh mục cấp cao nhất (không có parentId).

**Headers:** Không cần authentication (public endpoint)

### Get Category by Slug - Lấy danh mục theo slug
```
GET /categories/slug/:slug
```
**Mô tả:** Tìm danh mục theo slug URL-friendly.

**Headers:** Không cần authentication (public endpoint)

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| slug | string | Yes | Slug của danh mục (VD: "programming") |

**Response:** `200 OK`

### Get Category by ID - Lấy danh mục theo ID
```
GET /categories/:categoryId
```
**Mô tả:** Lấy chi tiết một danh mục cụ thể.

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `getCategory`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| categoryId | string (ObjectId) | Yes | ID của danh mục |

### Get Child Categories - Lấy danh mục con
```
GET /categories/:categoryId/children
```
**Mô tả:** Lấy tất cả danh mục con của một danh mục.

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `getCategories`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| categoryId | string (ObjectId) | Yes | ID của danh mục cha |

### Create Category - Tạo danh mục mới
```
POST /categories
```
**Mô tả:** Tạo một danh mục khóa học mới (có thể là danh mục cha hoặc con).

**Content-Type:** `application/json`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `manageCategories`

**Request Body:**
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| name | string | Yes | - | Tên danh mục (tối đa 100 ký tự) |
| parentId | string (ObjectId) | No | null | ID danh mục cha (null = danh mục gốc) |
| icon | string | No | - | Icon identifier (tối đa 50 ký tự) |
| colorHex | string | No | - | Mã màu HEX (VD: #3B82F6) |
| description | string | No | - | Mô tả danh mục (tối đa 500 ký tự) |
| sortOrder | number | No | 0 | Thứ tự hiển thị |
| level | number | No | 0 | Cấp độ trong cây |
| isActive | boolean | No | true | Trạng thái hoạt động |

**Example:**
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
**Response:** `201 Created`

### Update Category - Cập nhật danh mục
```
PATCH /categories/:categoryId
```
**Mô tả:** Cập nhật thông tin một danh mục.

**Content-Type:** `application/json`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `manageCategories`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| categoryId | string (ObjectId) | Yes | ID của danh mục |

**Request Body:** Có thể cập nhật bất kỳ trường nào (trừ _id)

**Validation:** Cần ít nhất 1 trường để cập nhật

### Delete Category - Xóa danh mục
```
DELETE /categories/:categoryId
```
**Mô tả:** Xóa một danh mục khóa học.

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `manageCategories`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| categoryId | string (ObjectId) | Yes | ID của danh mục |

**Response:** `204 No Content`

---

---

## Courses

### Get All Courses - Lấy danh sách khóa học
```
GET /courses
```
**Mô tả:** Lấy danh sách khóa học với nhiều bộ lọc: danh mục, mức giá, loại đăng ký, level.

**Content-Type:** `application/json`

**Headers:** Không cần authentication (public endpoint)

**Query Parameters:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| categoryId | string (ObjectId) | No | - | Lọc theo danh mục |
| enrollmentType | string | No | - | `public`, `approval`, `invite_only` |
| level | string | No | - | `beginner`, `intermediate`, `advanced`, `expert` |
| isActive | boolean | No | - | Lọc theo trạng thái hoạt động |
| minPrice | number | No | - | Giá tối thiểu |
| maxPrice | number | No | - | Giá tối đa (phải >= minPrice) |
| search | string | No | - | Tìm kiếm trong tiêu đề (tối đa 100 ký tự) |
| sortBy | string | No | createdAt:desc | Trường sắp xếp |
| limit | number | No | 12 | Số item mỗi trang (1-100) |
| page | number | No | 1 | Số trang |
| populate | string | No | - | Populate related: `formats`, `categoryId` |

**Example Request:**
```
GET /courses?categoryId=64abc123&minPrice=5000000&level=beginner&populate=formats,categoryId&limit=10
```

### Get Course by Slug - Lấy khóa học theo slug
```
GET /courses/slug/:slug
```
**Mô tả:** Tìm khóa học theo slug URL-friendly.

**Headers:** Không cần authentication (public endpoint)

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| slug | string | Yes | Slug của khóa học |

### Get Course by ID - Lấy khóa học theo ID
```
GET /courses/:courseId
```
**Mô tả:** Lấy chi tiết một khóa học cụ thể.

**Headers:** Không cần authentication (public endpoint)

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| courseId | string (ObjectId) | Yes | ID của khóa học |

**Query:** `?populate=formats,categoryId` để populate thông tin liên quan

### Create Course - Tạo khóa học mới
```
POST /courses
```
**Mô tả:** Tạo một khóa học mới. Sau khi tạo, cần tạo CourseFormat để có thể đăng ký.

**Content-Type:** `application/json`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `managerCourses`

**Request Body:**
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| categoryId | string (ObjectId) | Yes | - | ID danh mục |
| title | string | Yes | - | Tiêu đề (3-255 ký tự) |
| description | string | No | "" | Mô tả khóa học |
| durationWeeks | number | Yes | - | Thời lượng (1-104 tuần) |
| basePrice | number | Yes | - | Giá cơ bản (VND) |
| enrollmentType | string | No | public | `public`, `approval`, `invite_only` |
| level | string | No | null | `beginner`, `intermediate`, `advanced`, `expert` |
| requiredSkills | array | No | [] | Kỹ năng yêu cầu |
| isActive | boolean | No | true | Trạng thái hoạt động |

**Example:**
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
**Response:** `201 Created`

### Update Course - Cập nhật khóa học
```
PATCH /courses/:courseId
```
**Mô tả:** Cập nhật thông tin khóa học.

**Content-Type:** `application/json`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `managerCourses`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| courseId | string (ObjectId) | Yes | ID của khóa học |

**Validation:** Cần ít nhất 1 trường để cập nhật

### Toggle Course Status - Bật/tắt khóa học
```
PATCH /courses/:courseId/toggle
```
**Mô tả:** Chuyển đổi trạng thái hoạt động của khóa học (active ↔ inactive).

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `managerCourses`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| courseId | string (ObjectId) | Yes | ID của khóa học |

### Delete Course - Xóa khóa học
```
DELETE /courses/:courseId
```
**Mô tả:** Xóa vĩnh viễn một khóa học và tất cả dữ liệu liên quan.

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `deleteCourse`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| courseId | string (ObjectId) | Yes | ID của khóa học |

**Response:** `204 No Content`

---

---

## Course Formats

### Get Course Formats - Lấy danh sách định dạng khóa học
```
GET /courses/:courseId/formats
```
**Mô tả:** Lấy tất cả định dạng học tập của một khóa học (online, oncampus, remote, hybrid).

**Content-Type:** `application/json`

**Headers:** Không cần authentication (public endpoint)

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| courseId | string (ObjectId) | Yes | ID của khóa học |

**Query Parameters:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| formatType | string | No | - | `oncampus`, `online`, `remote`, `hybrid` |
| isActive | boolean | No | - | Lọc theo trạng thái |

### Get Course Format by ID - Lấy định dạng theo ID
```
GET /courses/:courseId/formats/:courseFormatId
```
**Mô tả:** Lấy chi tiết một định dạng học tập cụ thể.

**Headers:** Không cần authentication (public endpoint)

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| courseId | string (ObjectId) | Yes | ID của khóa học |
| courseFormatId | string (ObjectId) | Yes | ID của định dạng |

### Create Course Format - Tạo định dạng khóa học
```
POST /courses/:courseId/formats
```
**Mô tả:** Tạo một định dạng học tập mới cho khóa học (VD: phiên bản online, phiên bản oncampus).

**Content-Type:** `application/json`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `managerCourseFormat`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| courseId | string (ObjectId) | Yes | ID của khóa học |

**Request Body (Online):**
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

**Request Body (On-campus):**
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

**Request Body (Remote):**
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

**Request Body (Hybrid):**
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

**Detail Schema Fields:**

| formatType | Required Fields |
|------------|-----------------|
| oncampus | campusId, hoursPerWeek, maxSeats |
| online | Không có field bắt buộc |
| remote | hoursPerWeek, maxSeats |
| hybrid | campusId, oncampusHours, remoteHours, maxSeats |

**Response:** `201 Created`

### Update Course Format - Cập nhật định dạng
```
PATCH /courses/:courseId/formats/:courseFormatId
```
**Mô tả:** Cập nhật thông tin định dạng học tập. Lưu ý: không cho phép đổi formatType sau khi tạo.

**Content-Type:** `application/json`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `managerCourseFormat`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| courseId | string (ObjectId) | Yes | ID của khóa học |
| courseFormatId | string (ObjectId) | Yes | ID của định dạng |

**Validation:** Cần ít nhất 1 trường để cập nhật

### Toggle Course Format - Bật/tắt định dạng
```
PATCH /courses/:courseId/formats/:courseFormatId/toggle
```
**Mô tả:** Chuyển đổi trạng thái hoạt động của định dạng học tập.

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `managerCourseFormat`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| courseId | string (ObjectId) | Yes | ID của khóa học |
| courseFormatId | string (ObjectId) | Yes | ID của định dạng |

### Delete Course Format - Xóa định dạng
```
DELETE /courses/:courseId/formats/:courseFormatId
```
**Mô tả:** Xóa vĩnh viễn một định dạng học tập.

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `deleteCourseFormat`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| courseId | string (ObjectId) | Yes | ID của khóa học |
| courseFormatId | string (ObjectId) | Yes | ID của định dạng |

**Response:** `204 No Content`

---

---

## Cohorts

### Get Cohorts - Lấy danh sách khóa (Nested)
```
GET /course-formats/:courseFormatId/cohorts
```
**Mô tả:** Lấy danh sách các khóa học (cohorts) của một định dạng khóa học. Mỗi cohort là một lớp học cụ thể với ngày bắt đầu/kết thúc.

**Content-Type:** `application/json`

**Headers:** Không cần authentication (public endpoint)

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| courseFormatId | string (ObjectId) | Yes | ID của định dạng khóa học |

**Query Parameters:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| status | string | No | - | `upcoming`, `ongoing`, `completed`, `cancelled` |
| sortBy | string | No | startDate:asc | Trường sắp xếp |
| limit | number | No | 20 | Số item mỗi trang (1-100) |
| page | number | No | 1 | Số trang |
| populate | string | No | - | `instructors`, `enrollmentCount` |

### Create Cohort - Tạo khóa học mới (Nested)
```
POST /course-formats/:courseFormatId/cohorts
```
**Mô tả:** Tạo một khóa học mới (lớp học) cho định dạng khóa học. VD: "WebDev 2024-A" bắt đầu ngày 01/03/2024.

**Content-Type:** `application/json`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `managerCohorts`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| courseFormatId | string (ObjectId) | Yes | ID của định dạng khóa học |

**Request Body:**
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| name | string | Yes | - | Tên khóa (VD: "WebDev 2024-A") (2-100 ký tự) |
| startDate | ISO Date | Yes | - | Ngày khai giảng (phải là tương lai) |
| endDate | ISO Date | Yes | - | Ngày kết thúc (phải sau startDate) |
| maxSeats | number | No | null | Số chỗ tối đa (null = không giới hạn) |

**Example:**
```json
{
  "name": "WebDev 2024-A",
  "startDate": "2024-03-01T00:00:00Z",
  "endDate": "2024-05-31T00:00:00Z",
  "maxSeats": 30
}
```
**Response:** `201 Created`

### Get Cohort by ID - Lấy khóa theo ID
```
GET /cohorts/:cohortId
```
**Mô tả:** Lấy chi tiết một khóa học cụ thể.

**Headers:** Không cần authentication (public endpoint)

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| cohortId | string (ObjectId) | Yes | ID của khóa học |

### Update Cohort - Cập nhật khóa
```
PATCH /cohorts/:cohortId
```
**Mô tả:** Cập nhật thông tin khóa học (tên, ngày, số chỗ).

**Content-Type:** `application/json`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `managerCohorts`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| cohortId | string (ObjectId) | Yes | ID của khóa học |

**Request Body:** Có thể cập nhật: name, startDate, endDate, maxSeats

**Validation:** Cần ít nhất 1 trường để cập nhật

### Update Cohort Status - Cập nhật trạng thái khóa
```
PATCH /cohorts/:cohortId/status
```
**Mô tả:** Thay đổi trạng thái của khóa học hoặc hủy khóa.

**Content-Type:** `application/json`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `managerCohorts`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| cohortId | string (ObjectId) | Yes | ID của khóa học |

**Request Body (Thay đổi trạng thái):**
```json
{
  "status": "ongoing"
}
```

**Request Body (Hủy khóa):**
```json
{
  "status": "cancelled",
  "cancelReason": "Insufficient enrollment"
}
```

**Status values:** `upcoming`, `ongoing`, `completed`, `cancelled`
- **cancelReason:** Bắt buộc khi status là `cancelled`

### Assign Instructor - Gán giảng viên
```
POST /cohorts/:cohortId/instructors
```
**Mô tả:** Gán một giảng viên vào khóa học.

**Content-Type:** `application/json`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `managerCohorts`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| cohortId | string (ObjectId) | Yes | ID của khóa học |

**Request Body:**
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| instructorId | string (ObjectId) | Yes | - | ID của giảng viên |
| role | string | No | assistant | `lead`, `assistant`, `guest` |

**Example:**
```json
{
  "instructorId": "64abc123...",
  "role": "lead"
}
```

### Remove Instructor - Xóa giảng viên khỏi khóa
```
DELETE /cohorts/:cohortId/instructors/:instructorId
```
**Mô tả:** Xóa một giảng viên khỏi khóa học.

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `managerCohorts`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| cohortId | string (ObjectId) | Yes | ID của khóa học |
| instructorId | string (ObjectId) | Yes | ID của giảng viên |

**Response:** `204 No Content`

### Delete Cohort - Xóa khóa học
```
DELETE /cohorts/:cohortId
```
**Mô tả:** Xóa vĩnh viễn một khóa học (chỉ admin mới có quyền).

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `admin`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| cohortId | string (ObjectId) | Yes | ID của khóa học |

**Response:** `204 No Content`

---

---

## Enrollments

### Enroll - Đăng ký khóa học (Public)
```
POST /enrollments
```
**Mô tả:** Đăng ký trực tiếp vào khóa học có enrollmentType là `public`. Không cần phê duyệt.

**Content-Type:** `application/json`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `enroll`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| cohortId | string (ObjectId) | Yes | ID của khóa học muốn đăng ký |

**Example:**
```json
{
  "cohortId": "64abc123..."
}
```
**Response:** `201 Created` - Tạo enrollment thành công

### Request Enrollment - Yêu cầu đăng ký (Approval)
```
POST /enrollments/request
```
**Mô tả:** Gửi yêu cầu đăng ký cho khóa học có enrollmentType là `approval`. Cần cung cấp lý do tham gia.

**Content-Type:** `application/json`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `enroll`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| cohortId | string (ObjectId) | Yes | ID của khóa học |
| motivation | string | Yes | Lý do muốn tham gia (50-2000 ký tự) |

**Example:**
```json
{
  "cohortId": "64abc123...",
  "motivation": "I want to learn web development to change my career from sales to tech..."
}
```
**Response:** `201 Created` - Tạo enrollment request, chờ phê duyệt

### Review Enrollment Request - Phê duyệt yêu cầu
```
PATCH /enrollments/request/:requestId/review
```
**Mô tả:** Phê duyệt hoặc từ chối yêu cầu đăng ký.

**Content-Type:** `application/json`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `managerEnrolls`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| requestId | string (ObjectId) | Yes | ID của enrollment request |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| action | string | Yes | `approved` hoặc `rejected` |
| rejectionReason | string | Conditional | Bắt buộc khi action = `rejected` (tối đa 1000 ký tự) |

**Example (Phê duyệt):**
```json
{
  "action": "approved",
  "rejectionReason": ""
}
```

**Example (Từ chối):**
```json
{
  "action": "rejected",
  "rejectionReason": "Không đáp ứng yêu cầu đầu vào"
}
```

### Get Pending Requests - Lấy danh sách yêu cầu chờ
```
GET /enrollments/requests
```
**Mô tả:** Lấy danh sách các yêu cầu đăng ký đang chờ phê duyệt.

**Content-Type:** `application/json`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `managerEnrolls`

**Query Parameters:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| cohortId | string (ObjectId) | No | - | Lọc theo khóa học |
| courseId | string (ObjectId) | No | - | Lọc theo khóa |
| status | string | No | pending | `pending`, `approved`, `rejected` |
| sortBy | string | No | createdAt:asc | Trường sắp xếp |
| limit | number | No | 20 | Số item mỗi trang (1-100) |
| page | number | No | 1 | Số trang |

### Send Invite - Gửi lời mời (Invite-Only)
```
POST /enrollments/invite
```
**Mô tả:** Gửi lời mời đăng ký cho khóa học có enrollmentType là `invite_only`. Email chứa link đăng ký với token.

**Content-Type:** `application/json`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `managerEnrolls`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| courseId | string (ObjectId) | Yes | ID của khóa học |
| email | string | Yes | Email người được mời (phải là email hợp lệ) |

**Example:**
```json
{
  "courseId": "64abc123...",
  "email": "student@example.com"
}
```
**Response:** `201 Created` - Gửi email invitation thành công

### Accept Invite - Chấp nhận lời mời
```
POST /enrollments/accept-invite
```
**Mô tả:** Chấp nhận lời mời đăng ký, ghi danh vào khóa học.

**Content-Type:** `application/json`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `enroll`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| token | string | Yes | Token từ email invitation (64 ký tự) |
| cohortId | string (ObjectId) | Yes | ID của khóa học muốn đăng ký |

**Example:**
```json
{
  "token": "abc123def456...",
  "cohortId": "64abc123..."
}
```
**Response:** `201 Created` - Đăng ký thành công

---

## Enrollment Requests

### Get All Enrollment Requests - Lấy danh sách yêu cầu
```
GET /enrollment-requests
```
**Mô tả:** Lấy danh sách tất cả yêu cầu đăng ký với nhiều bộ lọc (dùng cho quản lý và tracking).

**Content-Type:** `application/json`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `getEnrollmentRequests`

**Query Parameters:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| status | string | No | - | `pending`, `called`, `interviewed`, `approved`, `rejected` |
| courseId | string (ObjectId) | No | - | Lọc theo khóa học |
| cohortId | string (ObjectId) | No | - | Lọc theo khóa |
| assignedCounselor | string (ObjectId) | No | - | Lọc theo counselor được gán |
| sortBy | string | No | createdAt:asc | Trường sắp xếp |
| limit | number | No | 20 | Số item mỗi trang (1-100) |
| page | number | No | 1 | Số trang |

**Example Request:**
```
GET /enrollment-requests?status=pending&assignedCounselor=64abc123&limit=10
```

### Assign Counselor - Gán counselor
```
PATCH /enrollment-requests/:requestId/assign
```
**Mô tả:** Gán một counselor (tư vấn viên) phụ trách yêu cầu đăng ký.

**Content-Type:** `application/json`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `assignCounselor`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| requestId | string (ObjectId) | Yes | ID của enrollment request |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| counselorId | string (ObjectId) | Yes | ID của counselor được gán |

**Example:**
```json
{
  "counselorId": "64abc123..."
}
```

### Log Call - Ghi nhận cuộc gọi
```
POST /enrollment-requests/:requestId/call
```
**Mô tả:** Ghi nhận thông tin cuộc gọi tư vấn với người yêu cầu.

**Content-Type:** `application/json`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `logCall`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| requestId | string (ObjectId) | Yes | ID của enrollment request |

**Request Body:**
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| outcome | string | Yes | - | Kết quả: `reached`, `no_answer`, `rescheduled` |
| notes | string | No | "" | Ghi chú cuộc gọi (tối đa 1000 ký tự) |
| rescheduleAt | ISO Date | Conditional | - | Bắt buộc khi outcome = `rescheduled` |

**Example:**
```json
{
  "outcome": "reached",
  "notes": "Khách hàng quan tâm, cần gọi lại để tư vấn chi tiết hơn"
}
```

**Example (Reschedule):**
```json
{
  "outcome": "rescheduled",
  "notes": "Khách bận họp",
  "rescheduleAt": "2024-03-15T14:00:00Z"
}
```

### Log Interview - Ghi nhận phỏng vấn
```
POST /enrollment-requests/:requestId/interview
```
**Mô tả:** Ghi nhận thông tin phỏng vấn và đánh giá người yêu cầu.

**Content-Type:** `application/json`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `logInterview`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| requestId | string (ObjectId) | Yes | ID của enrollment request |

**Request Body:**
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| recommendation | string | Yes | - | Đánh giá: `approve`, `reject`, `consider` |
| notes | string | No | "" | Ghi chú phỏng vấn (tối đa 2000 ký tự) |
| score | number | No | null | Điểm phỏng vấn (0-10) |

**Example:**
```json
{
  "recommendation": "approve",
  "notes": "Ứng viên có nền tảng tốt, motivated để học",
  "score": 8
}
```

### Review Enrollment Request - Phê duyệt cuối cùng
```
PATCH /enrollment-requests/:requestId/review
```
**Mô tả:** Phê duyệt hoặc từ chối yêu cầu đăng ký (sau khi đã gọi điện và phỏng vấn).

**Content-Type:** `application/json`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `reviewEnrollmentRequest`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| requestId | string (ObjectId) | Yes | ID của enrollment request |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| action | string | Yes | `approved` hoặc `rejected` |
| rejectionReason | string | Conditional | Bắt buộc khi action = `rejected` (tối đa 1000 ký tự) |

**Example:**
```json
{
  "action": "approved",
  "rejectionReason": ""
}
```

---

---

## Financing Options

### Get Financing by Enrollment - Lấy phương thức thanh toán
```
GET /enrollments/:enrollmentId/financing
```
**Mô tả:** Lấy thông tin phương thức thanh toán của một enrollment.

**Content-Type:** `application/json`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `getFinancing` (manager) hoặc `getMyFinancing` (student xem own financing)

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| enrollmentId | string (ObjectId) | Yes | ID của enrollment |

### Create Financing Option - Tạo phương thức thanh toán
```
POST /enrollments/:enrollmentId/financing
```
**Mô tả:** Tạo phương thức thanh toán cho enrollment (full, installment, scholarship, ISA).

**Content-Type:** `application/json`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `managerFinancing`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| enrollmentId | string (ObjectId) | Yes | ID của enrollment |

**Request Body (Full Payment):**
```json
{
  "type": "full",
  "totalAmount": 15000000
}
```

**Request Body (Installment - Trả góp):**
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
**Validation:** Tổng các installment phải bằng totalAmount, tối thiểu 2 đợt.

**Request Body (Scholarship - Học bổng):**
```json
{
  "type": "scholarship",
  "totalAmount": 15000000,
  "scholarshipCode": "SCHOOL2024",
  "discountAmount": 5000000,
  "discountPercentage": 33.33
}
```

**Request Body (ISA - Income Share Agreement):**
```json
{
  "type": "isa",
  "totalAmount": 15000000,
  "isaPercentage": 17,
  "isaDurationMonths": 24,
  "isaStartDate": "2024-06-01T00:00:00Z"
}
```

**Common Fields:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | Yes | `full`, `installment`, `scholarship`, `isa` |
| totalAmount | number | Yes | Tổng số tiền (VND) |
| provider | string | No | Nhà cung cấp thanh toán |
| notes | string | No | Ghi chú (tối đa 1000 ký tự) |

**Response:** `201 Created`

### Get Financing Option - Lấy chi tiết financing
```
GET /financing/:financingId
```
**Mô tả:** Lấy chi tiết một phương thức thanh toán cụ thể.

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `getFinancing` hoặc `getMyFinancing`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| financingId | string (ObjectId) | Yes | ID của financing option |

### Record Payment - Ghi nhận thanh toán
```
POST /financing/:financingId/payment
```
**Mô tả:** Ghi nhận một khoản thanh toán cho financing option.

**Content-Type:** `application/json`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `managerFinancing`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| financingId | string (ObjectId) | Yes | ID của financing option |

**Request Body:**
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| amount | number | Yes | - | Số tiền thanh toán (>= 1) |
| installmentId | string (ObjectId) | No | null | ID của đợt thanh toán (nếu là installment) |
| notes | string | No | "" | Ghi chú (tối đa 500 ký tự) |

**Example:**
```json
{
  "amount": 5000000,
  "installmentId": "64abc123...",
  "notes": "Payment via bank transfer"
}
```

### Update ISA - Cập nhật ISA
```
PATCH /financing/:financingId/isa
```
**Mô tả:** Cập nhật thông tin ISA (Income Share Agreement).

**Content-Type:** `application/json`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `managerFinancing`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| financingId | string (ObjectId) | Yes | ID của financing option |

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| isaStartDate | ISO Date | Yes | Ngày bắt đầu ISA |
| isaPercentage | number | No | Phần trăm chia sẻ thu nhập (0-100) |
| isaDurationMonths | number | No | Thời hạn ISA (tháng) |

**Validation:** Cần ít nhất 1 trường để cập nhật

### Cancel Financing - Hủy phương thức thanh toán
```
PATCH /financing/:financingId/cancel
```
**Mô tả:** Hủy phương thức thanh toán cho enrollment.

**Content-Type:** `application/json`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `cancelFinancing`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| financingId | string (ObjectId) | Yes | ID của financing option |

**Request Body:**
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| notes | string | No | "" | Lý do hủy (tối đa 500 ký tự) |

---

---

## Campuses

### Get All Campuses - Lấy danh sách campus
```
GET /campuses
```
**Mô tả:** Lấy danh sách tất cả các campus (cơ sở đào tạo) với bộ lọc.

**Content-Type:** `application/json`

**Headers:** Không cần authentication (public endpoint)

**Query Parameters:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| isActive | boolean | No | - | Lọc theo trạng thái hoạt động |
| city | string | No | - | Lọc theo thành phố |
| sortBy | string | No | name:asc | Trường sắp xếp: `name:asc`, `city:asc`, `createdAt:desc` |
| limit | number | No | 20 | Số item mỗi trang (1-100) |
| page | number | No | 1 | Số trang |
| populate | string | No | - | Populate: `instructorCount` |

### Get Campus by ID - Lấy campus theo ID
```
GET /campuses/:campusId
```
**Mô tả:** Lấy chi tiết một campus cụ thể.

**Headers:** Không cần authentication (public endpoint)

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| campusId | string (ObjectId) | Yes | ID của campus |

### Create Campus - Tạo campus mới
```
POST /campuses
```
**Mô tả:** Tạo một campus (cơ sở đào tạo) mới.

**Content-Type:** `application/json`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `managerCampus`

**Request Body:**
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| name | string | Yes | - | Tên campus (2-100 ký tự) |
| city | string | Yes | - | Thành phố |
| country | string | No | Vietnam | Quốc gia |
| timezone | string | No | Asia/Ho_Chi_Minh | Múi giờ |
| address | string | No | "" | Địa chỉ chi tiết |
| phone | string | No | "" | Số điện thoại |
| email | string | No | "" | Email campus |
| isActive | boolean | No | true | Trạng thái hoạt động |

**Example:**
```json
{
  "name": "Hanoi Campus",
  "city": "Hanoi",
  "country": "Vietnam",
  "timezone": "Asia/Ho_Chi_Minh",
  "address": "123 ABC Street, Ba Dinh District",
  "phone": "02412345678",
  "email": "hanoi@school.edu.vn"
}
```
**Response:** `201 Created`

### Update Campus - Cập nhật campus
```
PATCH /campuses/:campusId
```
**Mô tả:** Cập nhật thông tin campus.

**Content-Type:** `application/json`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `managerCampus`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| campusId | string (ObjectId) | Yes | ID của campus |

**Validation:** Cần ít nhất 1 trường để cập nhật

### Toggle Campus - Bật/tắt campus
```
PATCH /campuses/:campusId/toggle
```
**Mô tả:** Chuyển đổi trạng thái hoạt động của campus.

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `managerCampus`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| campusId | string (ObjectId) | Yes | ID của campus |

### Delete Campus - Xóa campus
```
DELETE /campuses/:campusId
```
**Mô tả:** Xóa vĩnh viễn một campus.

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `managerCampus`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| campusId | string (ObjectId) | Yes | ID của campus |

**Response:** `204 No Content`

---

---

## Instructors

### Get My Profile - Lấy profile giảng viên của tôi
```
GET /instructors/me
```
**Mô tả:** Lấy thông tin profile giảng viên của user đang đăng nhập (phải là instructor).

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `instructorGetProfile`

### Get All Instructors - Lấy danh sách giảng viên
```
GET /instructors
```
**Mô tả:** Lấy danh sách tất cả giảng viên với bộ lọc.

**Content-Type:** `application/json`

**Headers:** Không cần authentication (public endpoint)

**Query Parameters:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| campusId | string (ObjectId) | No | - | Lọc theo campus |
| isActive | boolean | No | - | Lọc theo trạng thái hoạt động |
| search | string | No | - | Tìm kiếm theo tên (tối đa 100 ký tự) |
| sortBy | string | No | createdAt:desc | Trường sắp xếp |
| limit | number | No | 20 | Số item mỗi trang (1-100) |
| page | number | No | 1 | Số trang |
| populate | string | No | - | Populate: `userId`, `campusId`, `cohorts` |

### Get Instructor by ID - Lấy giảng viên theo ID
```
GET /instructors/:instructorId
```
**Mô tả:** Lấy chi tiết một giảng viên cụ thể.

**Headers:** Không cần authentication (public endpoint)

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| instructorId | string (ObjectId) | Yes | ID của giảng viên |

### Create Instructor - Tạo giảng viên mới
```
POST /instructors
```
**Mô tả:** Tạo hồ sơ giảng viên cho một user đã có tài khoản.

**Content-Type:** `application/json`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `managerInstructor`

**Request Body:**
| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| userId | string (ObjectId) | Yes | - | ID của user (đã có account) |
| campusId | string (ObjectId) | Yes | - | ID của campus giảng viên thuộc về |
| bio | string | No | "" | Tiểu sử (tối đa 2000 ký tự) |
| linkedinUrl | string | No | "" | URL LinkedIn (phải là URI hợp lệ) |
| expertise | array | No | [] | Danh sách chuyên môn (tối đa 20 phần tử, mỗi phần tử tối đa 50 ký tự) |
| avatarUrl | string | No | "" | URL avatar (phải là URI hợp lệ) |
| isActive | boolean | No | true | Trạng thái hoạt động |

**Example:**
```json
{
  "userId": "64abc123...",
  "campusId": "64abc123...",
  "bio": "Senior web developer with 10 years experience in full-stack development",
  "linkedinUrl": "https://linkedin.com/in/johndoe",
  "expertise": ["React", "Node.js", "MongoDB", "TypeScript"]
}
```
**Response:** `201 Created`

### Update Instructor - Cập nhật giảng viên
```
PATCH /instructors/:instructorId
```
**Mô tả:** Cập nhật thông tin giảng viên.

**Content-Type:** `application/json`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Content-Type | application/json | Yes |
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `updateInstructor`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| instructorId | string (ObjectId) | Yes | ID của giảng viên |

**Validation:** Cần ít nhất 1 trường để cập nhật

### Toggle Instructor - Bật/tắt giảng viên
```
PATCH /instructors/:instructorId/toggle
```
**Mô tả:** Chuyển đổi trạng thái hoạt động của giảng viên.

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `managerInstructor`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| instructorId | string (ObjectId) | Yes | ID của giảng viên |

### Delete Instructor - Xóa giảng viên
```
DELETE /instructors/:instructorId
```
**Mô tả:** Xóa vĩnh viễn hồ sơ giảng viên.

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `managerInstructor`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| instructorId | string (ObjectId) | Yes | ID của giảng viên |

**Response:** `204 No Content`

---

---

## Upload

### Upload User Avatar - Tải lên avatar người dùng
```
PATCH /upload/users/:userId/avatar
```
**Mô tả:** Tải lên hoặc cập nhật avatar cho tài khoản người dùng.

**Content-Type:** `multipart/form-data`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer {accessToken} | Yes |

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| userId | string (ObjectId) | Yes | ID của user |

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | Ảnh avatar (định dạng: jpg, jpeg, png, webp, gif) |

**Constraints:**
- Kích thước tối đa: 5MB
- Định dạng: image/*

**Response:** `200 OK`
```json
{
  "status": "success",
  "data": {
    "url": "https://res.cloudinary.com/.../avatar.jpg"
  }
}
```

### Upload Instructor Avatar - Tải lên avatar giảng viên
```
PATCH /upload/instructors/:instructorId/avatar
```
**Mô tả:** Tải lên hoặc cập nhật avatar cho hồ sơ giảng viên.

**Content-Type:** `multipart/form-data`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `uploadInstructorAvatar`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| instructorId | string (ObjectId) | Yes | ID của giảng viên |

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | Ảnh avatar (định dạng: jpg, jpeg, png, webp, gif) |

**Constraints:**
- Kích thước tối đa: 5MB
- Định dạng: image/*

**Response:** `200 OK`

### Upload Course Thumbnail - Tải lên thumbnail khóa học
```
PATCH /upload/courses/:courseId/thumbnail
```
**Mô tả:** Tải lên hoặc cập nhật thumbnail cho khóa học.

**Content-Type:** `multipart/form-data`

**Headers:**
| Header | Value | Required |
|--------|-------|----------|
| Authorization | Bearer {accessToken} | Yes |

**Yêu cầu quyền:** `uploadThumbnail`

**URL Params:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| courseId | string (ObjectId) | Yes | ID của khóa học |

**Form Data:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | File | Yes | Ảnh thumbnail (định dạng: jpg, jpeg, png, webp, gif) |

**Constraints:**
- Kích thước tối đa: 5MB
- Định dạng: image/*

**Response:** `200 OK`

---

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
  "assignedCounselor": "64abc123...",
  "calls": [
    {
      "_id": "...",
      "outcome": "reached",
      "notes": "Gọi thành công",
      "rescheduleAt": null,
      "createdAt": "2024-02-10T10:00:00Z"
    }
  ],
  "interviews": [
    {
      "_id": "...",
      "recommendation": "approve",
      "notes": "Ứng viên tốt",
      "score": 8,
      "createdAt": "2024-02-15T14:00:00Z"
    }
  ],
  "reviewedBy": "64abc123...",
  "reviewedAt": null,
  "createdAt": "2024-02-01T00:00:00Z"
}
```
**status:** `pending`, `called`, `interviewed`, `approved`, `rejected`
**call.outcome:** `reached`, `no_answer`, `rescheduled`
**interview.recommendation:** `approve`, `reject`, `consider`

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

### Role Hierarchy
| Role Type | Description |
|------------|-------------|
| student | Học viên - có thể đăng ký khóa học, xem tài chính của mình |
| instructor | Giảng viên - xem profile, upload avatar, xem financing |
| admin | Quản trị viên - toàn quyền trên hệ thống |

### Permission Matrix

| Role | Permissions |
|------|-------------|
| student | `enroll`, `getMyFinancing`, `cancelFinancing` |
| instructor | `instructorGetProfile`, `uploadInstructorAvatar`, `getFinancing` |
| managerCourses | `managerCourses`, `deleteCourse`, `uploadThumbnail` |
| managerCohorts | `managerCohorts`, `assignInstructor` |
| managerEnrolls | `managerEnrolls`, `sendInvite`, `reviewEnrollmentRequest` |
| managerFinancing | `managerFinancing`, `recordPayment` |
| managerCampus | `managerCampus` |
| managerInstructor | `managerInstructor` |
| managerCategory | `manageCategories` |
| getCategory | `getCategory` |
| getCategories | `getCategories` |
| updateInstructor | `updateInstructor` |
| deleteCourseFormat | `deleteCourseFormat` |
| getEnrollmentRequests | `getEnrollmentRequests` |
| assignCounselor | `assignCounselor` |
| logCall | `logCall` |
| logInterview | `logInterview` |
| admin | All permissions |

---

## Common Response Format

### Success Response
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

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email không hợp lệ"
    }
  ]
}
```

---

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success - Yêu cầu thành công |
| 201 | Created - Tạo mới thành công |
| 204 | No Content - Xóa thành công (không có response body) |
| 400 | Bad Request - Lỗi validation |
| 401 | Unauthorized - Chưa đăng nhập hoặc token hết hạn |
| 403 | Forbidden - Không có quyền truy cập |
| 404 | Not Found - Resource không tồn tại |
| 409 | Conflict - Resource đã tồn tại |
| 500 | Internal Server Error - Lỗi server |

---

## Rate Limiting

| Environment | Limit |
|-------------|-------|
| Production | Auth endpoints: 100 requests / 15 minutes |
| Development | No rate limiting |

---

## Environment Variables

```env
# Server
NODE_ENV=development
PORT=3000

# Database
MONGODB_URL=mongodb://localhost:27017/elearning

# JWT Authentication
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_RESET_PASSWORD_EXPIRES_IN=15m
JWT_EMAIL_VERIFY_EXPIRES_IN=15m

# Cloudinary (File Upload)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (Mailjet)
MAILJET_API_KEY=your-api-key
MAILJET_API_SECRET=your-api-secret
MAILJET_FROM_EMAIL=noreply@example.com
MAILJET_FROM_NAME=E-Learning
```

---

## Webhook Events (Future)

| Event | Description |
|-------|-------------|
| enrollment.created | Khi học viên đăng ký thành công |
| enrollment.approved | Khi yêu cầu đăng ký được phê duyệt |
| enrollment.rejected | Khi yêu cầu đăng ký bị từ chối |
| payment.recorded | Khi thanh toán được ghi nhận |
| cohort.started | Khi khóa học bắt đầu |
| cohort.completed | Khi khóa học kết thúc |
