-- 創建管理員帳號的 SQL 腳本
-- 預設帳號：admin@shopee2multi.com
-- 預設密碼：Admin@2024!
-- 
-- 使用方式：
-- 1. 修改下方的 email 和 password_hash（使用 bcrypt 加密後的密碼）
-- 2. 執行此 SQL 腳本

-- 方法 1: 如果管理員帳號不存在，則創建
INSERT INTO users (email, password_hash, name, plan, status, role)
SELECT 
  'admin@shopee2multi.com',
  '$2a$10$P.jRLvZ.jYO524dBDXeMDuFuZuL9vzNfFeiJEQmpFQnOTsx470Qwy', -- 這是 'Admin@2024!' 的 bcrypt hash
  '系統管理員',
  'biz',
  'active',
  'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'admin@shopee2multi.com'
);

-- 方法 2: 如果管理員帳號已存在，則更新為管理員
UPDATE users 
SET 
  role = 'admin',
  plan = 'biz',
  status = 'active',
  updated_at = CURRENT_TIMESTAMP
WHERE email = 'admin@shopee2multi.com';

-- 查看創建的管理員
SELECT id, email, name, plan, status, role, created_at 
FROM users 
WHERE email = 'admin@shopee2multi.com';

