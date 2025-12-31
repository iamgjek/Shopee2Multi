import ExcelJS from 'exceljs';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function readEasyStoreTemplate(): Promise<string[]> {
  try {
    const templatePath = join(process.cwd(), 'docs', 'Easystore_import_products_template_zh_TW.xlsx');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    
    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      throw new Error('Worksheet not found');
    }
    
    // Get first row as headers
    const headers: string[] = [];
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      if (cell.value) {
        headers.push(String(cell.value).trim());
      }
    });
    
    console.log(`[readEasyStoreTemplate] 讀取到 ${headers.length} 個欄位:`, headers);
    return headers;
  } catch (error) {
    console.error('Error reading template:', error);
    // Return EasyStore default headers (Handle, Title, Meta Description, Body (HTML))
    return [
      'Handle',
      'Title',
      'Meta Description',
      'Body (HTML)'
    ];
  }
}

