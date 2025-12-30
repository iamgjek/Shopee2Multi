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
  }>;
  category?: string;
  brand?: string;
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

      // Title
      const titleElement = await page.$('h1[data-testid="product-name"]') || 
                          await page.$('.product-name') ||
                          await page.$('h1');
      if (titleElement) {
        product.title = await titleElement.textContent() || '';
      }

      // Price
      const priceElement = await page.$('[data-testid="product-price"]') ||
                          await page.$('.product-price');
      if (priceElement) {
        const priceText = await priceElement.textContent() || '';
        product.price = this.parsePrice(priceText);
      }

      // Images
      const imageElements = await page.$$('img[data-testid="product-image"]') ||
                           await page.$$('.product-image img');
      for (const img of imageElements) {
        const src = await img.getAttribute('src') || await img.getAttribute('data-src');
        if (src && !src.includes('placeholder')) {
          product.images.push(src.startsWith('http') ? src : `https:${src}`);
        }
      }

      // Description
      const descElement = await page.$('[data-testid="product-description"]') ||
                         await page.$('.product-description');
      if (descElement) {
        product.description = await descElement.textContent() || '';
      }

      // Specifications/Variants
      const variantElements = await page.$$('[data-testid="product-variant"]') ||
                             await page.$$('.product-variant');
      for (const variant of variantElements) {
        const name = await variant.textContent() || '';
        const variantPrice = await variant.getAttribute('data-price');
        product.variants.push({
          name: name.trim(),
          price: variantPrice ? parseFloat(variantPrice) : product.price
        });
      }

      // If no variants found, create default
      if (product.variants.length === 0) {
        product.variants.push({
          name: '預設規格',
          price: product.price
        });
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
}
