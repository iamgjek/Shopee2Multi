import ExcelJS from 'exceljs';
import { ConvertedProduct } from './formatConverter';
import { TargetPlatform } from './formatConverter';

export class ExcelExporter {
  static async exportToExcel(
    products: ConvertedProduct[],
    platform: TargetPlatform
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('商品清單');

    // Set headers based on platform
    const headers = this.getHeadersForPlatform(platform);
    worksheet.addRow(headers);

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
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      if (column.header) {
        column.width = 20;
      }
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  private static getHeadersForPlatform(platform: TargetPlatform): string[] {
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
        case '分類':
          row.push(product.category || '');
          break;
        case '品牌':
          row.push(product.brand || '');
          break;
        default:
          row.push('');
      }
    });

    return row;
  }
}
