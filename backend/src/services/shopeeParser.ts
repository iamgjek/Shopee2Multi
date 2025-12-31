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
    console.log(`   [ShopeeParser] 初始化瀏覽器...`);
    await this.init();
    
    // Create context with user agent
    const context = await this.browser!.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    try {
      console.log(`   [ShopeeParser] 正在載入頁面: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      console.log(`   [ShopeeParser] 頁面載入完成`);

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
      console.log(`   [ShopeeParser] 等待頁面完全載入完成`);

      // Try to extract from JSON-LD or page data
      try {
        console.log(`   [ShopeeParser] 嘗試從 JSON 資料提取商品資訊...`);
        const pageData = await page.evaluate(() => {
          // Try to find JSON data in script tags
          // Note: This code runs in browser context, so document is available
          const scripts = Array.from((document as any).querySelectorAll('script'));
          for (const script of scripts as HTMLScriptElement[]) {
            const content = script.textContent || '';
            if (content.includes('__UNIVERSAL_DATA_FORCE_REVALIDATE__')) {
              const match = content.match(/window\.__UNIVERSAL_DATA_FORCE_REVALIDATE__\s*=\s*({.+?});/s);
              if (match) {
                try {
                  return JSON.parse(match[1]);
                } catch (e) {
                  // Continue to next script
                }
              }
            }
          }
          return null;
        });

        if (pageData?.mainInfo?.itemInfo) {
          const itemInfo = pageData.mainInfo.itemInfo;
          product.title = itemInfo.name || product.title;
          product.price = itemInfo.price || itemInfo.current_price || product.price;
          product.originalPrice = itemInfo.priceBeforeDiscount || itemInfo.original_price;
          product.brand = itemInfo.brand || itemInfo.shopInfo?.brandName || itemInfo.brand_name;
          
          // Extract category path
          if (itemInfo.catid) {
            product.category = String(itemInfo.catid);
          }
          if (itemInfo.cat_path) {
            const catPath = Array.isArray(itemInfo.cat_path) 
              ? itemInfo.cat_path.map((c: any) => c.display_name || c.name).join(' > ')
              : itemInfo.cat_path;
            if (catPath) {
              product.category = catPath;
            }
          }
          
          // Extract SKU
          if (itemInfo.itemid) {
            product.sku = `SP-${itemInfo.itemid}`;
          }
          
          // Extract images from itemInfo
          if (itemInfo.images && Array.isArray(itemInfo.images)) {
            itemInfo.images.forEach((img: string) => {
              if (img && !img.includes('placeholder')) {
                const fullUrl = img.startsWith('http') ? img : `https:${img}`;
                if (!product.images.includes(fullUrl)) {
                  product.images.push(fullUrl);
                }
              }
            });
          }
          
          console.log(`   [ShopeeParser] ✅ 成功從 JSON 提取商品資訊`);
        }
      } catch (e) {
        console.log(`   [ShopeeParser] ⚠️  無法解析 JSON 資料, 改用 DOM 解析: ${e}`);
      }

      // Title - try multiple selectors
      console.log(`   [ShopeeParser] 正在提取商品標題...`);
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
            console.log(`   [ShopeeParser] ✅ 標題提取成功: ${product.title.substring(0, 50)}...`);
            break;
          }
        }
      }

      // Price - try multiple selectors
      console.log(`   [ShopeeParser] 正在提取商品價格...`);
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
              console.log(`   [ShopeeParser] ✅ 價格提取成功: NT$ ${product.price}`);
              break;
            }
          }
        }
      }

      // Images - comprehensive extraction
      console.log(`   [ShopeeParser] 正在提取商品圖片...`);
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
      console.log(`   [ShopeeParser] ✅ 圖片提取完成: ${product.images.length} 張`);

      // Description - try to extract from JSON first, then DOM
      console.log(`   [ShopeeParser] 正在提取商品描述...`);
      
      // Try to get description from JSON data first
      try {
        const descData = await page.evaluate(() => {
          // Note: This code runs in browser context, so document is available
          const scripts = Array.from((document as any).querySelectorAll('script'));
          for (const script of scripts as HTMLScriptElement[]) {
            const content = script.textContent || '';
            if (content.includes('__UNIVERSAL_DATA_FORCE_REVALIDATE__')) {
              const match = content.match(/window\.__UNIVERSAL_DATA_FORCE_REVALIDATE__\s*=\s*({.+?});/s);
              if (match) {
                try {
                  const data = JSON.parse(match[1]);
                  if (data?.mainInfo?.itemInfo?.description) {
                    return data.mainInfo.itemInfo.description;
                  }
                } catch (e) {
                  // Continue
                }
              }
            }
          }
          return null;
        });
        
        if (descData) {
          product.description = descData;
          console.log(`   [ShopeeParser] ✅ 從 JSON 提取描述: ${product.description.substring(0, 100)}...`);
        }
      } catch (e) {
        // Continue to DOM parsing
      }

      // Fallback to DOM parsing
      if (!product.description || product.description.length < 50) {
        const descSelectors = [
          '[data-testid="product-description"]',
          '.product-description',
          '[class*="product-description"]',
          '[class*="ProductDescription"]',
          '[class*="description"]',
          '.qaNIZv ~ div',
          '.qaNIZv + div + div'
        ];
        for (const selector of descSelectors) {
          const descElement = await page.$(selector);
          if (descElement) {
            const descText = await descElement.textContent();
            if (descText && descText.trim() && descText.trim().length > (product.description?.length || 0)) {
              product.description = descText.trim();
              break;
            }
          }
        }

        // Try to get full description from product detail section
        if (!product.description || product.description.length < 50) {
          const detailSection = await page.$('[class*="product-detail"]') || 
                               await page.$('[class*="ProductDetail"]') ||
                               await page.$('[id*="product-detail"]');
          if (detailSection) {
            const detailText = await detailSection.textContent();
            if (detailText && detailText.trim().length > (product.description?.length || 0)) {
              product.description = detailText.trim();
            }
          }
        }
      }
      
      if (product.description) {
        console.log(`   [ShopeeParser] ✅ 描述提取完成: ${product.description.length} 字元`);
      }

      // Extract specifications from product attributes
      console.log(`   [ShopeeParser] 正在提取商品規格...`);
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
      console.log(`   [ShopeeParser] ✅ 規格提取完成: ${Object.keys(product.specifications).length} 項`);

      // Extract variants/specifications - Enhanced parsing for Shopee
      console.log(`   [ShopeeParser] 正在提取商品變體...`);
      
      // Try to extract from Shopee's internal data structure first
      try {
        const variantData = await page.evaluate(() => {
          // Note: This code runs in browser context, so document is available
          const scripts = Array.from((document as any).querySelectorAll('script'));
          for (const script of scripts as HTMLScriptElement[]) {
            const content = script.textContent || '';
            if (content.includes('__UNIVERSAL_DATA_FORCE_REVALIDATE__')) {
              const match = content.match(/window\.__UNIVERSAL_DATA_FORCE_REVALIDATE__\s*=\s*({.+?});/s);
              if (match) {
                try {
                  const data = JSON.parse(match[1]);
                  // Try multiple paths for variant data
                  const models = data?.mainInfo?.itemInfo?.models || 
                                data?.mainInfo?.itemInfo?.tierVariations?.[0]?.options ||
                                data?.mainInfo?.itemInfo?.variations;
                  
                  if (models && Array.isArray(models)) {
                    return {
                      models: models,
                      tierVariations: data?.mainInfo?.itemInfo?.tierVariations
                    };
                  }
                } catch (e) {
                  // Continue to next script
                }
              }
            }
          }
          return null;
        });

        if (variantData?.models && Array.isArray(variantData.models)) {
          // Handle tier variations (e.g., 顏色, 尺寸)
          const tierVariations = variantData.tierVariations || [];
          
          if (tierVariations.length > 0) {
            // Build variant combinations from tier variations
            const buildVariants = (tiers: any[], index: number = 0, current: string[] = []): string[][] => {
              if (index >= tiers.length) {
                return [current];
              }
              const tier = tiers[index];
              const options = tier.options || [];
              const results: string[][] = [];
              for (const option of options) {
                results.push(...buildVariants(tiers, index + 1, [...current, option]));
              }
              return results;
            };
            
            const variantCombinations = buildVariants(tierVariations);
            
            for (const combination of variantCombinations) {
              const variantName = combination.join(' / ');
              // Find matching model
              const model = variantData.models.find((m: any) => {
                if (m.tier_index && Array.isArray(m.tier_index)) {
                  return m.tier_index.every((idx: number, i: number) => 
                    tierVariations[i]?.options[idx] === combination[i]
                  );
                }
                return false;
              });
              
              if (model || combination.length > 0) {
                const variantPrice = model?.price || model?.current_price || product.price;
                const stock = model?.stock || model?.available_stock || 0;
                const sku = model?.model_id ? `SP-${model.model_id}` : undefined;
                
                product.variants.push({
                  name: variantName,
                  price: typeof variantPrice === 'number' ? variantPrice : parseFloat(String(variantPrice)) || product.price,
                  stock: typeof stock === 'number' ? stock : parseInt(String(stock)) || 0,
                  sku: sku
                });
              }
            }
          } else {
            // Simple model list
            for (const model of variantData.models) {
              const variantName = model.name || model.model_name || model.display_name || '';
              const variantPrice = model.price || model.current_price || product.price;
              const stock = model.stock || model.available_stock || 0;
              const sku = model.model_id ? `SP-${model.model_id}` : undefined;
              
              if (variantName) {
                product.variants.push({
                  name: variantName.trim(),
                  price: typeof variantPrice === 'number' ? variantPrice : parseFloat(String(variantPrice)) || product.price,
                  stock: typeof stock === 'number' ? stock : parseInt(String(stock)) || 0,
                  sku: sku
                });
              }
            }
          }
          
          console.log(`   [ShopeeParser] ✅ 從 JSON 資料提取變體: ${product.variants.length} 個`);
        }
      } catch (e) {
        console.log(`   [ShopeeParser] ⚠️  無法從 JSON 提取變體, 改用 DOM 解析: ${e}`);
      }

      // Fallback to DOM parsing if no variants found
      if (product.variants.length === 0) {
        const variantSelectors = [
          '[data-testid="product-variant"]',
          '.product-variant',
          '[class*="product-variant"]',
          '[class*="ProductVariant"]',
          '[class*="spec-option"]',
          'button[class*="spec"]',
          '[class*="product-model"]',
          '[class*="model-item"]',
          'div[class*="option"]'
        ];
        for (const selector of variantSelectors) {
          const variantElements = await page.$$(selector);
          for (const variant of variantElements) {
            const name = await variant.textContent();
            const variantPrice = await variant.getAttribute('data-price') || 
                               await variant.getAttribute('data-original-price');
            const stock = await variant.getAttribute('data-stock');
            const sku = await variant.getAttribute('data-sku');
            
            if (name && name.trim() && name.trim().length > 0) {
              // Avoid duplicates
              const exists = product.variants.some(v => v.name === name.trim());
              if (!exists) {
                product.variants.push({
                  name: name.trim(),
                  price: variantPrice ? parseFloat(variantPrice) : product.price,
                  stock: stock ? parseInt(stock) : undefined,
                  sku: sku || undefined
                });
              }
            }
          }
        }
        console.log(`   [ShopeeParser] ✅ DOM 變體提取完成: ${product.variants.length} 個`);
      }

      // Extract category from breadcrumb or navigation
      if (!product.category) {
        const categorySelectors = [
          '[class*="breadcrumb"]',
          '[class*="Breadcrumb"]',
          'nav[aria-label*="breadcrumb"]',
          '[class*="category"]',
          'a[href*="/category/"]'
        ];
        for (const selector of categorySelectors) {
          const categoryElements = await page.$$(selector);
          for (const categoryElement of categoryElements) {
            const categoryText = await categoryElement.textContent();
            if (categoryText) {
              const categories = categoryText.split(/\s*>\s*/).filter(c => c.trim() && c.trim().length > 0);
              if (categories.length > 1) {
                product.category = categories.slice(1).join(' > ').trim(); // Skip "首頁" or similar
                break;
              } else if (categories.length === 1 && categories[0].length > 2) {
                product.category = categories[0].trim();
                break;
              }
            }
          }
          if (product.category) break;
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
        console.log(`   [ShopeeParser] ⚠️  未找到變體, 使用預設規格`);
      }

      // Generate SKU if not found
      if (!product.sku && product.title) {
        product.sku = this.generateSKU(product.title);
        console.log(`   [ShopeeParser] ✅ 生成 SKU: ${product.sku}`);
      }

      console.log(`   [ShopeeParser] ✅ 商品解析完成`);
      return product;
    } catch (error) {
      console.error(`   [ShopeeParser] ❌ 解析錯誤:`, error);
      throw new Error(`Failed to parse Shopee product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      await page.close();
      await context.close();
      console.log(`   [ShopeeParser] 瀏覽器資源已釋放`);
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
