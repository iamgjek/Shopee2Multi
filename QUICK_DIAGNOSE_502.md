# 502 錯誤快速診斷指南

## 🚨 立即檢查步驟

### 步驟 1: 檢查 Railway 後端服務狀態（最重要！）

1. 打開 [Railway Dashboard](https://railway.app)
2. 選擇您的後端服務
3. **檢查服務狀態**：
   - ✅ **綠色 "Active"** = 服務正在運行
   - ❌ **紅色 "Stopped" 或 "Failed"** = 服務沒有運行

**如果服務是 Stopped/Failed**：
- 點擊 **"Deploy"** 或 **"Redeploy"** 按鈕
- 等待部署完成（1-2 分鐘）

### 步驟 2: 查看部署日誌

1. Railway Dashboard → 後端服務 → **Deployments** 標籤
2. 點擊最新的部署
3. 點擊 **"View Logs"**

**查找這些關鍵訊息**：

#### ✅ 正常啟動應該看到：
```
🚀 Server running on http://0.0.0.0:XXXX
✅ Database connected successfully
✅ Server is ready to accept connections
```

#### ❌ 如果看到錯誤：
- `❌ Database connection failed` → 資料庫連接問題
- `❌ Port XXXX is already in use` → 端口衝突
- `❌ Uncaught Exception` → 代碼錯誤
- `npm error` → 構建失敗

### 步驟 3: 測試健康檢查端點

在瀏覽器中打開或使用 curl：

```bash
curl https://shopee2multi-backend-production.up.railway.app/health
```

**預期結果**：
```json
{"status":"ok","timestamp":"...","uptime":123.45,"environment":"production"}
```

**如果返回 502**：
- 後端服務沒有運行
- 回到步驟 1，重新部署服務

**如果返回 404**：
- 檢查 Railway 服務配置
- 確認服務正在運行

### 步驟 4: 檢查資料庫連接

如果日誌顯示 `❌ Database connection failed`：

1. **確認 PostgreSQL 服務正在運行**：
   - Railway Dashboard → 查找 PostgreSQL 服務
   - 確認狀態為 "Active"

2. **確認資料庫已連接到後端**：
   - Railway Dashboard → 後端服務 → **Settings**
   - 找到 **"Connect"** 或 **"Connected Services"** 部分
   - 確認 PostgreSQL 服務已連接
   - 如果沒有連接，點擊 **"Connect"** 並選擇 PostgreSQL 服務

3. **檢查環境變數**：
   - Railway Dashboard → 後端服務 → **Variables**
   - 確認以下之一存在：
     - `DATABASE_URL` (推薦)
     - 或 `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`

## 🔧 快速修復

### 修復 1: 重新部署後端服務

1. Railway Dashboard → 後端服務
2. 點擊 **"Deployments"** 標籤
3. 點擊 **"Redeploy"** 按鈕
4. 等待部署完成

### 修復 2: 檢查並修復資料庫連接

1. Railway Dashboard → 後端服務 → **Settings**
2. 找到 **"Connect"** 部分
3. 如果 PostgreSQL 未連接，點擊 **"Connect"** 並選擇資料庫服務
4. Railway 會自動設置環境變數
5. 重新部署後端服務

### 修復 3: 檢查構建錯誤

如果部署日誌顯示構建錯誤：

1. 查看完整的錯誤訊息
2. 修復代碼中的錯誤
3. 提交並推送到 GitHub
4. Railway 會自動重新部署

## 📋 檢查清單

在報告問題前，請確認：

- [ ] Railway 後端服務狀態為 "Active"
- [ ] 部署日誌顯示 `🚀 Server running`
- [ ] 部署日誌顯示 `✅ Database connected successfully`
- [ ] `/health` 端點返回 `{"status":"ok"}`
- [ ] PostgreSQL 服務已連接到後端服務
- [ ] 環境變數正確設置（`DATABASE_URL` 或 `PG*` 變數）

## 🆘 如果問題仍然存在

請提供以下信息：

1. **Railway 部署日誌截圖**（特別是錯誤訊息）
2. **`/health` 端點測試結果**
3. **後端服務狀態**（Active/Stopped/Failed）
4. **資料庫服務狀態**（Active/Stopped/Failed）
5. **環境變數列表**（隱藏敏感信息）

## 💡 預防措施

1. **設置監控告警**：
   - Railway Dashboard → 後端服務 → Settings
   - 啟用健康檢查監控

2. **定期檢查日誌**：
   - 定期查看部署日誌
   - 及時發現並修復問題

3. **測試部署**：
   - 在部署到生產環境前，先在預覽環境測試
   - 確保所有功能正常

