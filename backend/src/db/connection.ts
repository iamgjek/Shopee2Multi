import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// 支援 DATABASE_URL（Railway 等平台常用）或單獨的環境變數
let dbConfig;

if (process.env.DATABASE_URL) {
  // 使用 DATABASE_URL 連接字串
  dbConfig = {
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
} else {
  // 使用單獨的環境變數（也支援 Railway 的 PGHOST 等）
  dbConfig = {
    host: process.env.DB_HOST || process.env.PGHOST || 'localhost',
    port: parseInt(process.env.DB_PORT || process.env.PGPORT || '5432'),
    database: process.env.DB_NAME || process.env.PGDATABASE || 'shopee2multi',
    user: process.env.DB_USER || process.env.PGUSER || 'user',
    password: process.env.DB_PASSWORD || process.env.PGPASSWORD || 'password',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
}

export const pool = new Pool(dbConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Test connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    if ('connectionString' in dbConfig) {
      console.error('📋 Using DATABASE_URL connection string');
      console.error('💡 Troubleshooting:');
      console.error('   1. 檢查 DATABASE_URL 環境變數是否正確設置');
      console.error('   2. 確認資料庫服務正在運行');
      console.error('   3. 確認資料庫連接字串格式正確');
    } else {
      console.error('📋 Connection details:');
      console.error(`   Host: ${dbConfig.host}`);
      console.error(`   Port: ${dbConfig.port}`);
      console.error(`   Database: ${dbConfig.database}`);
      console.error(`   User: ${dbConfig.user}`);
      console.error('💡 Troubleshooting:');
      console.error('   1. 確認 PostgreSQL 服務正在運行');
      console.error('   2. 檢查環境變數是否正確設置（DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD）');
      console.error('   3. 在 Railway 上，確保已設置環境變數或使用 DATABASE_URL');
      console.error('   4. 確認資料庫使用者權限');
    }
  } else {
    console.log('✅ Database connected successfully');
  }
});
