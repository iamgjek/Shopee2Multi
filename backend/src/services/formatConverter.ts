import { ShopeeProduct } from './shopeeParser';

export type TargetPlatform = 'momo' | 'pchome' | 'coupang' | 'yahoo' | 'easystore';

export interface ConvertedProduct {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  specifications: Record<string, any>;
  images: string[];
  material?: string;
  [key: string]: any;
}

export class FormatConverter {
  static convertToMomo(product: ShopeeProduct): ConvertedProduct {
    console.log(`      [FormatConverter] 轉換為 Momo 格式...`);
    // Momo requires HTML description
    const htmlDescription = this.createMomoDescription(product);

    // Convert single-layer specs to momo format
    const momoSpecs: Record<string, any> = {};
    if (product.variants.length > 0) {
      momoSpecs['規格'] = product.variants.map(v => v.name).join(', ');
    }

    const converted = {
      title: product.title,
      description: htmlDescription,
      price: product.price,
      specifications: momoSpecs,
      images: product.images,
      category: product.category || '',
      brand: product.brand || ''
    };
    console.log(`      [FormatConverter] ✅ Momo 格式轉換完成`);
    return converted;
  }

  static convertToPChome(product: ShopeeProduct): ConvertedProduct {
    console.log(`      [FormatConverter] 轉換為 PChome 格式...`);
    // PChome requires two-layer specifications
    const pchomeSpecs = this.convertToTwoLayerSpecs(product);

    const converted = {
      title: product.title,
      description: product.description,
      price: product.price,
      specifications: pchomeSpecs,
      images: product.images,
      category: product.category || '',
      brand: product.brand || ''
    };
    console.log(`      [FormatConverter] ✅ PChome 格式轉換完成`);
    return converted;
  }

  static convertToCoupang(product: ShopeeProduct): ConvertedProduct {
    console.log(`      [FormatConverter] 轉換為 Coupang 格式...`);
    // Coupang format (future implementation)
    const converted = {
      title: product.title,
      description: product.description,
      price: product.price,
      specifications: {},
      images: product.images
    };
    console.log(`      [FormatConverter] ✅ Coupang 格式轉換完成`);
    return converted;
  }

  static convertToYahoo(product: ShopeeProduct): ConvertedProduct {
    console.log(`      [FormatConverter] 轉換為 Yahoo 格式...`);
    // Yahoo format (future implementation)
    const converted = {
      title: product.title,
      description: product.description,
      price: product.price,
      specifications: {},
      images: product.images
    };
    console.log(`      [FormatConverter] ✅ Yahoo 格式轉換完成`);
    return converted;
  }

  static convertToEasystore(product: ShopeeProduct): ConvertedProduct {
    console.log(`      [FormatConverter] 轉換為 EasyStore 格式...`);
    // EasyStore format - similar to Shopify, supports HTML description and variants
    const htmlDescription = this.createEasystoreDescription(product);
    
    // EasyStore uses variant-based specifications
    const easystoreSpecs: Record<string, any> = {};
    if (product.variants.length > 0) {
      easystoreSpecs['variants'] = product.variants.map((v, index) => ({
        name: v.name,
        price: v.price || product.price,
        sku: v.sku || `${product.sku || 'SKU'}-${index + 1}`,
        inventory: v.stock || 0
      }));
    }

    // Extract material from specifications or description
    let material = product.material || '';
    if (!material && product.specifications) {
      for (const [key, value] of Object.entries(product.specifications)) {
        if (key.includes('材質') || key.includes('材料') || key.toLowerCase().includes('material')) {
          material = value;
          break;
        }
      }
    }
    if (!material && product.description) {
      const materialMatch = product.description.match(/(?:材質|材料|Material)[:：]\s*([^\n,，]+)/i);
      if (materialMatch) {
        material = materialMatch[1].trim();
      }
    }

    const converted = {
      title: product.title,
      description: htmlDescription,
      price: product.price,
      originalPrice: product.originalPrice,
      specifications: easystoreSpecs,
      images: product.images,
      category: product.category || '',
      brand: product.brand || '',
      sku: product.sku || '',
      weight: product.weight || 0,
      tags: product.tags || [],
      material: material
    };
    console.log(`      [FormatConverter] ✅ EasyStore 格式轉換完成`);
    return converted;
  }

  private static createEasystoreDescription(product: ShopeeProduct): string {
    let html = '<div class="easystore-product-description">';
    
    // Main description
    if (product.description) {
      // Preserve line breaks and format, escape HTML
      const escapeHtml = (text: string) => {
        const map: Record<string, string> = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, (m) => map[m]);
      };
      
      const formattedDesc = product.description
        .split('\n')
        .map(line => escapeHtml(line.trim()))
        .filter(line => line.length > 0)
        .join('<br>');
      html += `<div class="product-description"><p>${formattedDesc}</p></div>`;
    }

