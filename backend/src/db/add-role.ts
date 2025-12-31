import { pool } from './connection';
import dotenv from 'dotenv';

dotenv.config();

async function addRoleColumn() {
  try {
    console.log('🔧 開始添加 role 欄位...');

    // 檢查欄位是否存在
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `);

    if (checkResult.rows.length > 0) {
      console.log('✅ role 欄位已存在');
    } else {
      // 添加 role 欄位
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN role VARCHAR(50) DEFAULT 'user' 
        CHECK (role IN ('user', 'admin'))
      `);
      console.log('✅ role 欄位已添加');
    }

    // 更新現有用戶的 role
    const updateResult = await pool.query(`
      UPDATE users SET role = 'user' WHERE role IS NULL
    `);
    console.log(`✅ 已更新 ${updateResult.rowCount} 位用戶的 role`);

    // 驗證
    const verifyResult = await pool.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `);

    if (verifyResult.rows.length > 0) {
      console.log('\n📋 欄位資訊：');
      console.log(verifyResult.rows[0]);
    }

    console.log('\n✅ 完成！現在可以執行 npm run seed 來創建管理員帳號');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ 添加 role 欄位失敗:', error);
    await pool.end();
    process.exit(1);
  }
}

addRoleColumn();

