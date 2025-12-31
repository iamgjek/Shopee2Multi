-- Shopee2Multi Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  plan VARCHAR(50) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'biz')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add role column if it doesn't exist (for existing databases)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='users' AND column_name='role') THEN
    ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin'));
  END IF;
END $$;

-- Usage logs table
CREATE TABLE IF NOT EXISTS usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_count INTEGER NOT NULL DEFAULT 1,
  platform_target VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('success', 'failed', 'processing')),
  latency_ms INTEGER,
  error_code TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversion tasks table
CREATE TABLE IF NOT EXISTS conversion_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  source_url TEXT NOT NULL,
  platform_target VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  payload_json JSONB,
  result_path TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP
);

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan VARCHAR(50) NOT NULL CHECK (plan IN ('free', 'pro', 'biz')),
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pricing plans table
CREATE TABLE IF NOT EXISTS pricing_plans (
  plan VARCHAR(50) PRIMARY KEY CHECK (plan IN ('free', 'pro', 'biz')),
  name VARCHAR(100) NOT NULL,
  price_monthly INTEGER NOT NULL DEFAULT 0,
  quota_daily INTEGER NOT NULL DEFAULT 10,
  features JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_conversion_tasks_user_id ON conversion_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_tasks_status ON conversion_tasks(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);

-- Insert default pricing plans
INSERT INTO pricing_plans (plan, name, price_monthly, quota_daily, features) VALUES
  ('free', '免費版', 0, 10, '{"excel_export": true, "momo": false, "pchome": false, "image_processing": false}'),
  ('pro', '專業版', 299, 999999, '{"excel_export": true, "momo": true, "pchome": true, "image_processing": true}'),
  ('biz', '商業版', 599, 999999, '{"excel_export": true, "momo": true, "pchome": true, "coupang": true, "yahoo": true, "image_processing": true, "cloud_backup": true, "priority_support": true}')
ON CONFLICT (plan) DO NOTHING;
