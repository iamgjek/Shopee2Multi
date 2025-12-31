-- 添加 role 欄位到 users 表
-- 執行此腳本來添加 role 欄位（如果不存在）

-- 方法 1: 使用 DO 語句（推薦，適用於 PostgreSQL）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'role'
  ) THEN
    ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin'));
    -- 更新現有用戶的 role 為 'user'（如果為 NULL）
    UPDATE users SET role = 'user' WHERE role IS NULL;
    RAISE NOTICE 'Role column added successfully';
  ELSE
    RAISE NOTICE 'Role column already exists';
  END IF;
END $$;

-- 驗證欄位已添加
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';
