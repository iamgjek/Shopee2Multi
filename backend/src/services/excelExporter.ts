import ExcelJS from 'exceljs';
import { ConvertedProduct } from './formatConverter';
import { TargetPlatform } from './formatConverter';

export class ExcelExporter {
  static async exportToExcel(
    products: ConvertedProduct[],
    platform: TargetPlatform
  ): Promise<Buffer> {
    console.log(`      [ExcelExporter] 開始生成 Excel 檔案 (平台: ${platform}, 商品數: ${products.length})...`);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('商品清單');

    // Set headers based on platform
    const headers = await this.getHeadersForPlatform(platform);
    worksheet.addRow(headers);
    console.log(`      [ExcelExporter] 已設定表頭: ${headers.length} 欄`);

    // Style headers
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add product data
    products.forEach((product, index) => {
      const row = this.mapProductToRow(product, platform, headers);
      worksheet.addRow(row);
      console.log(`      [ExcelExporter] 已添加商品 ${index + 1}: ${product.title.substring(0, 30)}...`);
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      if (column.header) {
        column.width = 20;
      }
    });

    // Generate buffer
    console.log(`      [ExcelExporter] 正在生成 Excel 緩衝區...`);
    const buffer = await workbook.xlsx.writeBuffer();
    const bufferSize = Buffer.from(buffer).length;
    console.log(`      [ExcelExporter] ✅ Excel 檔案生成完成, 大小: ${(bufferSize / 1024).toFixed(2)} KB`);
    return Buffer.from(buffer);
  }

  private static async getHeadersForPlatform(platform: TargetPlatform): Promise<string[]> {
    switch (platform) {
      case 'momo':
        return [
          '商品名稱',
          '商品描述',
          '售價',
          '規格',
          '圖片1',
          '圖片2',
          '圖片3',
          '分類',
          '品牌'
        ];
      case 'pchome':
        return [
          '商品名稱',
          '商品描述',
          '售價',
          '規格層級1',
          '規格層級2',
          '圖片1',
          '圖片2',
          '圖片3',
          '分類',
          '品牌'
        ];
      case 'easystore':
        // Try to read from template, fallback to default
        try {
          const { readEasyStoreTemplate } = require('../utils/readExcelTemplate');
          const templateHeaders = await readEasyStoreTemplate();
          if (templateHeaders && templateHeaders.length > 0) {
            console.log(`      [ExcelExporter] 使用範本欄位: ${templateHeaders.join(', ')}`);
            return templateHeaders;
          }
        } catch (e) {
          console.log('      [ExcelExporter] 無法讀取範本，使用預設欄位');
        }
        // Default EasyStore headers (Handle, Title, Meta Description, Body (HTML))
        return [
          'Handle',
          'Title',
          'Meta Description',
          'Body (HTML)'
        ];
      default:
        return [
          '商品名稱',
          '商品描述',
          '售價',
          '規格',
          '圖片1',
          '圖片2',
          '圖片3'
        ];
    }
  }

  private static mapProductToRow(
    product: ConvertedProduct,
    platform: TargetPlatform,
    headers: string[]
  ): any[] {
    const row: any[] = [];

    headers.forEach((header) => {
      // EasyStore specific fields (Shopify format)
      if (platform === 'easystore') {
        switch (header.trim()) {
          case 'Handle':
            // Generate handle from title (URL-friendly slug)
            const handle = this.generateHandle(product.title || 'product');
            row.push(handle);
            break;
          case 'Title':
            row.push(product.title || '');
            break;
          case 'Meta Description':
            // Generate meta description from product info
            const metaDesc = this.generateMetaDescription(product);
            row.push(metaDesc);
            break;
          case 'Body (HTML)':
            // Use the HTML description
            row.push(product.description || '');
            break;
          case '規格變體':
          case '變體名稱':
          case '規格':
            if (product.specifications) {
              const specs = product.specifications as Record<string, any>;
              if (specs.variants && Array.isArray(specs.variants)) {
                // Format: "變體1; 變體2; 變體3"
                row.push(specs.variants.map((v: any) => v.name).join('; ') || '');
              } else {
                // Fallback: use specifications as JSON
                row.push(JSON.stringify(specs) || '');
              }
            } else {
              row.push('');
            }
            break;
          case '庫存':
            if (product.specifications) {
              const specs = product.specifications as Record<string, any>;
              if (specs.variants && Array.isArray(specs.variants)) {
                const totalInventory = specs.variants.reduce((sum: number, v: any) => sum + (v.inventory || 0), 0);
                row.push(totalInventory);
              } else {
                row.push(0);
              }
            } else {
              row.push(0);
            }
            break;
          default:
            // For other EasyStore headers, try to map from common fields
            ExcelExporter.handleEasyStoreDefaultHeader(header.trim(), product, row);
        }
        return;
      }

      // Other platforms
      switch (header) {
        case '商品名稱':
          row.push(product.title || '');
          break;
        case '商品描述':
          row.push(product.description || '');
          break;
        case '售價':
          row.push(product.price || 0);
          break;
        case '規格':
          row.push(
            typeof product.specifications === 'object'
              ? JSON.stringify(product.specifications)
              : product.specifications || ''
          );
          break;
        case '規格層級1':
        case '規格層級2':
          // For PChome two-layer specs
          if (platform === 'pchome' && product.specifications) {
            const specs = product.specifications as Record<string, string[]>;
            const keys = Object.keys(specs);
            if (header === '規格層級1') {
              row.push(keys[0] || '');
            } else {
              row.push(keys.length > 0 ? specs[keys[0]]?.join(',') || '' : '');
            }
          } else {
            row.push('');
          }
          break;
        case '圖片1':
          row.push(product.images?.[0] || '');
          break;
        case '圖片2':
          row.push(product.images?.[1] || '');
          break;
        case '圖片3':
          row.push(product.images?.[2] || '');
          break;
        case '圖片4':
          row.push(product.images?.[3] || '');
          break;
        case '圖片5':
          row.push(product.images?.[4] || '');
          break;
        case '原價':
          row.push(product.originalPrice || product.price || 0);
          break;
        case '分類':
          row.push(product.category || '');
          break;
        case '品牌':
          row.push(product.brand || '');
          break;
        case '材質':
          row.push(product.material || '');
          break;
        case 'SKU':
          row.push(product.sku || '');
          break;
        case '規格變體':
        case '變體名稱':
        case '規格':
          row.push(
            typeof product.specifications === 'object'
              ? JSON.stringify(product.specifications)
              : product.specifications || ''
          );
          break;
        case '庫存':
          // For non-easystore platforms, inventory is not tracked
          row.push(0);
          break;
        case '標籤':
          row.push(Array.isArray(product.tags) ? product.tags.join(', ') : '');
          break;
        case '重量(kg)':
          row.push(product.weight || 0);
          break;
        default:
          row.push('');
      }
    });

    return row;
  }

