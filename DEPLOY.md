# Shopee2Multi 部署指南

本指南將幫助您將 Shopee2Multi 部署到免費的雲端平台。

## 🚀 快速開始（5 分鐘部署）

### Railway + Vercel 快速部署

1. **準備代碼**：確保代碼已推送到 GitHub
2. **部署後端到 Railway**：
   - 登入 Railway → New Project → Deploy from GitHub
   - Root Directory: `backend`
   - 添加 PostgreSQL 資料庫
   - 設定環境變數（見下方）
3. **執行資料庫遷移**：在 Railway 終端執行 `npm run migrate`
4. **部署前端到 Vercel**：
   - 登入 Vercel → Add New Project
   - Root Directory: `frontend`
   - 環境變數：`VITE_API_URL=https://your-backend.railway.app`
5. **更新 CORS**：在 Railway 後端更新 `CORS_ORIGIN` 為 Vercel 前端 URL

**完成！** 🎉

---

## 📋 部署前檢查清單

- [ ] 代碼已推送到 GitHub
- [ ] 後端 `.env` 配置正確
- [ ] 前端 API 客戶端已更新（支援環境變數）
- [ ] Playwright 安裝腳本已添加（`postinstall`）
- [ ] 資料庫遷移腳本可用

## 推薦部署方案

### 方案 1: Railway（推薦）⭐
- **優點**: 一站式部署，內建 PostgreSQL，支援 Playwright
- **免費額度**: $5/月免費額度
- **適合**: 全棧應用快速部署

### 方案 2: Render
- **優點**: 免費 PostgreSQL，支援 Node.js
- **免費額度**: 免費層可用（有休眠限制）
- **適合**: 預算有限的小型項目

### 方案 3: Vercel (前端) + Railway/Render (後端)
- **優點**: Vercel 前端部署快速，後端獨立管理
- **免費額度**: Vercel 免費，後端需選擇平台
- **適合**: 需要最佳前端性能

---

## 方案 1: Railway 部署（推薦）

### 前置需求
- GitHub 帳號
- Railway 帳號（使用 GitHub 登入）
- 代碼已推送到 GitHub 倉庫

### 步驟 1: 準備代碼

確保所有代碼已提交並推送到 GitHub 倉庫：

```bash
git add .
git commit -m "準備部署"
git push origin main
```

### 步驟 2: 創建 Railway 專案

