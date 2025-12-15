# Shopee2Multi 安裝與設定指南

## 前置需求

- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+ (可選，目前未使用但預留)
- npm 或 yarn

## 安裝步驟

### 1. 安裝後端依賴

```bash
cd backend
npm install
```

### 2. 安裝前端依賴

```bash
cd frontend
npm install
```

### 3. 設定資料庫

建立 PostgreSQL 資料庫：

```sql
CREATE DATABASE shopee2multi;
```

### 4. 設定環境變數

#### 後端環境變數

複製 `.env.example` 並修改：

```bash
cd backend
cp .env.example .env
```

編輯 `backend/.env`：

```env
PORT=3001
NODE_ENV=development

DATABASE_URL=postgresql://user:password@localhost:5432/shopee2multi
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shopee2multi
DB_USER=your_db_user
DB_PASSWORD=your_db_password

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:5173
```

#### 前端環境變數（可選）

```bash
cd frontend
cp .env.example .env
```

### 5. 執行資料庫遷移

```bash
cd backend
npm run migrate
```

### 6. 安裝 Playwright 瀏覽器

Playwright 需要下載瀏覽器：

```bash
cd backend
npx playwright install chromium
```

## 啟動服務

### 開發模式

#### 終端 1 - 後端服務

```bash
cd backend
npm run dev
```

後端將在 http://localhost:3001 啟動

#### 終端 2 - 前端服務

```bash
cd frontend
npm run dev
```

前端將在 http://localhost:5173 啟動

### 生產模式

#### 建置前端

```bash
cd frontend
npm run build
```

#### 建置後端

```bash
cd backend
npm run build
npm start
```

## 測試

1. 開啟瀏覽器訪問 http://localhost:5173
2. 註冊新帳號
3. 登入後進入「轉檔工具」頁面
4. 貼上蝦皮商品連結並選擇目標平台
5. 點擊「開始轉檔」並等待完成
6. 下載生成的 Excel 檔案

## 常見問題

### 資料庫連線失敗

- 確認 PostgreSQL 服務正在運行
- 檢查 `.env` 中的資料庫連線資訊
- 確認資料庫使用者權限

### Playwright 錯誤

- 執行 `npx playwright install chromium`
- 確認系統有足夠的記憶體和磁碟空間

### 轉檔失敗

- 檢查蝦皮商品連結是否有效
- 確認網路連線正常
- 查看後端日誌了解詳細錯誤

## 專案結構

```
Shopee2Multi/
├── backend/              # 後端 API
│   ├── src/
│   │   ├── db/          # 資料庫相關
│   │   ├── models/      # 資料模型
│   │   ├── routes/      # API 路由
│   │   ├── services/    # 業務邏輯
│   │   └── middleware/  # 中介軟體
│   └── uploads/         # 生成的 Excel 檔案
├── frontend/            # 前端應用
│   └── src/
│       ├── components/  # React 元件
│       ├── pages/      # 頁面元件
│       ├── store/       # 狀態管理
│       └── api/         # API 客戶端
└── docs/                # 文件資料
```

## 下一步

- 閱讀 [README.md](./README.md) 了解專案概覽
- 查看 [RFP 文件](./提案請求書%20(Request%20For%20Proposal,%20RFP).md) 了解完整需求
- 開始開發新功能或優化現有功能
