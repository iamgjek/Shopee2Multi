import { pool } from './connection';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * 添加聯絡表單表的遷移腳本
 * 這個腳本會檢查 contact_submissions 表是否存在，如果不存在則創建它
 */
async function addContactTable() {
  try {
    console.log('🔍 [聯絡表單遷移] 檢查 contact_submissions 表...');
    
    // 檢查表是否存在
    const checkResult = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'contact_submissions'
      );
    `);
    
    const tableExists = checkResult.rows[0].exists;
    
    if (tableExists) {
      console.log('✅ [聯絡表單遷移] contact_submissions 表已存在，跳過遷移');
      await pool.end();
      process.exit(0);
    }
    
    console.log('📝 [聯絡表單遷移] contact_submissions 表不存在，開始創建...');
    
    // 讀取 SQL 文件
    const possiblePaths = [
      join(__dirname, 'add-contact-table.sql'),
      join(__dirname, '../src/db/add-contact-table.sql'),
      join(__dirname, '../../src/db/add-contact-table.sql'),
      join(process.cwd(), 'src/db/add-contact-table.sql'),
      join(process.cwd(), 'backend/src/db/add-contact-table.sql'),
    ];
    
    let sqlPath: string | null = null;
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        sqlPath = path;
        console.log(`📄 [聯絡表單遷移] 找到 SQL 文件: ${path}`);
        break;
      }
    }
    
    if (!sqlPath) {
      throw new Error(`無法找到 add-contact-table.sql 文件`);
    }
    
    const sql = readFileSync(sqlPath, 'utf-8');
    
    // 分割並執行 SQL 語句
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 [聯絡表單遷移] 執行 ${statements.length} 個 SQL 語句...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await pool.query(statement);
          console.log(`✅ [聯絡表單遷移] 語句 ${i + 1}/${statements.length} 執行成功`);
        } catch (err: any) {
          // 忽略 "already exists" 錯誤
          if (err.code === '42P07' || err.code === '23505') {
            console.log(`⚠️  [聯絡表單遷移] 語句 ${i + 1}/${statements.length} 已存在，跳過`);
          } else {
            console.error(`❌ [聯絡表單遷移] 語句 ${i + 1} 執行失敗:`, err.message);
            throw err;
          }
        }
      }
    }
    
    console.log('✅ [聯絡表單遷移] 遷移完成');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ [聯絡表單遷移] 遷移失敗:', error);
    await pool.end();
    process.exit(1);
  }
}

addContactTable();

