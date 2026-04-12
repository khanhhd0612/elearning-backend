# E-Learning Platform Backend

RESTful API backend cho nền tảng E-Learning, hỗ trợ quản lý khóa học, enrollment, và financing.

## Quick Start

### Yêu cầu

- **Node.js** >= 18.x
- **MongoDB** >= 6.x
- **Redis** >= 7.x (optional, cho caching)

### Cài đặt

```bash
# Clone và cài dependencies
npm install

# Tạo file môi trường
cp .env.example .env

# Chỉnh sửa .env với các giá trị thực tế
```

### Chạy server

```bash
# Development
npm run dev

# Production
npm start
```

Server chạy mặc định tại `http://localhost:4000`

---

## Cấu trúc dự án

```
backend/
├── src/
│   ├── config/         # Cấu hình (database, passport, cors, redis)
│   ├── controllers/     # Xử lý request/response
│   ├── cronjob/        # Cron jobs tự động
│   ├── middlewares/    # Auth, validation, rate limit, upload
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── templates/      # Email templates
│   ├── utils/          # Helpers (ApiError, catchAsync, logger)
│   └── validations/    # Joi validation schemas
├── server.js           # Entry point
├── app.js              # Express app setup
└── .env.example        # Environment template
```

---

## Authentication

API sử dụng **JWT Bearer Token** với refresh token trong cookie.

### Cách sử dụng:

```bash
# Header cho request cần auth
curl -H "Authorization: Bearer <accessToken>" \
     http://localhost:4000/v1/auth/me
```

### Token flow:
1. `POST /auth/login` → Nhận `accessToken` + `refreshToken` cookie
2. Access token hết hạn sau **15 phút**
3. `POST /auth/refresh` → Dùng cookie để lấy token mới

---

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4000
CMD ["npm", "start"]
```

---

## Testing

```bash
# Chạy tests
npm test

# Với coverage
npm run test:coverage
```

---

## License

MIT
