# PageSpeed 性能優化指南

本指南說明已實施的 PageSpeed Insights 優化措施，以提升網站性能和用戶體驗。

## 已實施的優化措施

### 1. 資源提示優化

✅ **Preconnect 和 DNS Prefetch**
- 預連接到 Google Analytics 和 Unsplash
- 減少 DNS 查找時間
- 提前建立 TCP 連接

```html
<link rel="preconnect" href="https://www.googletagmanager.com" crossorigin>
<link rel="preconnect" href="https://images.unsplash.com" crossorigin>
<link rel="dns-prefetch" href="https://shopee2multi-backend.railway.app">
```

### 2. JavaScript 優化

✅ **代碼分割（Code Splitting）**
- React 核心庫分離為 `react-vendor`
- Ant Design 分離為 `antd-vendor`
- 其他第三方庫分離為 `vendor`
- 路由級別的懶加載

✅ **延遲加載 Google Analytics**
- 使用 `requestIdleCallback` 延遲加載
- 不阻塞頁面渲染
- 提升首次內容繪製（FCP）時間

### 3. 圖片優化

✅ **響應式圖片**
- 根據設備寬度載入不同尺寸的圖片
- 移動設備：768px 寬度
- 桌面設備：1920px 寬度

✅ **WebP 格式**
- 使用 WebP 格式減少圖片大小
- 自動回退到原始格式

✅ **懶加載**
- 所有圖片使用 `loading="lazy"`
- 異步解碼：`decoding="async"`

✅ **背景圖片優化**
- 移動設備使用 `scroll` 而非 `fixed`
- 減少重繪和重排

### 4. CSS 優化

✅ **字體顯示優化**
- 使用 `font-display: swap`
- 防止 FOIT (Flash of Invisible Text)
- 提升文字可見性時間（FCP）

✅ **CSS 代碼分割**
- 啟用 `cssCodeSplit: true`
- 每個頁面只載入需要的 CSS
- 減少初始 CSS 大小

✅ **CSS 壓縮**
- 啟用 `cssMinify: true`
- 減少 CSS 文件大小

### 5. 構建優化

✅ **Tree Shaking**
- 移除未使用的代碼
- 減少打包體積

✅ **資源命名優化**
- 使用內容哈希命名
- 長期緩存策略
- 圖片、字體、JS 分別組織

✅ **目標瀏覽器優化**
- 指定目標瀏覽器版本
- 減少轉譯代碼
- 提升執行效率

### 6. 緩存策略

✅ **靜態資源長期緩存**
- JS/CSS：1 年緩存（immutable）
- 圖片：30 天緩存 + stale-while-revalidate
- 字體：1 年緩存

### 7. 渲染優化

✅ **被動事件監聽器**
- 滾動事件使用 `{ passive: true }`
- 提升滾動性能

✅ **GPU 加速**
- 使用 `transform: translateZ(0)`
- 使用 `will-change` 提示瀏覽器
- 減少重繪和重排

## 性能指標目標

根據 [PageSpeed Insights](https://pagespeed.web.dev/) 的最佳實踐：

### Core Web Vitals

- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### 其他指標

- **FCP (First Contentful Paint)**: < 1.8s
- **TTI (Time to Interactive)**: < 3.8s
- **TBT (Total Blocking Time)**: < 200ms
- **Speed Index**: < 3.4s

## 測試和驗證

### 1. 使用 PageSpeed Insights

訪問：https://pagespeed.web.dev/

輸入您的網站 URL：
```
https://shopee2multi.space
```

### 2. 使用 Chrome DevTools

1. 打開 Chrome DevTools (F12)
2. 切換到 **Lighthouse** 標籤
3. 選擇 **Performance** 和 **Mobile**
4. 點擊 **Generate report**

### 3. 使用 WebPageTest

訪問：https://www.webpagetest.org/

### 4. 檢查網絡請求

在 Chrome DevTools 的 **Network** 標籤中：
- 檢查資源大小
- 檢查載入時間
- 檢查緩存狀態
- 檢查壓縮情況

## 持續優化建議

### 1. 圖片進一步優化

- 考慮使用 CDN（如 Cloudinary 或 ImageKit）
- 實施響應式圖片（`<picture>` 和 `srcset`）
- 考慮使用 AVIF 格式（更好的壓縮率）

### 2. 字體優化

- 如果使用自定義字體，使用 `@font-face` 和 `font-display: swap`
- 預加載關鍵字體
- 考慮使用系統字體堆疊（已實施）

### 3. 關鍵 CSS

- 提取關鍵 CSS 並內聯到 `<head>`
- 延遲加載非關鍵 CSS

### 4. Service Worker

- 考慮實施 Service Worker 進行緩存
- 離線支持
- 後台同步

### 5. HTTP/2 和 HTTP/3

- 確保使用 HTTP/2（Vercel 自動支持）
- 考慮 HTTP/3（QUIC）支持

### 6. 預加載關鍵資源

```html
<link rel="preload" href="/critical.css" as="style">
<link rel="preload" href="/critical.js" as="script">
```

### 7. 減少第三方腳本

- 評估第三方腳本的必要性
- 延遲加載非關鍵第三方腳本
- 使用 `async` 或 `defer` 屬性

## 監控和維護

### 1. 定期檢查

- 每週檢查 PageSpeed Insights 分數
- 監控 Core Web Vitals
- 檢查是否有性能回歸

### 2. 使用真實用戶監控（RUM）

- Google Analytics 4 的 Web Vitals 報告
- Vercel Analytics（如果可用）
- 自定義性能監控

### 3. 性能預算

設定性能預算：
- 總 JavaScript 大小：< 200KB（gzipped）
- 總 CSS 大小：< 50KB（gzipped）
- 圖片總大小：< 500KB（初始載入）
- 首次內容繪製：< 1.8s

## 常見問題

### Q: 為什麼 PageSpeed Insights 顯示 "No Data"？

A: 這表示沒有足夠的真實用戶數據。解決方法：
1. 等待更多用戶訪問網站
2. 使用 Lighthouse 進行實驗室測試
3. 確保網站已正確部署和可訪問

### Q: 如何進一步提升分數？

A: 
1. 減少 JavaScript 大小
2. 優化圖片（壓縮、格式、尺寸）
3. 減少第三方腳本
4. 實施關鍵 CSS
5. 使用 CDN

### Q: 移動設備性能較差怎麼辦？

A:
1. 使用響應式圖片
2. 減少移動設備的 JavaScript
3. 優化觸摸事件處理
4. 使用移動設備專用的 CSS

## 相關資源

- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Web.dev Performance](https://web.dev/performance/)
- [Core Web Vitals](https://web.dev/vitals/)
- [Vite Performance Guide](https://vitejs.dev/guide/performance.html)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)

## 當前優化狀態

✅ **已實施**：
- 資源提示優化
- JavaScript 代碼分割
- 圖片懶加載和響應式優化
- CSS 優化和字體顯示
- 構建優化
- 緩存策略
- 渲染性能優化

🔄 **待實施**（可選）：
- 關鍵 CSS 內聯
- Service Worker
- 圖片 CDN
- 更激進的緩存策略

遵循這些優化措施，您的網站應該能夠獲得更好的 PageSpeed Insights 分數和用戶體驗。

