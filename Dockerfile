FROM debian:buster-slim

# Cập nhật hệ thống và cài đặt các gói cần thiết
RUN apt-get update && apt-get install -y curl gnupg

# Cài đặt Node.js và npm từ NodeSource repository (Debian)
RUN curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
RUN apt-get install -y nodejs

# Kiểm tra Node.js và npm đã cài đặt
RUN node -v
RUN npm -v

# Cài đặt ffmpeg
RUN apt-get install -y ffmpeg

# Kiểm tra ffmpeg
RUN ffmpeg -version

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]