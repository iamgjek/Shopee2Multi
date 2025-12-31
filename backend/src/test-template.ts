import { readEasyStoreTemplate } from './utils/readExcelTemplate';

async function testTemplate() {
  try {
    console.log('📋 測試讀取 EasyStore 範本...');
    const headers = await readEasyStoreTemplate();
    console.log('\n✅ 成功讀取範本欄位：');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    headers.forEach((header, index) => {
      console.log(`${(index + 1).toString().padStart(2, ' ')}. ${header}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n總共 ${headers.length} 個欄位\n`);
    process.exit(0);
  } catch (error) {
    console.error('❌ 讀取範本失敗:', error);
    process.exit(1);
  }
}

testTemplate();

