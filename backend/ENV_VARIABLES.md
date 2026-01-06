# 環境變數配置指南

## 必需環境變數

### 資料庫配置（二選一）

#### 選項 1: DATABASE_URL（推薦）
```
DATABASE_URL=postgresql://user:password@host:port/database
```

#### 選項 2: 單獨變數
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=shopee2multi
DB_USER=your_db_user
DB_PASSWORD=your_db_password
```

**Railway 自動提供**：
當資料庫服務連接到後端服務時，Railway 會自動提供：
- `PGHOST`
- `PGPORT`
- `PGDATABASE`
- `PGUSER`
- `PGPASSWORD`

### JWT 配置
```
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
```

### CORS 配置
```
# 可以設置多個域名，用逗號分隔
CORS_ORIGIN=https://shopee2multi.vercel.app,https://shopee2multi.space
```

**注意**：
- 代碼會自動允許 `*.vercel.app`、`shopee2multi.space` 和 `localhost` 域名
- 如果使用自定義域名，請在 `CORS_ORIGIN` 中明確指定

## 可選環境變數

### 自動創建管理員帳號

#### 啟用自動創建
```
AUTO_SEED_ADMIN=true
```

#### 自定義管理員信息（可選）
```
ADMIN_EMAIL=admin@shopee2multi.com
ADMIN_PASSWORD=Admin@2024!
ADMIN_NAME=系統管理員
```

**說明**：
- 如果 `AUTO_SEED_ADMIN=true`，服務啟動時會自動創建或更新管理員帳號
- 如果不設置 `ADMIN_EMAIL`、`ADMIN_PASSWORD`、`ADMIN_NAME`，將使用默認值
- 如果管理員已存在，會更新密碼和角色

### 服務器配置
```
PORT=3001
NODE_ENV=production
HOST=0.0.0.0
```

### 郵件通知配置（聯絡表單）

#### SMTP 配置（必需）
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@shopee2multi.space
```

#### 通知郵件接收地址（可選）
```
ADMIN_EMAIL=iamgjek@gmail.com
```

#### 網站 URL（用於郵件中的連結，可選）
```
SITE_URL=https://shopee2multi.space
```

**說明**：
- 當有新的聯絡表單提交時，系統會自動發送郵件通知到 `ADMIN_EMAIL`（默認為 `iamgjek@gmail.com`）
- 如果未配置 SMTP，郵件功能將被禁用，但表單仍會正常保存到資料庫
- 對於 Gmail，需要使用「應用程式密碼」而非一般密碼
  - 前往 [Google 帳戶安全設定](https://myaccount.google.com/apppasswords)
  - 生成應用程式密碼並使用它作為 `SMTP_PASSWORD`

**常見 SMTP 服務商配置**：

**SendGrid**（推薦用於生產環境，特別是 Railway 等雲平台）:
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SMTP_FROM=noreply@shopee2multi.space
```

**詳細配置步驟**：請參考 [SENDGRID_SETUP.md](./SENDGRID_SETUP.md) 文件

**Gmail**:
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**注意**：Gmail SMTP 在某些雲平台（如 Railway）上可能無法連接（連接超時）。如果遇到此問題，建議使用 SendGrid。

**詳細配置步驟**：請參考 [GMAIL_SETUP.md](./GMAIL_SETUP.md) 文件

**Mailgun**:
```
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASSWORD=your-mailgun-password
```

## Railway 配置示例

在 Railway Dashboard → 後端服務 → Variables 中添加：

```
# 資料庫（Railway 自動提供，通常不需要手動設置）
DATABASE_URL=<自動從資料庫服務獲取>

# JWT
JWT_SECRET=<生成強隨機字符串，至少 32 字符>

# CORS（多個域名用逗號分隔）
CORS_ORIGIN=https://shopee2multi.vercel.app,https://shopee2multi.space

# 自動創建管理員
AUTO_SEED_ADMIN=true
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_NAME=系統管理員

# 郵件通知（聯絡表單）
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@shopee2multi.space
ADMIN_EMAIL=iamgjek@gmail.com
SITE_URL=https://shopee2multi.space
```

## 生成 JWT_SECRET

使用以下命令生成強隨機字符串：

```bash
# 使用 OpenSSL
openssl rand -base64 32

# 或使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 安全建議

1. **生產環境**：
   - 使用強密碼（至少 12 字符）
   - 使用專用的管理員郵箱
   - 定期輪換 JWT_SECRET

2. **管理員帳號**：
   - 創建後立即修改密碼
   - 可以設置 `AUTO_SEED_ADMIN=false` 禁用自動創建

3. **環境變數**：
   - 不要在代碼中硬編碼
   - 使用 Railway 的環境變數功能（加密存儲）
   - 不要將 `.env` 文件提交到 Git

