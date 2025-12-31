# 管理員帳號資訊

## 預設管理員帳號

| 項目 | 值 |
|------|-----|
| **Email** | `admin@shopee2multi.com` |
| **Password** | `Admin@2024!` |
| **Name** | `系統管理員` |
| **Role** | `admin` |
| **Plan** | `biz` (商業版) |

## 快速設置

### 方法一：使用 Seed 腳本（推薦）

```bash
cd backend
npm run seed
```

### 方法二：使用 SQL

執行以下 SQL 指令：

```sql
-- 創建管理員帳號
INSERT INTO users (email, password_hash, name, plan, status, role)
SELECT 
  'admin@shopee2multi.com',
  '$2a$10$P.jRLvZ.jYO524dBDXeMDuFuZuL9vzNfFeiJEQmpFQnOTsx470Qwy',
  '系統管理員',
  'biz',
  'active',
  'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'admin@shopee2multi.com'
);
```

## 登入步驟

1. 訪問登入頁面：`/login`
2. 輸入 Email：`admin@shopee2multi.com`
3. 輸入 Password：`Admin@2024!`
4. 登入後，點擊 Header 的「管理後台」連結

## 安全提示

⚠️ **請立即修改預設密碼！**

登入後請通過資料庫修改密碼，或使用管理後台功能（如果已實現）。

## 詳細說明

更多資訊請參考：[backend/ADMIN_SETUP.md](backend/ADMIN_SETUP.md)

