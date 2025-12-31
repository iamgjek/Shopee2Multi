import { pool } from './connection';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// 預設管理員帳號資訊
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@shopee2multi.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@2024!';
const ADMIN_NAME = process.env.ADMIN_NAME || '系統管理員';

async function seedAdmin() {
  try {
    console.log('🌱 開始創建管理員帳號...');

    // 檢查管理員是否已存在
    const existingAdmin = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [ADMIN_EMAIL]
    );

    if (existingAdmin.rows.length > 0) {
      // 如果已存在，更新為管理員
      const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await pool.query(
        `UPDATE users 
         SET password_hash = $1, role = 'admin', status = 'active', updated_at = CURRENT_TIMESTAMP 
         WHERE email = $2`,
        [hash, ADMIN_EMAIL]
      );
      console.log('✅ 管理員帳號已更新');
    } else {
      // 創建新管理員
      const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await pool.query(
        `INSERT INTO users (email, password_hash, name, plan, status, role) 
         VALUES ($1, $2, $3, 'biz', 'active', 'admin') 
         RETURNING id, email, name, plan, status, role`,
        [ADMIN_EMAIL, hash, ADMIN_NAME]
      );
      console.log('✅ 管理員帳號已創建');
    }

    console.log('\n📋 管理員帳號資訊：');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email:     ${ADMIN_EMAIL}`);
    console.log(`🔑 Password:  ${ADMIN_PASSWORD}`);
    console.log(`👤 Name:      ${ADMIN_NAME}`);
    console.log(`👑 Role:      admin`);
    console.log(`💎 Plan:      biz (商業版)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  請妥善保管此帳號資訊，登入後請立即修改密碼！');
    console.log('💡 提示：您可以通過環境變數設定管理員帳號：');
    console.log('   ADMIN_EMAIL=your-email@example.com');
    console.log('   ADMIN_PASSWORD=your-secure-password');
    console.log('   ADMIN_NAME=管理員名稱\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ 創建管理員帳號失敗:', error);
    process.exit(1);
  }
}

// 執行 seed
seedAdmin();

