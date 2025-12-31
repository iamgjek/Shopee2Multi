import { pool } from './connection';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * 自動遷移腳本 - 在服務啟動時檢查並創建資料庫表
 * 使用 IF NOT EXISTS 語句，安全地執行遷移
 */
export async function autoMigrate(): Promise<void> {
  try {
    console.log('🔍 [自動遷移] 檢查資料庫表...');
    
    // 檢查 users 表是否存在
    const checkResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);
    
    const usersTableExists = checkResult.rows[0].exists;
    
    if (usersTableExists) {
      console.log('✅ [自動遷移] 資料庫表已存在，跳過遷移');
      return;
    }
    
    console.log('📝 [自動遷移] 資料庫表不存在，開始執行遷移...');
    
    // 嘗試多個可能的路徑來找到 schema.sql
    // 在開發環境中，文件在 src/db/schema.sql
    // 在生產環境中（Railway），需要從源目錄讀取（因為 TypeScript 不會複製 .sql 文件）
    // __dirname 在編譯後指向 dist/db/，所以需要向上查找源文件
    const possiblePaths = [
      join(__dirname, 'schema.sql'),                    // dist/db/schema.sql (如果文件被複製)
      join(__dirname, '../src/db/schema.sql'),        // dist/db/../src/db/schema.sql (最可能)
      join(__dirname, '../../src/db/schema.sql'),      // dist/db/../../src/db/schema.sql
      join(process.cwd(), 'src/db/schema.sql'),       // 從項目根目錄 (Railway: /app/src/db/schema.sql)
      join(process.cwd(), 'backend/src/db/schema.sql'), // 如果從項目根目錄運行
      join(process.cwd(), 'dist/db/schema.sql'),       // 如果文件被複製到 dist
    ];
    
    // 調試：輸出所有嘗試的路徑
    console.log(`🔍 [自動遷移] 查找 schema.sql 文件...`);
    console.log(`   __dirname: ${__dirname}`);
    console.log(`   process.cwd(): ${process.cwd()}`);
    console.log(`   嘗試的路徑: ${possiblePaths.join(', ')}`);
    
    let schemaPath: string | null = null;
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        schemaPath = path;
        console.log(`📄 [自動遷移] 找到 schema.sql: ${path}`);
        break;
      }
    }
    
    if (!schemaPath) {
      throw new Error(`無法找到 schema.sql 文件。嘗試的路徑: ${possiblePaths.join(', ')}`);
    }
    
    // 讀取 schema.sql
    const schema = readFileSync(schemaPath, 'utf-8');
    
    // 分割 SQL 語句
    const statements = schema
      .split('\n')
      .map(line => {
        const commentIndex = line.indexOf('--');
        if (commentIndex >= 0) {
          return line.substring(0, commentIndex).trim();
        }
        return line.trim();
      })
      .filter(line => line.length > 0)
      .join('\n')
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    console.log(`📝 [自動遷移] 執行 ${statements.length} 個 SQL 語句...`);
    
    // 執行每個語句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await pool.query(statement);
          console.log(`✅ [自動遷移] 語句 ${i + 1}/${statements.length} 執行成功`);
        } catch (err: any) {
          // 忽略 "already exists" 錯誤（IF NOT EXISTS 語句）
          if (err.code === '42P07' || err.code === '23505') {
            console.log(`⚠️  [自動遷移] 語句 ${i + 1}/${statements.length} 已存在，跳過`);
          } else {
            console.error(`❌ [自動遷移] 語句 ${i + 1} 執行失敗:`, err.message);
            // 不拋出錯誤，繼續執行其他語句
          }
        }
      }
    }
    
    console.log('✅ [自動遷移] 資料庫遷移完成');
  } catch (error) {
    console.error('❌ [自動遷移] 遷移失敗:', error);
    // 不拋出錯誤，允許服務繼續啟動
    // 如果遷移失敗，管理員可以手動執行遷移
  }
}

