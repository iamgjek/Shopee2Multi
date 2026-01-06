#!/usr/bin/env node

/**
 * 生成 sitemap.xml 的腳本
 * 使用方式: node scripts/generate-sitemap.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseUrl = 'https://shopee2multi.space';
const today = new Date().toISOString().split('T')[0];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  
  <!-- 首頁 -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- 登入頁面 -->
  <url>
    <loc>${baseUrl}/login</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- 註冊頁面 -->
  <url>
    <loc>${baseUrl}/register</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- 價格方案（重定向到首頁的 pricing-section） -->
  <url>
    <loc>${baseUrl}/#pricing-section</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  
</urlset>
`;

const publicDir = path.join(__dirname, '../public');
const sitemapPath = path.join(publicDir, 'sitemap.xml');

// 確保 public 目錄存在
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 寫入 sitemap.xml
fs.writeFileSync(sitemapPath, sitemap, 'utf8');
console.log(`✅ Sitemap generated successfully at ${sitemapPath}`);
console.log(`   Last modified: ${today}`);

