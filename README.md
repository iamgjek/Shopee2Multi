# Shopee2Multi - 電商跨平台自動化轉檔 SaaS 平台

## 專案簡介

Shopee2Multi 是一個專為台灣小型電商賣家設計的輕量級 SaaS 工具，核心功能為「一鍵將蝦皮商品轉換為支援其他電商平台（momo、PChome、Coupang 等）的 SKU Excel 檔案」。

## 專案結構

```
Shopee2Multi/
├── frontend/          # React + Vite 前端應用
├── backend/           # Node.js + Express 後端 API
├── shared/            # 共用類型定義和工具
└── docs/              # 文件資料（現有）
```

## 技術棧

### 前端
- React 18
- Vite
- Ant Design
- TypeScript
- Redux Toolkit

### 後端
- Node.js
- Express
- TypeScript
- PostgreSQL
- Redis
- Playwright (網頁解析)

## 快速開始

### 環境需求
- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+ (可選，目前未使用但預留)
- npm 或 yarn

### 安裝與執行

#### 步驟 1: 安裝依賴套件

```bash
# 安裝後端依賴
cd backend
npm install

# 安裝前端依賴
cd ../frontend
npm install
```

#### 步驟 2: 設定資料庫

建立 PostgreSQL 資料庫：

```bash
# 使用 psql 或任何 PostgreSQL 客戶端
psql -U postgres

# 在 PostgreSQL 中執行
CREATE DATABASE shopee2multi;
\q
```

#### 步驟 3: 設定環境變數

在 `backend` 目錄下建立 `.env` 檔案：

```bash
cd backend
touch .env
```

編輯 `backend/.env` 檔案，加入以下內容：

```env
# 伺服器設定
PORT=3001
NODE_ENV=development

# 資料庫設定
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shopee2multi
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT 設定
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS 設定
CORS_ORIGIN=http://localhost:5173
```

**重要**: 請將 `your_db_user` 和 `your_db_password` 替換為您的實際資料庫使用者名稱和密碼。

#### 步驟 4: 安裝 Playwright 瀏覽器

Playwright 需要下載瀏覽器才能運作：

```bash
cd backend
npx playwright install chromium
```

#### 步驟 5: 執行資料庫遷移

```bash
cd backend
npm run migrate
```

如果成功，您應該會看到 `✅ Database migration completed` 訊息。

#### 步驟 6: 啟動服務

開啟兩個終端視窗：

**終端 1 - 啟動後端服務：**

```bash
cd backend
npm run dev
```

後端將在 http://localhost:3001 啟動，您應該會看到：
- `✅ Database connected successfully`
- `🚀 Server running on http://localhost:3001`

**終端 2 - 啟動前端服務：**

```bash
cd frontend
npm run dev
```

前端將在 http://localhost:5173 啟動，Vite 會自動代理 `/api` 請求到後端。

#### 步驟 7: 測試應用程式

1. 開啟瀏覽器訪問 http://localhost:5173
2. 註冊新帳號
3. 登入後進入「轉檔工具」頁面
4. 貼上蝦皮商品連結並選擇目標平台
5. 點擊「開始轉檔」並等待完成
6. 下載生成的 Excel 檔案

### 常見問題

**資料庫連線失敗**
- 確認 PostgreSQL 服務正在運行：`pg_isready` 或 `brew services list` (macOS)
- 檢查 `.env` 中的資料庫連線資訊是否正確
- 確認資料庫使用者有足夠權限

**Playwright 錯誤**
- 執行 `npx playwright install chromium`
- 確認系統有足夠的記憶體和磁碟空間

**轉檔失敗**
- 檢查蝦皮商品連結是否有效
- 確認網路連線正常
- 查看後端終端視窗的日誌了解詳細錯誤

**端口已被佔用**
- 後端預設使用 3001 端口，前端使用 5173 端口
- 如需更改，修改 `.env` 中的 `PORT` 或 `vite.config.ts` 中的 `server.port`

## 開發階段

- **MVP Phase**: 蝦皮 → momo/PChome 轉檔
- **Phase 2**: Coupang/Yahoo 支援、Chrome 擴充功能
- **Phase 3**: API 開發、進階功能

## 授權

版權所有 © 2025 Shopee2Multi
