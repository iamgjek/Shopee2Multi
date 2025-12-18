# Vercel 部署指南

## 快速部署步驟

### 1. 連接 GitHub 倉庫

1. 登入 [Vercel Dashboard](https://vercel.com/dashboard)
2. 進入您的項目：https://vercel.com/iamgjeks-projects/shopee2multi
3. 點擊 **Settings** → **Git**
4. 如果尚未連接，點擊 **Connect Git Repository**
5. 選擇 GitHub 倉庫：`iamgjek/Shopee2Multi`

### 2. 配置項目設置

進入 **Settings** → **General**：

- **Framework Preset**: Vite（應該自動偵測）
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`（自動偵測）
- **Output Directory**: `dist`（自動偵測）
- **Install Command**: `npm install`（自動偵測）

### 3. 確認 SPA 路由配置

確保 `frontend/vercel.json` 文件包含以下配置（已預設配置）：

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**重要**：
- 此配置確保所有路由請求都會回傳 `index.html`，讓 React Router 處理客戶端路由
- 如果缺少此配置，直接訪問非根路徑（如 `/dashboard`）會出現 `404 NOT_FOUND` 錯誤
- 此配置不會影響靜態資源（`.js`, `.css`, `.png` 等）的正常載入

### 4. 設置環境變數

進入 **Settings** → **Environment Variables**，添加：

```
VITE_API_URL=https://shopee2multi-backend.railway.app
```

**重要**：
- ⚠️ **必須設置此環境變數**，否則 API 請求會失敗
- 將 `shopee2multi-backend.railway.app` 替換為您實際的後端 URL（不需要包含 `/api`，代碼會自動添加）
- 如果後端尚未部署，可以先設置為 `http://localhost:3001`（僅用於本地測試）
- 部署後端後再更新此環境變數為實際的後端 URL

**為什麼必須設置？**
1. 如果不設置，會使用後備值 `/api`
2. 在 Vercel 上，`/api` 請求會被 SPA fallback 規則捕獲，重定向到 `index.html`
3. 這會導致所有 API 請求失敗（返回 HTML 而不是 JSON）
4. 後端部署在另一個服務器（Railway/Render），需要完整的 URL 才能訪問

### 4.5. 配置後端 CORS（重要！）

⚠️ **必須在 Railway 後端設置 CORS_ORIGIN 環境變數**，否則會出現 CORS 錯誤。

1. 進入 Railway Dashboard → 您的後端服務
2. 點擊 **Variables** 標籤
3. 添加或更新環境變數：
   ```
   CORS_ORIGIN=https://shopee2multi.vercel.app
   ```
   - 將 `shopee2multi.vercel.app` 替換為您實際的前端 URL
   - 如果需要支援多個域名（例如開發和生產環境），可以用逗號分隔：
     ```
     CORS_ORIGIN=https://shopee2multi.vercel.app,http://localhost:5173
     ```
4. Railway 會自動重新部署後端服務

**如果出現 CORS 錯誤**：
- 確認 `CORS_ORIGIN` 環境變數已設置且值正確
- 確認前端 URL 與後端設置的 `CORS_ORIGIN` 完全匹配（包括 `https://` 協議）
- 清除瀏覽器快取並重新載入頁面
- 檢查 Railway 部署日誌，確認環境變數已生效

### 5. 部署

1. 點擊頂部的 **Deployments** 標籤
2. 點擊 **Redeploy** 或推送代碼到 GitHub（會自動觸發部署）
3. 等待構建完成

### 6. 驗證部署

部署完成後，請進行以下測試：

#### 基本功能測試
1. 訪問 Vercel 提供的 URL（例如：`https://shopee2multi.vercel.app`）
2. 檢查瀏覽器控制台是否有錯誤
3. 測試 API 連接是否正常

#### 路由測試（重要！）
確保所有路由都能正常訪問：
- [ ] 直接訪問首頁：`https://shopee2multi.vercel.app/`
- [ ] 直接訪問登入頁：`https://shopee2multi.vercel.app/login`
- [ ] 直接訪問註冊頁：`https://shopee2multi.vercel.app/register`
- [ ] 直接訪問儀表板：`https://shopee2multi.vercel.app/dashboard`（需要登入）
- [ ] 直接訪問轉檔工具：`https://shopee2multi.vercel.app/converter`（需要登入）
- [ ] 測試重新整理功能：在任意路由頁面按 F5 或 Cmd+R，不應出現 404
- [ ] 測試分享連結：將路由連結分享給他人，應能正常訪問

**如果任何路由出現 404 錯誤**，請檢查 `vercel.json` 是否包含 SPA fallback 配置。

## 常見問題

### 構建失敗

**問題**: 構建時出現錯誤

**解決方案**:
- 檢查 Root Directory 是否設為 `frontend`
- 確認 `package.json` 中的 build 腳本正確
- 查看構建日誌了解詳細錯誤

### API 連接失敗

**問題**: 前端無法連接到後端

**解決方案**:
1. 確認 `VITE_API_URL` 環境變數已設置
2. 檢查後端 CORS 設置是否允許前端域名
3. 確認後端服務正在運行

### CORS 錯誤（Access-Control-Allow-Origin）

**問題**: 瀏覽器控制台出現以下錯誤：
```
Origin https://shopee2multi.vercel.app is not allowed by Access-Control-Allow-Origin
XMLHttpRequest cannot load https://shopee2multi-backend.railway.app/api/... due to access control checks
```

**原因**:
- 後端的 `CORS_ORIGIN` 環境變數未設置或設置錯誤
- 前端 URL 與後端設置的允許來源不匹配
- 後端 CORS 配置不正確

**解決方案**:

1. **檢查 Railway 後端環境變數**：
   - 進入 Railway Dashboard → 後端服務 → Variables
   - 確認 `CORS_ORIGIN` 環境變數存在
   - 確認值為您的前端 URL（例如：`https://shopee2multi.vercel.app`）
   - **重要**：URL 必須完全匹配，包括協議（`https://`）和域名

2. **設置或更新 CORS_ORIGIN**：
   ```
   CORS_ORIGIN=https://shopee2multi.vercel.app
   ```
   - 如果需要支援多個域名，用逗號分隔：
     ```
     CORS_ORIGIN=https://shopee2multi.vercel.app,http://localhost:5173
     ```

3. **重新部署後端**：
   - Railway 會在環境變數更改後自動重新部署
   - 等待部署完成（通常需要 1-2 分鐘）

4. **驗證修復**：
   - 清除瀏覽器快取
   - 重新載入頁面
   - 檢查瀏覽器開發者工具的 Network 標籤
   - 確認 API 請求返回 200 狀態碼，而不是 CORS 錯誤

5. **檢查後端日誌**：
   - 進入 Railway Dashboard → 後端服務 → Deployments
   - 查看最新部署的日誌
   - 確認沒有 CORS 相關的警告訊息

**預防措施**:
- 在部署前端之前，先設置後端的 `CORS_ORIGIN` 環境變數
- 確保前端 URL 與後端設置的 `CORS_ORIGIN` 完全匹配
- 在部署文檔中記錄正確的 CORS 配置步驟

### 環境變數未生效

**問題**: 環境變數設置後未生效

**解決方案**:
- Vite 環境變數必須以 `VITE_` 開頭
- 重新部署項目（環境變數更改後需要重新構建）
- 檢查環境變數是否設置在正確的環境（Production/Preview/Development）

### 路由出現 404 NOT_FOUND 錯誤

**問題**: 直接訪問路由（如 `/dashboard`、`/login`）時出現 `404 NOT_FOUND` 錯誤

**原因**: 
- 這是單頁應用（SPA）的常見問題
- 當用戶直接訪問非根路徑時，Vercel 會在伺服器端尋找對應的檔案
- 如果沒有配置 SPA fallback，找不到檔案就會回傳 404

**診斷步驟**:

1. **檢查 vercel.json 配置**：
   - 確認 `frontend/vercel.json` 文件存在
   - 確認包含以下配置：
     ```json
     {
       "rewrites": [
         {
           "source": "/(.*)",
           "destination": "/index.html"
         }
       ]
     }
     ```

2. **檢查 Vercel 項目設置**：
   - 進入 Vercel Dashboard → 項目 Settings → General
   - 確認 **Root Directory** 設置為 `frontend`
   - 確認 **Framework Preset** 為 `Vite`
   - 確認 **Output Directory** 為 `dist`

3. **檢查構建日誌**：
   - 進入 Vercel Dashboard → Deployments
   - 點擊最新的部署，查看構建日誌
   - 確認構建成功，沒有錯誤
   - 確認 `dist` 目錄中有 `index.html` 檔案

4. **檢查部署檔案**：
   - 在部署詳情頁面，點擊 "View Function Logs"
   - 檢查是否有路由相關的錯誤

5. **測試不同路由**：
   - 測試首頁：`https://shopee2multi.vercel.app/`（應該正常）
   - 測試路由：`https://shopee2multi.vercel.app/dashboard`（應該回傳 index.html）
   - 測試靜態資源：`https://shopee2multi.vercel.app/assets/...`（應該正常載入）

**解決方案**:

1. **如果 vercel.json 配置缺失或錯誤**：
   - 確保 `frontend/vercel.json` 包含正確的 rewrite 規則
   - 提交並推送代碼到 GitHub
   - Vercel 會自動重新部署

2. **如果 Root Directory 設置錯誤**：
   - 進入 Vercel Dashboard → Settings → General
   - 將 Root Directory 設置為 `frontend`
   - 手動觸發重新部署

3. **如果構建失敗**：
   - 檢查構建日誌中的錯誤訊息
   - 確認 `package.json` 中的 build 腳本正確
   - 確認所有依賴都已安裝

4. **如果配置都正確但仍出現問題**：
   - 清除 Vercel 快取：Settings → General → Clear Build Cache
   - 手動觸發重新部署
   - 等待部署完成後再次測試

**測試方法**：
- 直接訪問 `https://shopee2multi.vercel.app/dashboard`
- 應該顯示登入頁面（如果未登入）或儀表板（如果已登入）
- 不應出現 404 錯誤
- 在瀏覽器開發者工具的 Network 標籤中，檢查請求的 Response 應該是 HTML（index.html），而不是 404 JSON

**預防措施**:
- 在部署前檢查 `vercel.json` 配置
- 測試所有路由的直接訪問
- 測試重新整理功能
- 在本地使用 `npm run build && npm run preview` 測試構建結果

## 自動部署

Vercel 會自動：
- 監聽 GitHub 推送
- 在每次推送時自動構建和部署
- 為每個 Pull Request 創建預覽部署

## 自訂域名

1. 進入 **Settings** → **Domains**
2. 添加您的域名
3. 按照指示配置 DNS 記錄

## 監控和分析

- **Analytics**: 查看訪問統計
- **Speed Insights**: 性能監控
- **Logs**: 查看運行時日誌

## 更新部署

每次推送代碼到 GitHub 的 `main` 分支時，Vercel 會自動：
1. 檢測變更
2. 重新構建項目
3. 部署新版本

您也可以在 Dashboard 中手動觸發 **Redeploy**。


