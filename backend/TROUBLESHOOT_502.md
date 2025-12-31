# 502 Bad Gateway 錯誤診斷指南

## 問題描述

當前端嘗試訪問後端 API 時，收到 502 Bad Gateway 錯誤，通常表示：
- 後端服務沒有運行
- 後端服務崩潰了
- Railway 代理無法連接到後端服務
- 後端服務啟動失敗

## 立即診斷步驟

### 步驟 1: 檢查後端服務狀態

1. 進入 [Railway Dashboard](https://railway.app)
2. 選擇您的後端服務（`shopee2multi-backend`）
3. 檢查服務狀態：
   - ✅ **Active/Running**: 服務正在運行
   - ❌ **Stopped/Failed**: 服務已停止或失敗

### 步驟 2: 檢查後端部署日誌

1. 進入 Railway Dashboard → 後端服務 → **Deployments**
2. 點擊最新的部署 → **View Logs**
3. 查找以下關鍵訊息：

#### ✅ 正常啟動應該看到：
```
🚀 Server running on http://localhost:3001
✅ Database connected successfully
🌐 CORS Configuration:
   - Allowed origins from env: ...
✅ Server is ready to accept connections
```

#### ❌ 如果看到錯誤：
- `❌ Database connection failed`: 資料庫連接問題
- `❌ Port 3001 is already in use`: 端口衝突
- `❌ Uncaught Exception`: 未處理的異常
- `❌ Unhandled Rejection`: 未處理的 Promise 拒絕

### 步驟 3: 測試健康檢查端點

在瀏覽器中訪問或使用 curl：

```bash
curl https://shopee2multi-backend-production.up.railway.app/health
```

**預期響應**：
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45,
  "environment": "production"
}
```

**如果返回 502**：
- 後端服務沒有運行
- 需要檢查 Railway 部署日誌

**如果返回 404**：
- 路由配置問題
- 檢查 `vercel.json` 或 Railway 配置

### 步驟 4: 測試 CORS 預檢請求

```bash
curl -i -X OPTIONS https://shopee2multi-backend-production.up.railway.app/api/auth/login \
  -H "Origin: https://shopee2multi.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization"
```

**預期響應**：
- 狀態碼：`204 No Content`
- 標頭應包含：`Access-Control-Allow-Origin: https://shopee2multi.vercel.app`

**如果返回 502**：
- 後端服務沒有運行或崩潰
- 檢查 Railway 部署日誌

## 常見原因和解決方案

### 原因 1: 資料庫連接失敗

**症狀**：
- 日誌顯示 `❌ Database connection failed`
- 服務可能無法啟動或啟動後立即崩潰

**解決方案**：
1. 確認 PostgreSQL 服務正在運行（Railway Dashboard → 資料庫服務）
2. 確認資料庫服務已連接到後端服務：
   - Railway Dashboard → 後端服務 → Settings → Connect
   - 選擇 PostgreSQL 服務並連接
3. 檢查環境變數：
   - `DATABASE_URL` 或
   - `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`
4. 重新部署後端服務

### 原因 2: 服務啟動失敗

**症狀**：
- 日誌顯示 `❌ Uncaught Exception` 或 `❌ Unhandled Rejection`
- 服務狀態為 "Failed"

**解決方案**：
1. 查看完整的錯誤堆疊追蹤
2. 修復代碼中的錯誤
3. 重新部署

### 原因 3: 端口配置錯誤

**症狀**：
- 日誌顯示 `❌ Port 3001 is already in use`
- 或服務無法綁定端口

**解決方案**：
1. 確認 `PORT` 環境變數設置正確（Railway 通常自動設置）
2. 不要手動設置 `PORT` 環境變數，讓 Railway 自動分配

### 原因 4: 構建失敗

**症狀**：
- 部署日誌顯示 TypeScript 編譯錯誤
- 構建階段失敗

**解決方案**：
1. 修復所有 TypeScript 編譯錯誤
2. 確保 `npm run build` 成功
3. 重新部署

### 原因 5: 依賴安裝失敗

**症狀**：
- 部署日誌顯示 `npm install` 失敗
- Playwright 瀏覽器安裝失敗

**解決方案**：
1. 檢查 `package.json` 中的依賴版本
2. 確認 `postinstall` 腳本正確配置
3. 如果 Playwright 安裝失敗，檢查 Railway 構建日誌

## 快速修復檢查清單

- [ ] 後端服務狀態為 "Active" 或 "Running"
- [ ] 部署日誌顯示 `🚀 Server running on http://localhost:3001`
- [ ] 部署日誌顯示 `✅ Database connected successfully`
- [ ] `/health` 端點返回 `{"status":"ok"}`
- [ ] OPTIONS 預檢請求返回 `204` 狀態碼
- [ ] 沒有未處理的異常或拒絕
- [ ] 環境變數正確設置（特別是資料庫相關）

## 如果問題仍然存在

1. **重新部署後端服務**：
   - Railway Dashboard → 後端服務 → Deployments → Redeploy

2. **檢查 Railway 服務限制**：
   - 確認沒有達到資源限制
   - 檢查服務配額

3. **查看完整日誌**：
   - Railway Dashboard → 後端服務 → Logs
   - 查找最近的錯誤訊息

4. **聯繫支援**：
   - 如果以上步驟都無法解決，請提供：
     - Railway 部署日誌截圖
     - `/health` 端點測試結果
     - OPTIONS 預檢請求測試結果

## 預防措施

1. **添加健康檢查監控**：
   - 使用 Railway 的監控功能
   - 設置告警當服務離線時通知

2. **改進錯誤處理**：
   - 確保所有異步操作都有錯誤處理
   - 使用 try-catch 包裹可能失敗的操作

3. **日誌記錄**：
   - 添加詳細的日誌記錄
   - 使用結構化日誌格式

4. **測試部署**：
   - 在部署到生產環境前，先在預覽環境測試
   - 確保所有端點都正常工作

