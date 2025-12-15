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
VITE_API_URL=https://shopee2multi.vercel.app
```

**重要**：
- 將 `your-backend-url.railway.app` 替換為您實際的後端 URL
- 如果後端尚未部署，可以先設置為 `http://localhost:3001`（僅用於測試）
- 部署後端後再更新此環境變數
- **必須設置此環境變數**，否則 API 請求可能無法正常工作

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

**解決方案**:
1. 確認 `frontend/vercel.json` 文件存在且包含以下配置：
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
2. 如果配置正確但仍出現問題：
   - 確認 `vercel.json` 位於 `frontend/` 目錄下
   - 確認 Root Directory 設置為 `frontend`
   - 重新部署項目
3. 測試方法：
   - 直接訪問 `https://shopee2multi.vercel.app/dashboard`
   - 應該顯示登入頁面（如果未登入）或儀表板（如果已登入）
   - 不應出現 404 錯誤

**預防措施**:
- 在部署前檢查 `vercel.json` 配置
- 測試所有路由的直接訪問
- 測試重新整理功能

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


