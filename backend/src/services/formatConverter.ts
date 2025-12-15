import { ShopeeProduct } from './shopeeParser';

export type TargetPlatform = 'momo' | 'pchome' | 'coupang' | 'yahoo';

export interface ConvertedProduct {
  title: string;
  description: string;
  price: number;
  specifications: Record<string, any>;
  images: string[];
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
