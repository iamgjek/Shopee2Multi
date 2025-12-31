import { pool } from './connection';
import bcrypt from 'bcryptjs';

/**
 * 自動創建管理員帳號 - 在服務啟動時執行
 * 通過環境變數配置管理員信息
 */
export async function autoSeedAdmin(): Promise<void> {
  try {
    // 檢查是否啟用自動創建管理員
    const AUTO_SEED_ADMIN = process.env.AUTO_SEED_ADMIN === 'true' || process.env.AUTO_SEED_ADMIN === '1';
    
    if (!AUTO_SEED_ADMIN) {
      console.log('ℹ️  [自動Seed] AUTO_SEED_ADMIN 未啟用，跳過管理員創建');
      return;
    }

    // 從環境變數獲取管理員信息
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@shopee2multi.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@2024!';
    const ADMIN_NAME = process.env.ADMIN_NAME || '系統管理員';

    console.log('🌱 [自動Seed] 開始創建管理員帳號...');
    console.log(`   Email: ${ADMIN_EMAIL}`);

    // 檢查管理員是否已存在
    const existingAdmin = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [ADMIN_EMAIL]
    );

    if (existingAdmin.rows.length > 0) {
      // 如果已存在，更新為管理員（確保角色和計劃正確）
      const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await pool.query(
        `UPDATE users 
         SET password_hash = $1, role = 'admin', plan = 'biz', status = 'active', updated_at = CURRENT_TIMESTAMP 
         WHERE email = $2`,
        [hash, ADMIN_EMAIL]
      );
      console.log(`✅ [自動Seed] 管理員帳號已更新: ${ADMIN_EMAIL}`);
    } else {
      // 創建新管理員
      const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await pool.query(
        `INSERT INTO users (email, password_hash, name, plan, status, role) 
         VALUES ($1, $2, $3, 'biz', 'active', 'admin') 
         RETURNING id, email, name, plan, status, role`,
        [ADMIN_EMAIL, hash, ADMIN_NAME]
      );
      console.log(`✅ [自動Seed] 管理員帳號已創建: ${ADMIN_EMAIL}`);
    }

    console.log('\n📋 [自動Seed] 管理員帳號資訊：');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email:     ${ADMIN_EMAIL}`);
    console.log(`🔑 Password:  ${ADMIN_PASSWORD}`);
    console.log(`👤 Name:      ${ADMIN_NAME}`);
    console.log(`👑 Role:      admin`);
    console.log(`💎 Plan:      biz (商業版)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  請妥善保管此帳號資訊，登入後請立即修改密碼！\n');
  } catch (error) {
    console.error('❌ [自動Seed] 創建管理員帳號失敗:', error);
    // 不拋出錯誤，允許服務繼續啟動
    // 管理員可以手動執行 seed 腳本
  }
}