1. 登入 [Railway](https://railway.app)
2. 點擊 "New Project" → "Deploy from GitHub repo"
3. 選擇您的倉庫
4. Railway 會自動偵測並開始部署

### 步驟 3: 設定後端服務

1. 在 Railway 專案中，點擊服務
2. 進入 Settings → Root Directory，設為 `backend`
3. 進入 Settings → Deploy，確認：
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

### 步驟 4: 添加 PostgreSQL 資料庫

1. 在 Railway 專案中點擊 "New" → "Database" → "PostgreSQL"
2. Railway 會自動創建資料庫
3. 點擊資料庫服務，進入 Variables 標籤
4. 複製資料庫連接資訊（`PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`）

### 步驟 5: 設定後端環境變數

在後端服務的 Variables 標籤中添加：

```env
NODE_ENV=production
PORT=3001
DB_HOST=${PGHOST}
DB_PORT=${PGPORT}
DB_NAME=${PGDATABASE}
DB_USER=${PGUSER}
DB_PASSWORD=${PGPASSWORD}
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

**重要**: 
- `JWT_SECRET` 請使用強隨機字串（可使用 `openssl rand -base64 32` 生成）
- `CORS_ORIGIN` 稍後部署前端後再更新

### 步驟 6: 執行資料庫遷移

在 Railway 後端服務中：
1. 進入 Deployments 標籤
2. 點擊最新部署旁邊的 "..." → "View Logs"
3. 或者進入服務的 Settings → Service → 打開終端
4. 執行：`npm run migrate`

如果成功，您會看到 `✅ Database migration completed` 訊息。

### 步驟 7: 部署前端

#### 選項 A: 使用 Vercel（推薦）⭐

1. 登入 [Vercel](https://vercel.com)
2. 點擊 "Add New Project"
3. 導入 GitHub 倉庫
4. 設定：
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`（自動偵測）
   - **Output Directory**: `dist`（自動偵測）
5. 在 Environment Variables 中添加：
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```
   （將 `your-backend.railway.app` 替換為 Railway 提供的後端 URL）
6. 點擊 "Deploy"

部署完成後，Vercel 會提供一個 URL（例如：`https://your-project.vercel.app`）

#### 選項 B: 使用 Railway

1. 在 Railway 專案中點擊 "New" → "GitHub Repo"
2. 選擇同一個倉庫
3. 在 Settings → Root Directory 設為 `frontend`
4. 在 Settings → Deploy 設定：
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview`
5. 在 Variables 中添加：
   ```
   VITE_API_URL=https://your-backend.railway.app
   ```

### 步驟 8: 更新 CORS 設定

部署前端後，更新後端的 `CORS_ORIGIN` 環境變數：

1. 在 Railway 後端服務的 Variables 中
2. 更新 `CORS_ORIGIN` 為您的前端 URL（例如：`https://your-project.vercel.app`）
3. Railway 會自動重新部署

---

## 方案 2: Render 部署

### 部署後端

1. 登入 [Render](https://render.com)
2. 點擊 "New" → "Web Service"
3. 連接 GitHub 倉庫
4. 設定：
   - Name: `shopee2multi-backend`
   - Root Directory: `backend`
   - Environment: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. 添加環境變數（參考 Railway 的環境變數）

### 添加 PostgreSQL

1. 在 Render Dashboard 點擊 "New" → "PostgreSQL"
2. 創建免費資料庫
3. 使用資料庫連接資訊更新後端環境變數

### 部署前端

1. 點擊 "New" → "Static Site"
2. 連接 GitHub 倉庫
3. 設定：
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
4. 添加環境變數：
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```

---

## 方案 3: Vercel + Railway/Render

### 前端部署到 Vercel

1. 登入 Vercel
2. 導入 GitHub 倉庫
3. 設定 Root Directory 為 `frontend`
4. Vercel 會自動偵測 Vite 配置
5. 添加環境變數：
   ```
   VITE_API_URL=https://your-backend-url
   ```

### 後端部署

按照方案 1 或方案 2 的後端部署步驟。

---

## 重要注意事項

### Playwright 部署

Playwright 需要安裝瀏覽器，在部署時需要：

1. **Railway**: 在 `backend/package.json` 添加 postinstall 腳本：
   ```json
   "scripts": {
     "postinstall": "npx playwright install chromium --with-deps"
   }
   ```

2. **Render**: 需要添加 buildpack 或使用 Docker

### 環境變數安全

- 生產環境的 `JWT_SECRET` 必須是強隨機字串
- 不要將 `.env` 文件提交到 Git
- 使用平台提供的環境變數管理功能

### CORS 設定

確保後端的 `CORS_ORIGIN` 環境變數設定為前端的實際域名。

### 資料庫遷移

每次部署後，確保執行資料庫遷移：
```bash
npm run migrate
```

---

## 故障排除

### 後端無法連接資料庫
- 檢查環境變數是否正確
- 確認資料庫服務正在運行
- 檢查防火牆設定

### 前端無法連接後端
- 檢查 `VITE_API_URL` 環境變數
- 確認 CORS 設定正確
- 檢查後端服務是否運行

### Playwright 錯誤
- 確認已安裝 Chromium
- 檢查系統依賴是否完整
- 考慮使用 headless 模式

---

## 免費額度限制

### Railway
- $5/月免費額度
- 超出後按使用量計費

### Render
- 免費層有休眠限制（15 分鐘無活動後休眠）
- PostgreSQL 免費層有 90 天限制

### Vercel
- 無限靜態部署
- 函數調用有限制

---

## 下一步

部署完成後：
1. 測試所有功能
2. 設定自訂域名（可選）
3. 設定監控和日誌
4. 定期備份資料庫

