#FROM npm:latest
#WORKDIR /ai-video-monitor-platform-vue3
#COPY . .
#EXPOSE 81
#RUN npm install
#CMD ["npm run dev"]
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 lock 文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

EXPOSE 81

# 运行应用
CMD npm run dev