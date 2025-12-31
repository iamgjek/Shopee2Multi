# 500 Internal Server Error 診斷指南

## 問題描述

500 錯誤表示服務器正在運行，但在處理請求時出現了錯誤。這比 502 錯誤好，因為至少服務器是運行的。

## 立即診斷步驟

### 步驟 1: 查看 Railway 部署日誌

1. 進入 [Railway Dashboard](https://railway.app)
2. 選擇您的後端服務
3. 點擊 **"Logs"** 標籤（或 Deployments → 最新部署 → View Logs）
4. 查找最近的錯誤日誌

**查找這些關鍵錯誤訊息**：

#### 資料庫相關錯誤：
```
❌ Database connection failed
error: relation "users" does not exist
error: column "role" does not exist
```

#### 環境變數錯誤：
```
❌ [註冊錯誤] JWT_SECRET 環境變數未設置
```

#### 驗證錯誤：
```
❌ [註冊錯誤] 驗證錯誤: [...]
```

#### 其他錯誤：
```
❌ [錯誤處理] ========================================
   路徑: POST /api/auth/register
   狀態碼: 500
   錯誤訊息: ...
   堆疊追蹤: ...
```

### 步驟 2: 檢查常見原因

#### 原因 1: 資料庫表不存在

**症狀**：
- 日誌顯示 `relation "users" does not exist`
- 或 `column "role" does not exist`

**解決方案**：
1. 執行資料庫遷移：
   ```bash
   # 在本地或通過 Railway CLI
   cd backend
   npm run migrate
   ```

2. 或者在 Railway 上：
   - Railway Dashboard → 後端服務 → Deployments
   - 找到包含遷移腳本的部署
   - 或手動執行 SQL（Railway Dashboard → 資料庫服務 → Query）

#### 原因 2: 環境變數缺失

**症狀**：
- 日誌顯示 `JWT_SECRET 環境變數未設置`
- 或其他環境變數相關錯誤

**解決方案**：
1. Railway Dashboard → 後端服務 → **Variables**
2. 確認以下環境變數存在：
   - `JWT_SECRET` (必需)
   - `JWT_EXPIRES_IN` (可選，默認 7d)
   - `DATABASE_URL` 或 `PGHOST`, `PGPORT`, etc. (必需)

3. 如果 `JWT_SECRET` 不存在，添加它：
   - 點擊 **"New Variable"**
   - Key: `JWT_SECRET`
   - Value: 生成一個強隨機字符串（至少 32 字符）
   - 可以使用：`openssl rand -base64 32`

#### 原因 3: 資料庫連接失敗

**症狀**：
- 日誌顯示 `❌ Database connection failed`
- 或 `ECONNREFUSED`

**解決方案**：
1. 確認 PostgreSQL 服務正在運行
2. 確認資料庫服務已連接到後端服務
3. 檢查環境變數是否正確設置
4. 參考 `TROUBLESHOOT_502.md` 中的資料庫連接部分

#### 原因 4: 資料庫遷移未執行

**症狀**：
- 註冊時出現 500 錯誤
- 日誌可能顯示表或列不存在的錯誤

**解決方案**：
1. 確認資料庫表已創建：
   - Railway Dashboard → 資料庫服務 → Query
   - 執行：`SELECT * FROM users LIMIT 1;`
   - 如果返回錯誤，需要執行遷移

2. 執行遷移：
   - 在本地：`cd backend && npm run migrate`
   - 或通過 Railway CLI
   - 或直接在 Railway Query 中執行 `schema.sql`

## 快速修復檢查清單

- [ ] 查看 Railway 部署日誌中的錯誤訊息
- [ ] 確認 `JWT_SECRET` 環境變數已設置
- [ ] 確認資料庫表已創建（執行遷移）
- [ ] 確認資料庫連接正常（日誌顯示 `✅ Database connected successfully`）
- [ ] 確認所有必需的環境變數都已設置

## 測試註冊端點

使用 curl 測試註冊端點：

```bash
curl -X POST https://shopee2multi-backend-production-e067.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Origin: https://shopee2multi.vercel.app" \
  -d '{
    "email": "test@example.com",
    "password": "test123456",
    "name": "Test User"
  }'
```

**預期響應**：
```json
{
  "success": true,
  "data": {
    "token": "...",
    "user": {
      "id": "...",
      "email": "test@example.com",
      "name": "Test User",
      "plan": "free",
      "role": "user"
    }
  }
}
```

**如果返回 500**：
- 查看 Railway 日誌中的詳細錯誤訊息
- 根據錯誤訊息修復問題

## 常見錯誤和解決方案

### 錯誤: "JWT_SECRET 環境變數未設置"

**解決方案**：
1. Railway Dashboard → 後端服務 → Variables
2. 添加 `JWT_SECRET` 環境變數
3. 值：生成一個強隨機字符串
4. 重新部署服務

### 錯誤: "relation 'users' does not exist"

**解決方案**：
1. 執行資料庫遷移：
   ```bash
   cd backend
   npm run migrate
   ```
2. 或直接在 Railway Query 中執行 `schema.sql`

### 錯誤: "column 'role' does not exist"

**解決方案**：
1. 執行角色列遷移：
   ```bash
   cd backend
   npm run add-role
   ```
2. 或執行 `add-role-column.sql`

### 錯誤: "Database connection failed"

**解決方案**：
1. 確認 PostgreSQL 服務正在運行
2. 確認資料庫服務已連接到後端服務
3. 檢查環境變數
4. 參考 `TROUBLESHOOT_502.md`

## 日誌格式說明

現在註冊端點會輸出詳細的日誌：

```
📝 [註冊請求] 收到註冊請求
   Email: user@example.com, Name: Test User
🔍 [註冊檢查] 檢查用戶是否已存在...
✅ [註冊檢查] 郵箱可用
👤 [註冊創建] 正在創建用戶...
✅ [註冊創建] 用戶創建成功, ID: xxx
🔑 [註冊JWT] 生成 JWT token...
✅ [註冊成功] 用戶註冊完成
```

如果出現錯誤，會看到：

```
❌ [註冊錯誤] Error message
   驗證錯誤: [...] (如果是驗證錯誤)
```

或：

```
❌ [錯誤處理] ========================================
   路徑: POST /api/auth/register
   狀態碼: 500
   錯誤訊息: ...
   堆疊追蹤: ...
================================================
```

## 如果問題仍然存在

請提供以下信息：

1. **Railway 部署日誌截圖**（特別是錯誤部分）
2. **環境變數列表**（隱藏敏感信息，只顯示變數名）
3. **curl 測試結果**（如果可能）
4. **資料庫表狀態**（是否已創建）

