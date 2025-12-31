# 執行步驟

## 步驟 1：添加 role 欄位

在您的終端中執行以下命令之一：

### 選項 A：使用 npm 腳本（推薦）

```bash
cd backend
npm run add-role
```

### 選項 B：直接執行 SQL

在您的資料庫管理工具（pgAdmin、DBeaver、或 psql）中執行：

```sql
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user' 
CHECK (role IN ('user', 'admin'));

UPDATE users SET role = 'user' WHERE role IS NULL;
```

### 選項 C：使用 psql 命令列

```bash
psql -U ian -d shopee2multi -f backend/src/db/add-role-column.sql
```

## 步驟 2：創建管理員帳號

執行完步驟 1 後，運行：

```bash
cd backend
npm run seed
```

## 預期輸出

執行 `npm run seed` 後，您應該看到：

```
🌱 開始創建管理員帳號...
✅ 管理員帳號已創建

📋 管理員帳號資訊：
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email:     admin@shopee2multi.com
🔑 Password:  Admin@2024!
👤 Name:      系統管理員
👑 Role:      admin
💎 Plan:      biz (商業版)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 如果遇到問題

如果 `npm run add-role` 無法執行，請直接在資料庫工具中執行 SQL：

```sql
-- 檢查欄位是否存在
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';

-- 如果不存在，執行以下 SQL
ALTER TABLE users 
ADD COLUMN role VARCHAR(50) DEFAULT 'user' 
CHECK (role IN ('user', 'admin'));

-- 更新現有用戶
UPDATE users SET role = 'user' WHERE role IS NULL;
```

