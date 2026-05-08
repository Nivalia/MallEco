# 第一阶段：构建阶段
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装所有依赖（包括开发依赖）
RUN npm install

# 复制应用代码
COPY . .

# 构建应用
RUN npm run build

# 第二阶段：生产阶段
FROM node:20-alpine AS production

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=9000
ENV TZ=Asia/Shanghai

# 创建非root用户
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# 设置工作目录
WORKDIR /app

# 复制构建产物和package.json
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/init-database.js ./
COPY --from=builder /app/src/config ./src/config

# 安装生产依赖
RUN npm install --production --ignore-scripts && \
    npm cache clean --force

# 配置文件权限
RUN chown -R nestjs:nodejs /app

# 切换到非root用户
USER nestjs

# 暴露端口
EXPOSE ${PORT}

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/health || exit 1

# 启动应用，先初始化数据库再启动服务
CMD sh -c "node init-database.js && node dist/src/main"

# 标签信息
LABEL maintainer="MallEco Team"
LABEL version="1.0.0"
LABEL description="MallEco API Service"
