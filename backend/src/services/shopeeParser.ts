import { chromium, Browser, Page } from 'playwright';

export interface ShopeeProduct {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  specifications: Record<string, string>;
  variants: Array<{
    name: string;
    price: number;
    stock?: number;
    sku?: string;
  }>;
  category?: string;
  brand?: string;
  material?: string;
  weight?: number;
  tags?: string[];
  sku?: string;
}

export class ShopeeParser {
  private browser: Browser | null = null;

  async init() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  async parseProduct(url: string): Promise<ShopeeProduct> {
    await this.init();
    
    // Create context with user agent
    const context = await this.browser!.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      // Wait for product data to load
      await page.waitForSelector('[data-testid="product-detail"]', { timeout: 10000 }).catch(() => {});

      // Extract product information
      const product: ShopeeProduct = {
        title: '',
        description: '',
        price: 0,
        images: [],
        specifications: {},
        variants: []
      };

      // Wait for page to fully load
      await page.waitForTimeout(2000);

      // Try to extract from JSON-LD or page data
      try {
        const pageContent = await page.content();
        const jsonMatch = pageContent.match(/window\.__UNIVERSAL_DATA_FORCE_REVALIDATE__\s*=\s*({.+?});/);
        if (jsonMatch) {
          const data = JSON.parse(jsonMatch[1]);
          // Extract product data from Shopee's internal data structure
          if (data?.mainInfo?.itemInfo) {
            const itemInfo = data.mainInfo.itemInfo;
            product.title = itemInfo.name || product.title;
            product.price = itemInfo.price || product.price;
            product.originalPrice = itemInfo.priceBeforeDiscount;
            product.brand = itemInfo.brand || itemInfo.shopInfo?.brandName;
            product.category = itemInfo.catid ? String(itemInfo.catid) : undefined;
          }
        }
      } catch (e) {
        console.log('Could not parse JSON data, using DOM parsing');
      }

      // Title - try multiple selectors
      const titleSelectors = [
        'h1[data-testid="product-name"]',
        '.product-name',
        'h1.qaNIZv',
        'h1',
        '[class*="product-name"]',
        '[class*="ProductName"]'
      ];
      for (const selector of titleSelectors) {
        const titleElement = await page.$(selector);
        if (titleElement) {
          const text = await titleElement.textContent();
          if (text && text.trim()) {
            product.title = text.trim();
            break;
          }
        }
      }

      // Price - try multiple selectors
      const priceSelectors = [
        '[data-testid="product-price"]',
        '.product-price',
        '[class*="price"]',
        '.qaNIZv + div'
      ];
      for (const selector of priceSelectors) {
        const priceElement = await page.$(selector);
        if (priceElement) {
          const priceText = await priceElement.textContent();
          if (priceText) {
            const parsed = this.parsePrice(priceText);
            if (parsed > 0) {
              product.price = parsed;
              break;
            }
          }
        }
      }

      // Images - comprehensive extraction
      const imageSelectors = [
        'img[data-testid="product-image"]',
        '.product-image img',
        '[class*="product-image"] img',
        '[class*="ProductImage"] img',
        '.shopee-image img',
        'img[src*="shopee"]'
      ];
      const imageSet = new Set<string>();
      for (const selector of imageSelectors) {
        const imageElements = await page.$$(selector);
        for (const img of imageElements) {
          const src = await img.getAttribute('src') || 
                     await img.getAttribute('data-src') ||
                     await img.getAttribute('data-lazy-src');
          if (src && !src.includes('placeholder') && !src.includes('logo')) {
            const fullUrl = src.startsWith('http') ? src : `https:${src}`;
            if (!imageSet.has(fullUrl)) {
              imageSet.add(fullUrl);
              product.images.push(fullUrl);
            }
          }
        }
      }

      // Description - try multiple selectors
      const descSelectors = [
        '[data-testid="product-description"]',
        '.product-description',
        '[class*="product-description"]',
        '[class*="ProductDescription"]',
        '.qaNIZv ~ div',
        '.qaNIZv + div + div'
      ];
      for (const selector of descSelectors) {
        const descElement = await page.$(selector);
        if (descElement) {
          const descText = await descElement.textContent();
          if (descText && descText.trim()) {
            product.description = descText.trim();
            break;
          }
        }
      }

      // Try to get full description from product detail section
      if (!product.description || product.description.length < 50) {
        const detailSection = await page.$('[class*="product-detail"]') || 
                             await page.$('[class*="ProductDetail"]');
        if (detailSection) {
          const detailText = await detailSection.textContent();
          if (detailText && detailText.length > product.description.length) {
            product.description = detailText.trim();
          }
        }
      }

      // Extract specifications from product attributes
      const specSelectors = [
        '[class*="product-attribute"]',
        '[class*="ProductAttribute"]',
        '[class*="specification"]',
        '.product-spec'
      ];
      for (const selector of specSelectors) {
        const specElements = await page.$$(selector);
        for (const spec of specElements) {
          const label = await spec.$('[class*="label"]') || await spec.$('dt');
          const value = await spec.$('[class*="value"]') || await spec.$('dd');
          if (label && value) {
            const labelText = (await label.textContent() || '').trim();
            const valueText = (await value.textContent() || '').trim();
            if (labelText && valueText) {
              product.specifications[labelText] = valueText;
              
              // Extract material if found
              if (labelText.includes('材質') || labelText.includes('材料') || labelText.toLowerCase().includes('material')) {
                product.material = valueText;
              }
              
              // Extract brand if found
              if ((labelText.includes('品牌') || labelText.toLowerCase().includes('brand')) && !product.brand) {
                product.brand = valueText;
              }
            }
          }
        }
      }

      // Extract variants/specifications
      const variantSelectors = [
        '[data-testid="product-variant"]',
        '.product-variant',
        '[class*="product-variant"]',
        '[class*="ProductVariant"]',
        '[class*="spec-option"]',
        'button[class*="spec"]'
      ];
      for (const selector of variantSelectors) {
        const variantElements = await page.$$(selector);
        for (const variant of variantElements) {
          const name = await variant.textContent();
          const variantPrice = await variant.getAttribute('data-price') || 
                             await variant.getAttribute('data-original-price');
          const stock = await variant.getAttribute('data-stock');
          const sku = await variant.getAttribute('data-sku');
          
          if (name && name.trim()) {
            product.variants.push({
              name: name.trim(),
              price: variantPrice ? parseFloat(variantPrice) : product.price,
              stock: stock ? parseInt(stock) : undefined,
              sku: sku || undefined
            });
          }
        }
      }

      // Extract category from breadcrumb or navigation
      const categorySelectors = [
        '[class*="breadcrumb"]',
        '[class*="Breadcrumb"]',
        'nav[aria-label*="breadcrumb"]'
      ];
      for (const selector of categorySelectors) {
        const categoryElement = await page.$(selector);
        if (categoryElement) {
          const categoryText = await categoryElement.textContent();
          if (categoryText) {
            const categories = categoryText.split(/\s*>\s*/).filter(c => c.trim());
            if (categories.length > 1) {
              product.category = categories[categories.length - 1].trim();
            }
          }
        }
      }

      // Extract tags/keywords from meta or product info
      const tagSelectors = [
        'meta[name="keywords"]',
        '[class*="tag"]',
        '[class*="Tag"]'
      ];
      const tags: string[] = [];
      for (const selector of tagSelectors) {
        if (selector.startsWith('meta')) {
          const metaTag = await page.$(selector);
          if (metaTag) {
            const content = await metaTag.getAttribute('content');
            if (content) {
              tags.push(...content.split(',').map(t => t.trim()));
            }
          }
        } else {
          const tagElements = await page.$$(selector);
          for (const tag of tagElements) {
            const tagText = await tag.textContent();
            if (tagText && tagText.trim()) {
              tags.push(tagText.trim());
            }
          }
        }
      }
      if (tags.length > 0) {
        product.tags = [...new Set(tags)];
      }

      // Extract weight if mentioned in description or specs
      if (product.description) {
        const weightMatch = product.description.match(/(\d+(?:\.\d+)?)\s*(?:kg|公斤|g|公克|克)/i);
        if (weightMatch) {
          let weight = parseFloat(weightMatch[1]);
          if (weightMatch[0].toLowerCase().includes('g') || weightMatch[0].includes('公克') || weightMatch[0].includes('克')) {
            weight = weight / 1000; // Convert to kg
          }
          product.weight = weight;
        }
      }

      // If no variants found, create default
      if (product.variants.length === 0) {
        product.variants.push({
          name: '預設規格',
          price: product.price
        });
      }

      // Generate SKU if not found
      if (!product.sku && product.title) {
        product.sku = this.generateSKU(product.title);
      }

      return product;
    } catch (error) {
      console.error('Parse error:', error);
      throw new Error(`Failed to parse Shopee product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      await page.close();
      await context.close();
    }
  }

  private parsePrice(priceText: string): number {
    // Remove currency symbols and commas
    const cleaned = priceText.replace(/[NT$,\s]/g, '');
    return parseFloat(cleaned) || 0;
  }

  private generateSKU(title: string): string {
    // Generate a simple SKU from title
    const cleaned = title
      .replace(/[^\w\s]/g, '')
      .substring(0, 10)
      .toUpperCase()
      .replace(/\s+/g, '');
    const timestamp = Date.now().toString().slice(-6);
    return `SKU-${cleaned}-${timestamp}`;
  }
}
