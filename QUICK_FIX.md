# 快速修復：添加 role 欄位

## 問題
執行 `npm run seed` 時出現錯誤：
```
column "role" of relation "users" does not exist
```

## 解決方法

### 方法一：直接執行 SQL（最快）

在您的資料庫管理工具（如 pgAdmin、DBeaver、或 psql）中執行以下 SQL：

```sql
-- 添加 role 欄位
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user' 
CHECK (role IN ('user', 'admin'));

-- 更新現有用戶的 role
UPDATE users SET role = 'user' WHERE role IS NULL;
```

### 方法二：使用 SQL 腳本

```bash
# 使用 psql
psql -U your_username -d shopee2multi -f backend/src/db/add-role-column.sql

# 或直接在資料庫工具中執行 backend/src/db/add-role-column.sql
```

### 方法三：執行完整 Migration

```bash
cd backend
npm run migrate
```

## 執行後

執行完 SQL 後，再次運行：

```bash
cd backend
npm run seed
```

應該就能成功創建管理員帳號了！

## 驗證

執行以下 SQL 確認欄位已添加：

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';
```

應該會看到：
```
 column_name | data_type | column_default
-------------+-----------+----------------
 role        | varchar   | 'user'::character varying
```

