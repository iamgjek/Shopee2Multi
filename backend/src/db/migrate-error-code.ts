import { pool } from './connection';

/**
 * 遷移腳本：將 usage_logs.error_code 欄位從 VARCHAR(100) 改為 TEXT
 * 以支援更長的錯誤訊息
 */
async function migrateErrorCodeColumn() {
  try {
    console.log('🔄 開始遷移 error_code 欄位...');

    // 檢查欄位當前類型
    const checkResult = await pool.query(`
      SELECT data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'usage_logs' AND column_name = 'error_code'
    `);

    if (checkResult.rows.length === 0) {
      console.log('⚠️  error_code 欄位不存在，跳過遷移');
      return;
    }

    const currentType = checkResult.rows[0].data_type;
    const maxLength = checkResult.rows[0].character_maximum_length;

    if (currentType === 'text' || (currentType === 'character varying' && maxLength === null)) {
      console.log('✅ error_code 欄位已經是 TEXT 類型，無需遷移');
      return;
    }

    console.log(`📝 當前類型: ${currentType}(${maxLength || 'N/A'})`);

    // 修改欄位類型為 TEXT
    await pool.query(`
      ALTER TABLE usage_logs 
      ALTER COLUMN error_code TYPE TEXT
    `);

    console.log('✅ error_code 欄位已成功改為 TEXT 類型');
  } catch (error) {
    console.error('❌ 遷移失敗:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// 執行遷移
migrateErrorCodeColumn()
  .then(() => {
    console.log('🎉 遷移完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 遷移失敗:', error);
    process.exit(1);
  });

