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
    // Momo requires HTML description
    const htmlDescription = this.createMomoDescription(product);

    // Convert single-layer specs to momo format
    const momoSpecs: Record<string, any> = {};
    if (product.variants.length > 0) {
      momoSpecs['規格'] = product.variants.map(v => v.name).join(', ');
    }

    return {
      title: product.title,
      description: htmlDescription,
      price: product.price,
      specifications: momoSpecs,
      images: product.images,
      category: product.category || '',
      brand: product.brand || ''
    };
  }

  static convertToPChome(product: ShopeeProduct): ConvertedProduct {
    // PChome requires two-layer specifications
    const pchomeSpecs = this.convertToTwoLayerSpecs(product);

    return {
      title: product.title,
      description: product.description,
      price: product.price,
      specifications: pchomeSpecs,
      images: product.images,
      category: product.category || '',
      brand: product.brand || ''
    };
  }

  static convertToCoupang(product: ShopeeProduct): ConvertedProduct {
    // Coupang format (future implementation)
    return {
      title: product.title,
      description: product.description,
      price: product.price,
      specifications: {},
      images: product.images
    };
  }

  static convertToYahoo(product: ShopeeProduct): ConvertedProduct {
    // Yahoo format (future implementation)
    return {
      title: product.title,
      description: product.description,
      price: product.price,
      specifications: {},
      images: product.images
    };
  }

  static convertToEasystore(product: ShopeeProduct): ConvertedProduct {
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

    return {
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
  }

  private static createEasystoreDescription(product: ShopeeProduct): string {
    let html = '<div class="easystore-product-description">';
    
    // Main description
    if (product.description) {
      // Preserve line breaks and format
      const formattedDesc = product.description
        .replace(/\n/g, '<br>')
        .replace(/\r/g, '');
      html += `<div class="product-description">${formattedDesc}</div>`;
    }

    // Product specifications
    if (Object.keys(product.specifications).length > 0) {
      html += '<div class="product-specifications"><h3>商品規格</h3><table style="width: 100%; border-collapse: collapse;">';
      for (const [key, value] of Object.entries(product.specifications)) {
        html += `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">${key}</td>`;
        html += `<td style="padding: 8px; border: 1px solid #ddd;">${value}</td></tr>`;
      }
      html += '</table></div>';
    }

    // Variants
    if (product.variants.length > 0) {
      html += '<div class="product-variants"><h3>商品選項</h3><ul>';
      product.variants.forEach(variant => {
        html += `<li>${variant.name}`;
        if (variant.price && variant.price !== product.price) {
          html += ` - NT$ ${variant.price}`;
        }
        if (variant.stock !== undefined) {
          html += ` (庫存: ${variant.stock})`;
        }
        html += '</li>';
      });
      html += '</ul></div>';
    }

    // Images gallery
    if (product.images && product.images.length > 0) {
      html += '<div class="product-images"><h3>商品圖片</h3>';
      product.images.forEach((img, index) => {
        html += `<img src="${img}" alt="${product.title} - 圖片 ${index + 1}" style="max-width: 100%; margin: 10px 0;" />`;
      });
      html += '</div>';
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