  // Generate URL-friendly handle from title
  private static generateHandle(title: string): string {
    if (!title) return 'product';
    
    // Convert to lowercase and handle Chinese characters
    let handle = title
      .toLowerCase()
      // Remove emoji and special characters but keep Chinese characters
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emoji
      .replace(/[^\w\s\u4e00-\u9fff-]/g, '') // Keep alphanumeric, Chinese, spaces, hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()
      .substring(0, 100) // Limit length
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    
    // If handle is empty after processing, generate from first few characters
    if (!handle || handle.length === 0) {
      handle = title
        .substring(0, 50)
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '');
    }
    
    return handle || 'product';
  }

  // Generate meta description from product info
  private static generateMetaDescription(product: ConvertedProduct): string {
    const parts: string[] = [];
    
    // Start with title (most important)
    if (product.title) {
      // Truncate title if too long
      const title = product.title.length > 80 
        ? product.title.substring(0, 77) + '...' 
        : product.title;
      parts.push(title);
    }
    
    // Add key features
    if (product.brand) {
      parts.push(`品牌: ${product.brand}`);
    }
    
    // Add price if available
    if (product.price && product.price > 0) {
      parts.push(`NT$ ${product.price}`);
    }
    
    // Add category if available and there's space
    if (product.category && parts.join(' | ').length < 120) {
      const category = product.category.split(' > ').pop() || product.category;
      if (category.length < 30) {
        parts.push(category);
      }
    }
    
    // Join and limit to 160 characters (SEO best practice)
    let metaDesc = parts.join(' | ');
    
    // If still too long, truncate intelligently
    if (metaDesc.length > 160) {
      metaDesc = metaDesc.substring(0, 157) + '...';
    }
    
    return metaDesc || (product.title || '商品描述');
  }

  // Handle EasyStore default headers (mapping from common product fields)
  private static handleEasyStoreDefaultHeader(header: string, product: ConvertedProduct, row: any[]): void {
    switch (header) {
      case '商品名稱':
      case 'Title':
        row.push(product.title || '');
        break;
      case '商品描述':
      case 'Body (HTML)':
        row.push(product.description || '');
        break;
      case '售價':
      case 'Variant Price':
        row.push(product.price || 0);
        break;
      case '原價':
      case 'Compare at Price':
        row.push(product.originalPrice || product.price || 0);
        break;
      case 'SKU':
        row.push(product.sku || '');
        break;
      case '分類':
      case 'Type':
        row.push(product.category || '');
        break;
      case '品牌':
      case 'Vendor':
        row.push(product.brand || '');
        break;
      case '材質':
      case 'Material':
        row.push(product.material || '');
        break;
      case '標籤':
      case 'Tags':
        row.push(Array.isArray(product.tags) ? product.tags.join(', ') : '');
        break;
      case '重量(kg)':
      case 'Weight':
        row.push(product.weight || 0);
        break;
      case '圖片1':
      case 'Image Src':
        row.push(product.images?.[0] || '');
        break;
      default:
        row.push('');
    }
  }
}