    // Product specifications table
    if (Object.keys(product.specifications).length > 0) {
      html += '<div class="product-specifications"><h3>商品規格</h3><table style="width: 100%; border-collapse: collapse; margin: 20px 0;">';
      for (const [key, value] of Object.entries(product.specifications)) {
        const escapedKey = key.replace(/[&<>"']/g, (m) => {
          const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
          return map[m];
        });
        const escapedValue = String(value).replace(/[&<>"']/g, (m) => {
          const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
          return map[m];
        });
        html += `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #f5f5f5;">${escapedKey}</td>`;
        html += `<td style="padding: 8px; border: 1px solid #ddd;">${escapedValue}</td></tr>`;
      }
      html += '</table></div>';
    }

    // Variants/Options
    if (product.variants.length > 0) {
      html += '<div class="product-variants"><h3>商品選項</h3><ul style="list-style: none; padding: 0;">';
      product.variants.forEach(variant => {
        const variantName = variant.name.replace(/[&<>"']/g, (m) => {
          const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
          return map[m];
        });
        html += '<li style="padding: 8px 0; border-bottom: 1px solid #eee;">';
        html += `<strong>${variantName}</strong>`;
        if (variant.price && variant.price !== product.price) {
          html += ` - <span style="color: #e74c3c; font-weight: bold;">NT$ ${variant.price}</span>`;
        }
        if (variant.stock !== undefined && variant.stock > 0) {
          html += ` <span style="color: #27ae60;">(庫存: ${variant.stock})</span>`;
        }
        html += '</li>';
      });
      html += '</ul></div>';
    }

    // Product details
    html += '<div class="product-details" style="margin: 20px 0;">';
    if (product.brand) {
      html += `<p><strong>品牌:</strong> ${product.brand.replace(/[&<>"']/g, (m) => {
        const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return map[m];
      })}</p>`;
    }
    if (product.material) {
      html += `<p><strong>材質:</strong> ${product.material.replace(/[&<>"']/g, (m) => {
        const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return map[m];
      })}</p>`;
    }
    if (product.weight && product.weight > 0) {
      html += `<p><strong>重量:</strong> ${product.weight} kg</p>`;
    }
    html += '</div>';

    // Images gallery
    if (product.images && product.images.length > 0) {
      html += '<div class="product-images"><h3>商品圖片</h3><div style="display: flex; flex-wrap: wrap; gap: 10px; margin: 20px 0;">';
      product.images.forEach((img, index) => {
        html += `<img src="${img.replace(/&/g, '&amp;')}" alt="${(product.title || '商品').replace(/[&<>"']/g, (m) => {
          const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
          return map[m];
        })} - 圖片 ${index + 1}" style="max-width: 300px; height: auto; border: 1px solid #ddd; border-radius: 4px;" />`;
      });
      html += '</div></div>';
    }

    html += '</div>';
    return html;
  }

  private static createMomoDescription(product: ShopeeProduct): string {
    let html = '<div>';
    
    if (product.description) {
      html += `<p>${product.description}</p>`;
    }

    if (product.variants.length > 0) {
      html += '<h3>商品規格</h3><ul>';
      product.variants.forEach(variant => {
        html += `<li>${variant.name}</li>`;
      });
      html += '</ul>';
    }

    html += '</div>';
    return html;
  }

  private static convertToTwoLayerSpecs(product: ShopeeProduct): Record<string, any> {
    // Convert single-layer Shopee specs to PChome two-layer format
    // Example: "顏色: 紅色, 尺寸: L" -> { "顏色": ["紅色"], "尺寸": ["L"] }
    const twoLayer: Record<string, string[]> = {};

    product.variants.forEach(variant => {
      // Try to parse variant name (e.g., "紅色-L" or "顏色:紅色,尺寸:L")
      const parts = variant.name.split(/[,\-]/);
      parts.forEach(part => {
        const trimmed = part.trim();
        if (trimmed.includes(':')) {
          const [key, value] = trimmed.split(':').map(s => s.trim());
          if (!twoLayer[key]) {
            twoLayer[key] = [];
          }
          if (!twoLayer[key].includes(value)) {
            twoLayer[key].push(value);
          }
        } else {
          // Default grouping
          if (!twoLayer['規格']) {
            twoLayer['規格'] = [];
          }
          if (!twoLayer['規格'].includes(trimmed)) {
            twoLayer['規格'].push(trimmed);
          }
        }
      });
    });

    return twoLayer;
  }
}
