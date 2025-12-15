import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'shopee2multi',
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // 增加到 10 秒
};

export const pool = new Pool(dbConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('📋 Connection details:');
    console.error(`   Host: ${dbConfig.host}`);
    console.error(`   Port: ${dbConfig.port}`);
    console.error(`   Database: ${dbConfig.database}`);
    console.error(`   User: ${dbConfig.user}`);
    console.error('💡 Troubleshooting:');
    console.error('   1. 確認 PostgreSQL 服務正在運行');
    console.error('   2. 檢查 .env 中的資料庫連線資訊是否正確');
    console.error('   3. 確認資料庫使用者權限');
    console.error('   4. 確認資料庫 "shopee2multi" 已建立');
  } else {
    console.log('✅ Database connected successfully');
  }
});
