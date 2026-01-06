# 快速啟用自動創建管理員

## 問題

日誌顯示：
```
ℹ️  [自動Seed] AUTO_SEED_ADMIN 未啟用，跳過管理員創建
```

這表示環境變數 `AUTO_SEED_ADMIN` 未設置或設置為 `false`。

## 解決方案

### 步驟 1: 進入 Railway Dashboard

1. 打開 [Railway Dashboard](https://railway.app)
2. 選擇您的後端服務（`shopee2multi-backend`）

### 步驟 2: 添加環境變數

1. 點擊 **"Variables"** 標籤
2. 點擊 **"New Variable"** 按鈕
3. 添加以下環境變數：

#### 必需變數（啟用自動創建）

**Key**: `AUTO_SEED_ADMIN`  
**Value**: `true`

#### 可選變數（自定義管理員信息）

如果不設置，將使用默認值。

**Key**: `ADMIN_EMAIL`  
**Value**: `admin@shopee2multi.com`（或您的郵箱）

**Key**: `ADMIN_PASSWORD`  
**Value**: `Admin@2024!`（或您的強密碼）

**Key**: `ADMIN_NAME`  
**Value**: `系統管理員`（或您的名稱）

### 步驟 3: 保存並重新部署

1. 點擊 **"Add"** 或 **"Save"** 保存環境變數
2. Railway 會自動檢測變更並重新部署
3. 或手動觸發：點擊 **"Deployments"** → **"Redeploy"**

### 步驟 4: 查看日誌確認

部署完成後，在 Railway 日誌中查找：

```
🌱 [自動Seed] 開始創建管理員帳號...
   Email: admin@shopee2multi.com
✅ [自動Seed] 管理員帳號已創建: admin@shopee2multi.com

📋 [自動Seed] 管理員帳號資訊：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email:     admin@shopee2multi.com
🔑 Password:  Admin@2024!
👤 Name:      系統管理員
👑 Role:      admin
💎 Plan:      biz (商業版)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 最小配置（使用默認值）

如果您想使用默認值，只需添加一個環境變數：

```
AUTO_SEED_ADMIN=true
```

系統將使用：
- Email: `admin@shopee2multi.com`
- Password: `Admin@2024!`
- Name: `系統管理員`

## 自定義配置（推薦用於生產環境）

```
AUTO_SEED_ADMIN=true
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_NAME=系統管理員
```

## 驗證管理員已創建

### 方法 1: 查看 Railway 日誌

查找 `✅ [自動Seed] 管理員帳號已創建` 訊息。

### 方法 2: 嘗試登入

使用配置的 Email 和 Password 登入系統：
- 前端 URL: `https://shopee2multi.vercel.app/login`
- 使用管理員帳號登入
- 確認可以看到 "管理後台" 鏈接

### 方法 3: 查詢資料庫

在 Railway Dashboard → 資料庫服務 → Query 中執行：

```sql
SELECT id, email, name, role, plan, status, created_at 
FROM users 
WHERE role = 'admin';
```

應該能看到管理員帳號。

## 如果仍然沒有創建

1. **確認環境變數已保存**：
   - Railway Dashboard → 後端服務 → Variables
   - 確認 `AUTO_SEED_ADMIN=true` 存在

2. **確認服務已重新部署**：
   - Railway Dashboard → 後端服務 → Deployments
   - 確認最新部署時間是設置環境變數之後

3. **查看完整日誌**：
   - Railway Dashboard → 後端服務 → Logs
   - 查找 `[自動Seed]` 相關訊息
   - 如果有錯誤，根據錯誤訊息修復

4. **手動執行 seed**（備用方案）：
   ```bash
   # 使用 Railway CLI
   railway run npm run seed
   ```

## 安全提示

⚠️ **重要**：
- 生產環境請使用強密碼（至少 12 字符）
- 登入後立即修改密碼
- 創建管理員後，可以設置 `AUTO_SEED_ADMIN=false` 禁用自動創建
- 不要在代碼中硬編碼管理員信息


