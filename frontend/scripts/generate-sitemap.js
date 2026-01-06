/**
 * 動態生成 sitemap.xml
 * 在構建時運行此腳本以更新 sitemap
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 網站配置
const SITE_URL = process.env.SITE_URL || 'https://shopee2multi.space';
const PUBLIC_PAGES = [
  {
    path: '/',
    priority: '1.0',
    changefreq: 'weekly',
  },
  {
    path: '/login',
    priority: '0.8',
    changefreq: 'monthly',
  },
  {
    path: '/register',
    priority: '0.8',
    changefreq: 'monthly',
  },
];

// 生成 sitemap XML
function generateSitemap() {
  const currentDate = new Date().toISOString().split('T')[0];
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
`;

  PUBLIC_PAGES.forEach((page) => {
    xml += `  <url>
    <loc>${SITE_URL}${page.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>
`;
  });

  xml += `</urlset>`;

  return xml;
}

// 寫入文件
const publicDir = path.join(__dirname, '../public');
const sitemapPath = path.join(publicDir, 'sitemap.xml');

// 確保 public 目錄存在
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 寫入 sitemap
const sitemap = generateSitemap();
fs.writeFileSync(sitemapPath, sitemap, 'utf8');

console.log('✅ Sitemap generated successfully!');
console.log(`📄 Location: ${sitemapPath}`);
console.log(`🌐 Sitemap URL: ${SITE_URL}/sitemap.xml`);

