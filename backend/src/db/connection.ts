import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// 調試：顯示可用的環境變數（不顯示敏感信息）
console.log('🔍 Database connection configuration:');
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Not set'}`);
console.log(`   PGHOST: ${process.env.PGHOST || 'Not set'}`);
console.log(`   DB_HOST: ${process.env.DB_HOST || 'Not set'}`);
console.log(`   PGDATABASE: ${process.env.PGDATABASE || 'Not set'}`);
console.log(`   DB_NAME: ${process.env.DB_NAME || 'Not set'}`);

// 支援 DATABASE_URL（Railway 等平台常用）或單獨的環境變數
let dbConfig;

if (process.env.DATABASE_URL) {
  // 使用 DATABASE_URL 連接字串
  console.log('📝 Using DATABASE_URL for connection');
  dbConfig = {
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
} else {
  // 使用單獨的環境變數（也支援 Railway 的 PGHOST 等）
  const host = process.env.DB_HOST || process.env.PGHOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || process.env.PGPORT || '5432');
  const database = process.env.DB_NAME || process.env.PGDATABASE || 'shopee2multi';
  const user = process.env.DB_USER || process.env.PGUSER || 'user';
  const password = process.env.DB_PASSWORD || process.env.PGPASSWORD || 'password';
  
  console.log('📝 Using individual environment variables for connection');
  console.log(`   Host: ${host}`);
  console.log(`   Port: ${port}`);
  console.log(`   Database: ${database}`);
  console.log(`   User: ${user}`);
  console.log(`   Password: ${password ? '✅ Set' : '❌ Not set'}`);
  
  dbConfig = {
    host,
    port,
    database,
    user,
    password,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
}

export const pool = new Pool(dbConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Test connection (non-blocking - won't prevent server from starting)
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('⚠️  Server will continue running, but database operations may fail');
    if ('connectionString' in dbConfig) {
      console.error('📋 Using DATABASE_URL connection string');
      console.error('💡 Troubleshooting:');
      console.error('   1. 檢查 DATABASE_URL 環境變數是否正確設置');
      console.error('   2. 確認資料庫服務正在運行');
      console.error('   3. 確認資料庫連接字串格式正確');
      console.error('   4. 在 Railway 上，確保資料庫服務已連接到後端服務');
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
