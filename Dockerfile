# 使用官方 Node.js 18 映像作為基礎
FROM node:18-slim

# 安裝 Playwright 所需的系統依賴
RUN apt-get update && apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libdbus-1-3 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    libatspi2.0-0 \
    libxshmfence1 \
    && rm -rf /var/lib/apt/lists/*

# 設定工作目錄
WORKDIR /app

# 複製 package 檔案
COPY backend/package*.json ./

# 安裝依賴（包含 Playwright）
RUN npm install

# 複製後端源代碼
COPY backend/ ./

# 建置 TypeScript
RUN npm run build

# 暴露端口
EXPOSE 3001

# 啟動應用
CMD ["npm", "start"]

