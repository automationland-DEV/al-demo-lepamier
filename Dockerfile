FROM node:20-alpine

# Thư mục làm việc trong container
WORKDIR /app

# Copy package.json và package-lock.json (nếu có)
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Expose port 4433 ra cho container
EXPOSE 4433

# Chạy Vite server, cấu hình host 0.0.0.0 để cho phép truy cập từ bên ngoài container và chạy ở port 4433
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "4433"]
