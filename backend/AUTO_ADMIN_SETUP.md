# 自動創建管理員帳號配置指南

## 功能說明

在部署時，系統可以自動創建一個管理員帳號。這對於首次部署或重置環境非常有用。

## 配置步驟

### 步驟 1: 設置環境變數

在 Railway 後端服務的 **Variables** 中添加以下環境變數：

#### 必需變數（啟用自動創建）

```
AUTO_SEED_ADMIN=true
```

#### 可選變數（自定義管理員信息）

如果不設置，將使用默認值：

```
ADMIN_EMAIL=admin@shopee2multi.com
ADMIN_PASSWORD=Admin@2024!
ADMIN_NAME=系統管理員
```

### 步驟 2: 部署服務

1. 設置環境變數後，Railway 會自動重新部署
2. 或者手動觸發重新部署

### 步驟 3: 查看日誌確認

部署完成後，在 Railway 日誌中查找：

```
🌱 [自動Seed] 開始創建管理員帳號...
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

## 環境變數說明

### AUTO_SEED_ADMIN

- **類型**: 布林值
- **默認值**: `false`（不啟用）
- **說明**: 設置為 `true` 或 `1` 以啟用自動創建管理員
- **示例**: `AUTO_SEED_ADMIN=true`

### ADMIN_EMAIL

- **類型**: 字符串
- **默認值**: `admin@shopee2multi.com`
- **說明**: 管理員帳號的電子郵件地址
- **示例**: `ADMIN_EMAIL=admin@yourdomain.com`

### ADMIN_PASSWORD

- **類型**: 字符串
- **默認值**: `Admin@2024!`
- **說明**: 管理員帳號的密碼（建議使用強密碼）
- **安全提示**: 生產環境請使用強密碼
- **示例**: `ADMIN_PASSWORD=YourSecurePassword123!`

### ADMIN_NAME

- **類型**: 字符串
- **默認值**: `系統管理員`
- **說明**: 管理員的顯示名稱
- **示例**: `ADMIN_NAME=Administrator`

## 行為說明

### 如果管理員已存在

- 系統會**更新**現有帳號：
  - 更新密碼為環境變數中設置的值
  - 確保角色為 `admin`
  - 確保計劃為 `biz`（商業版）
  - 確保狀態為 `active`

### 如果管理員不存在

- 系統會**創建**新管理員帳號：
  - 使用環境變數中設置的信息
  - 角色自動設置為 `admin`
  - 計劃自動設置為 `biz`（商業版）
  - 狀態自動設置為 `active`

## 安全建議

1. **生產環境**：
   - 使用強密碼（至少 12 字符，包含大小寫字母、數字和特殊字符）
   - 使用專用的管理員郵箱
   - 登入後立即修改密碼

2. **禁用自動創建**：
   - 創建管理員後，可以設置 `AUTO_SEED_ADMIN=false` 或刪除該環境變數
   - 這樣可以防止意外重置管理員密碼

3. **環境變數安全**：
   - 不要在代碼中硬編碼管理員信息
   - 使用 Railway 的環境變數功能（加密存儲）
   - 不要將 `.env` 文件提交到 Git

## Railway 配置示例

### 完整配置

在 Railway Dashboard → 後端服務 → Variables 中添加：

```
AUTO_SEED_ADMIN=true
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_NAME=系統管理員
```

### 最小配置（使用默認值）

只需設置：

```
AUTO_SEED_ADMIN=true
```

系統將使用默認值：
- Email: `admin@shopee2multi.com`
- Password: `Admin@2024!`
- Name: `系統管理員`

## 驗證管理員帳號

### 方法 1: 查看 Railway 日誌

部署完成後，在 Railway 日誌中查找管理員帳號信息。

### 方法 2: 查詢資料庫

在 Railway Dashboard → 資料庫服務 → Query 中執行：

```sql
SELECT id, email, name, role, plan, status, created_at 
FROM users 
WHERE role = 'admin';
```

### 方法 3: 嘗試登入

使用配置的 Email 和 Password 登入系統，確認可以訪問管理後台。

## 故障排除

### 問題：管理員沒有被創建

**檢查**：
1. 確認 `AUTO_SEED_ADMIN=true` 已設置
2. 查看 Railway 日誌中是否有錯誤訊息
3. 確認資料庫遷移已成功執行（表已創建）

### 問題：管理員密碼不正確

**解決方案**：
1. 更新 `ADMIN_PASSWORD` 環境變數
2. 重新部署服務
3. 系統會自動更新管理員密碼

### 問題：無法登入管理後台

**檢查**：
1. 確認用戶角色是 `admin`（見驗證方法 2）
2. 確認密碼正確（注意大小寫和特殊字符）
3. 清除瀏覽器緩存並重新登入

## 手動創建管理員（備用方案）

如果自動創建失敗，可以手動執行：

```bash
cd backend
npm run seed
```

或使用 SQL：

```sql
-- 見 backend/src/db/create-admin.sql
```

