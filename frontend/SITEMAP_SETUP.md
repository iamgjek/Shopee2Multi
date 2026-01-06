# Sitemap 設置指南

本指南說明如何設置和使用 sitemap 供 Google Search Console 使用。

## 文件說明

### 1. sitemap.xml

位置：`frontend/public/sitemap.xml`

包含所有公開頁面的 URL，供搜索引擎爬取和索引。

**包含的頁面**：
- `/` - 首頁（優先級 1.0）
- `/login` - 登入頁（優先級 0.8）
- `/register` - 註冊頁（優先級 0.8）

**不包含的頁面**（需要登入）：
- `/converter` - 轉檔工具
- `/dashboard` - 儀表板
- `/admin` - 管理後台

### 2. robots.txt

位置：`frontend/public/robots.txt`

告訴搜索引擎哪些頁面可以索引，哪些不可以。

**允許索引**：
- `/`
- `/login`
- `/register`

**禁止索引**：
- `/converter`
- `/dashboard`
- `/admin`

### 3. generate-sitemap.js

位置：`frontend/scripts/generate-sitemap.js`

動態生成 sitemap 的腳本。在構建時自動運行。

## 使用方法

### 自動生成（推薦）

構建時會自動生成 sitemap：

```bash
npm run build
```

這會自動運行 `generate:sitemap` 腳本，然後構建項目。

### 手動生成

如果需要手動生成 sitemap：

```bash
npm run generate:sitemap
```

### 環境變數

可以通過環境變數設置網站 URL：

```bash
SITE_URL=https://shopee2multi.space npm run generate:sitemap
```

如果未設置，默認使用 `https://shopee2multi.space`。

## 在 Google Search Console 中提交

### 1. 訪問 Google Search Console

1. 前往：https://search.google.com/search-console
2. 選擇您的網站屬性（`shopee2multi.space`）

### 2. 提交 Sitemap

1. 在左側選單中點擊 **Sitemaps**
2. 在「新增 Sitemap」欄位中輸入：`sitemap.xml`
3. 點擊 **提交**

### 3. 驗證 Sitemap

提交後，Google 會驗證 sitemap：
- ✅ 如果成功，會顯示「成功」狀態
- ⚠️ 如果有問題，會顯示錯誤訊息

### 4. 檢查索引狀態

1. 點擊左側選單的 **索引涵蓋範圍**
2. 查看哪些頁面已被索引
3. 檢查是否有錯誤或警告

## 更新 Sitemap

### 何時更新

- 添加新的公開頁面時
- 更改頁面 URL 時
- 定期更新（建議每月）

### 如何更新

1. **編輯 `scripts/generate-sitemap.js`**

   在 `PUBLIC_PAGES` 數組中添加新頁面：

   ```javascript
   const PUBLIC_PAGES = [
     {
       path: '/',
       priority: '1.0',
       changefreq: 'weekly',
     },
     {
       path: '/new-page',  // 新頁面
       priority: '0.8',
       changefreq: 'monthly',
     },
   ];
   ```

2. **重新構建**

   ```bash
   npm run build
   ```

3. **重新提交到 Google Search Console**

   在 Google Search Console 中重新提交 sitemap。

## Sitemap 格式說明

### URL 元素

每個 URL 包含以下元素：

- `<loc>` - 頁面的完整 URL
- `<lastmod>` - 最後修改日期（YYYY-MM-DD）
- `<changefreq>` - 更新頻率：
  - `always` - 每次訪問都改變
  - `hourly` - 每小時
  - `daily` - 每天
  - `weekly` - 每週
  - `monthly` - 每月
  - `yearly` - 每年
  - `never` - 從不改變
- `<priority>` - 優先級（0.0 到 1.0）：
  - `1.0` - 最高優先級（首頁）
  - `0.8` - 高優先級（重要頁面）
  - `0.5` - 中等優先級
  - `0.3` - 低優先級

### 最佳實踐

1. **只包含公開頁面**
   - 不要包含需要登入的頁面
   - 不要包含重定向頁面

2. **保持更新**
   - 定期更新 `lastmod` 日期
   - 反映實際的更新頻率

3. **合理的優先級**
   - 首頁使用 1.0
   - 重要頁面使用 0.8-0.9
   - 次要頁面使用 0.5-0.7

4. **文件大小限制**
   - 單個 sitemap 最多 50,000 個 URL
   - 文件大小不超過 50MB（未壓縮）
   - 如果超過，使用 sitemap index

## 驗證 Sitemap

### 1. 在線驗證工具

- **XML Sitemap Validator**: https://www.xml-sitemaps.com/validate-xml-sitemap.html
- **Sitemap Validator**: https://www.sitemaps.org/protocol.html

### 2. 檢查文件可訪問性

在瀏覽器中訪問：
```
https://shopee2multi.space/sitemap.xml
```

應該能看到 XML 格式的 sitemap。

### 3. 檢查 robots.txt

在瀏覽器中訪問：
```
https://shopee2multi.space/robots.txt
```

應該能看到 robots.txt 內容，並包含 sitemap 位置。

## 故障排除

### Sitemap 無法訪問

1. **檢查文件位置**
   - 確保 `sitemap.xml` 在 `public` 目錄中
   - 確保構建後文件在 `dist` 目錄中

2. **檢查 Vercel 配置**
   - 確保 `vercel.json` 沒有阻止靜態文件
   - 檢查部署日誌

3. **檢查 URL**
   - 確認網站 URL 正確
   - 確認使用 HTTPS

### Google 無法解析 Sitemap

1. **檢查 XML 格式**
   - 確保 XML 格式正確
   - 使用在線驗證工具檢查

2. **檢查編碼**
   - 確保使用 UTF-8 編碼
   - 檢查特殊字符是否正確轉義

3. **檢查 URL**
   - 確保所有 URL 都是完整的絕對路徑
   - 確保 URL 可以訪問

### 頁面未被索引

1. **檢查 robots.txt**
   - 確保頁面沒有被禁止
   - 檢查是否有 `noindex` meta 標籤

2. **檢查頁面內容**
   - 確保頁面有實際內容
   - 確保不是重定向頁面

3. **等待時間**
   - Google 索引需要時間（通常幾天到幾週）
   - 定期檢查索引狀態

## 相關資源

- [Google Search Console](https://search.google.com/search-console)
- [Sitemap 協議](https://www.sitemaps.org/protocol.html)
- [Google 搜索中心 - Sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [robots.txt 規範](https://www.robotstxt.org/)

## 當前配置

✅ **已設置**：
- `sitemap.xml` - 包含所有公開頁面
- `robots.txt` - 正確配置允許/禁止索引
- `generate-sitemap.js` - 自動生成腳本
- 構建時自動生成 sitemap

📝 **下一步**：
1. 部署到生產環境
2. 在 Google Search Console 中提交 sitemap
3. 等待 Google 索引
4. 監控索引狀態

遵循這些步驟，您的網站應該能夠被 Google 正確索引。

