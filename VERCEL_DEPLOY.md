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

### 3. 設置環境變數

進入 **Settings** → **Environment Variables**，添加：

```
VITE_API_URL=https://your-backend-url.railway.app
```

**重要**：
- 將 `your-backend-url.railway.app` 替換為您實際的後端 URL
- 如果後端尚未部署，可以先設置為 `http://localhost:3001`（僅用於測試）
- 部署後端後再更新此環境變數

### 4. 部署

1. 點擊頂部的 **Deployments** 標籤
2. 點擊 **Redeploy** 或推送代碼到 GitHub（會自動觸發部署）
3. 等待構建完成

### 5. 驗證部署

部署完成後：
1. 訪問 Vercel 提供的 URL（例如：`https://shopee2multi.vercel.app`）
2. 檢查瀏覽器控制台是否有錯誤
3. 測試 API 連接是否正常

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

