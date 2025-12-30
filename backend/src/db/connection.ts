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
console.log(`   PGPORT: ${process.env.PGPORT || 'Not set'}`);
console.log(`   PGUSER: ${process.env.PGUSER || 'Not set'}`);
console.log(`   PGPASSWORD: ${process.env.PGPASSWORD ? '✅ Set' : '❌ Not set'}`);

// 支援 DATABASE_URL（Railway 等平台常用）或單獨的環境變數
let dbConfig;

if (process.env.DATABASE_URL) {
  // 使用 DATABASE_URL 連接字串
  console.log('📝 Using DATABASE_URL for connection');
  
  // 解析 DATABASE_URL 以顯示連接資訊（不顯示密碼）
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log(`   Host: ${url.hostname}`);
    console.log(`   Port: ${url.port || '5432'}`);
    console.log(`   Database: ${url.pathname.slice(1)}`);
    console.log(`   User: ${url.username}`);
  } catch (e) {
    console.warn('⚠️  Could not parse DATABASE_URL format');
  }
  
  dbConfig = {
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000, // 增加到 30 秒
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  };
} else {
  // 使用單獨的環境變數（優先使用 Railway 的 PGHOST 等，然後是自定義的 DB_*）
  const host = process.env.PGHOST || process.env.DB_HOST;
  const port = parseInt(process.env.PGPORT || process.env.DB_PORT || '5432');
  const database = process.env.PGDATABASE || process.env.DB_NAME;
  const user = process.env.PGUSER || process.env.DB_USER;
  const password = process.env.PGPASSWORD || process.env.DB_PASSWORD;
  
  // 檢查是否所有必要的環境變數都已設置
  if (!host || !database || !user || !password) {
    console.error('❌ Missing required database environment variables!');
    console.error('   Required: PGHOST (or DB_HOST), PGDATABASE (or DB_NAME), PGUSER (or DB_USER), PGPASSWORD (or DB_PASSWORD)');
    console.error('   Or set DATABASE_URL instead');
    console.error('💡 In Railway:');
    console.error('   1. Ensure PostgreSQL database service is created');
    console.error('   2. Connect database service to backend service (Settings → Connect)');
    console.error('   3. Railway will automatically provide PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD');
    console.error('   4. Or manually set DATABASE_URL in backend service Variables');
    
    // 使用默認值（僅用於開發環境，生產環境會失敗）
    console.warn('⚠️  Using default values (will fail in production)');
    dbConfig = {
      host: host || 'localhost',
      port,
      database: database || 'shopee2multi',
      user: user || 'user',
      password: password || 'password',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };
  } else {
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
      connectionTimeoutMillis: 30000, // 增加到 30 秒
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };
  }
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
      console.error('   2. 確認資料庫服務正在運行（Railway Dashboard → 資料庫服務 → 檢查狀態）');
      console.error('   3. 確認資料庫連接字串格式正確（應為 postgresql://user:password@host:port/database）');
      console.error('   4. 在 Railway 上，確保資料庫服務已連接到後端服務（Settings → Connect）');
      console.error('   5. 檢查 Railway 資料庫服務的日誌，確認服務正常運行');
      console.error('   6. 如果使用 Railway，確認資料庫服務和後端服務在同一個專案中');
      console.error('   7. 嘗試重新連接資料庫服務到後端服務');
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
