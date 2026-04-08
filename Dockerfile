# dùng Node version
FROM node:20-alpine

# tạo thư mục app trong container
WORKDIR /app

# copy package trước (tối ưu cache)
COPY package*.json ./

# cài dependencies
RUN npm install

# copy toàn bộ code
COPY . .

# mở port
EXPOSE 3000

# chạy app
CMD ["npm", "start"]
