# 安全頭部配置說明

本文檔詳細說明所有已實施的安全 HTTP 頭部及其作用。

## 已實施的安全頭部

### 1. Content-Security-Policy (CSP)

**作用**: 防止 XSS 攻擊，通過白名單控制允許載入的資源來源。

**配置**:
```
default-src 'self';
script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
connect-src 'self' https://www.google-analytics.com https://shopee2multi-backend.railway.app;
font-src 'self' data: https:;
object-src 'none';
media-src 'self' https:;
frame-src 'none';
upgrade-insecure-requests;
```

**說明**:
- `default-src 'self'`: 默認只允許同源資源
- `script-src`: 允許同源腳本、內聯腳本（用於 Google Analytics）和 Google 分析服務
- `style-src`: 允許同源樣式和內聯樣式
- `img-src`: 允許同源圖片、data URI 和所有 HTTPS 圖片
- `connect-src`: 允許連接到同源、Google Analytics 和後端 API
- `object-src 'none'`: 禁止 `<object>`、`<embed>`、`<applet>` 標籤
- `frame-src 'none'`: 禁止嵌入框架（與 X-Frame-Options 配合）
- `upgrade-insecure-requests`: 自動將 HTTP 升級為 HTTPS

**位置**: 
- 後端: `backend/src/index.ts` (Helmet 配置)
- 前端: `frontend/vercel.json` (HTTP 頭部)

---

### 2. X-Frame-Options

**作用**: 防止點擊劫持（Clickjacking）攻擊，控制網站是否可以被嵌入到框架中。

**配置**: `DENY`

**選項說明**:
- `DENY`: 完全禁止嵌入（最安全，當前使用）
- `SAMEORIGIN`: 只允許同源頁面嵌入
- `ALLOW-FROM uri`: 允許特定來源嵌入（已廢棄）

**為什麼使用 DENY**:
- 提供最高級別的安全保護
- 防止網站被嵌入到任何其他網站（包括惡意網站）
- 如果未來需要嵌入功能，可以改為 `SAMEORIGIN`

**位置**: 
- 後端: `backend/src/index.ts` (Helmet frameguard)
- 前端: `frontend/vercel.json` (HTTP 頭部)

---

### 3. X-Content-Type-Options

**作用**: 防止瀏覽器進行 MIME 類型嗅探，強制使用聲明的 Content-Type。

**配置**: `nosniff`

**說明**:
- 這是唯一有效的值
- 防止瀏覽器猜測文件類型，避免安全漏洞
- 強制瀏覽器嚴格遵守服務器設置的 Content-Type

**位置**: 
- 後端: `backend/src/index.ts` (Helmet noSniff)
- 前端: `frontend/vercel.json` (HTTP 頭部)

---

### 4. Referrer-Policy

**作用**: 控制瀏覽器在導航時發送的 Referer 頭部信息量。

**配置**: `strict-origin-when-cross-origin`

**選項說明**:
- `strict-origin-when-cross-origin`: 
  - 同源請求：發送完整 URL
  - 跨源 HTTPS → HTTPS：只發送源（協議+域名+端口）
  - 跨源 HTTPS → HTTP：不發送 Referer
  - 跨源 HTTP → HTTP/HTTPS：發送完整 URL

**為什麼選擇此策略**:
- 平衡隱私和安全
- 保護用戶隱私（不洩露完整 URL）
- 仍允許必要的引用信息用於分析

**位置**: 
- 後端: `backend/src/index.ts` (Helmet referrerPolicy)
- 前端: `frontend/vercel.json` (HTTP 頭部)

---

### 5. Permissions-Policy (formerly Feature-Policy)

**作用**: 控制瀏覽器中哪些功能和 API 可以被使用。

**配置**:
```
geolocation=(), 
microphone=(), 
camera=(), 
payment=(), 
usb=(), 
magnetometer=(), 
gyroscope=(), 
accelerometer=()
```

**說明**:
- `()` 表示完全禁止該功能
- 防止未經授權訪問敏感設備和 API
- 保護用戶隱私和安全

**被禁用的功能**:
- `geolocation`: 地理位置
- `microphone`: 麥克風
- `camera`: 攝像頭
- `payment`: 支付 API
- `usb`: USB 設備
- `magnetometer`: 磁力計
- `gyroscope`: 陀螺儀
- `accelerometer`: 加速度計

**位置**: 
- 後端: `backend/src/index.ts` (手動設置)
- 前端: `frontend/vercel.json` (HTTP 頭部)

---

### 6. Strict-Transport-Security (HSTS)

**作用**: 強制瀏覽器使用 HTTPS 連接，防止降級攻擊。

**配置**: `max-age=31536000; includeSubDomains; preload`

**說明**:
- `max-age=31536000`: 有效期 1 年（31536000 秒）
- `includeSubDomains`: 包含所有子域名
- `preload`: 允許加入 HSTS 預載列表

**位置**: 
- 後端: `backend/src/index.ts` (Helmet strictTransportSecurity)
- 前端: `frontend/vercel.json` (HTTP 頭部)

---

### 7. X-XSS-Protection (Legacy)

**作用**: 啟用瀏覽器的 XSS 過濾器（舊版瀏覽器支持）。

**配置**: `1; mode=block`

**說明**:
- `1`: 啟用 XSS 過濾
- `mode=block`: 阻止而不是清理可疑內容
- 這是舊版瀏覽器的後備保護，現代瀏覽器主要依賴 CSP

**位置**: 
- 後端: `backend/src/index.ts` (Helmet xssFilter)
- 前端: `frontend/vercel.json` (HTTP 頭部)

---

## 安全頭部檢查

### 使用 Security Headers 測試

訪問 [Security Headers](https://securityheaders.com/) 並輸入您的網站 URL：
```
https://securityheaders.com/?q=https://shopee2multi.space
```

**目標評級**: A 或 A+

### 使用 Chrome DevTools 檢查

1. 打開網站
2. 按 F12 打開開發者工具
3. 前往 **Network** 標籤
4. 刷新頁面
5. 選擇任意請求
6. 查看 **Headers** → **Response Headers**
7. 確認所有安全頭部都存在

### 使用 curl 檢查

```bash
curl -I https://shopee2multi.space
```

查看響應頭部，確認所有安全頭部都正確設置。

---

## 配置位置總結

### 後端 (Express + Helmet)
- 文件: `backend/src/index.ts`
- 使用 Helmet 中間件自動設置大部分頭部
- Permissions-Policy 手動設置（Helmet 7.x 不支持）

### 前端 (Vercel)
- 文件: `frontend/vercel.json`
- 通過 Vercel 的 headers 配置設置
- 確保靜態資源也包含安全頭部

---

## 最佳實踐

1. **雙重設置**: 後端和前端都設置安全頭部，確保覆蓋所有請求
2. **定期檢查**: 使用 Security Headers 工具定期檢查
3. **保持更新**: 關注安全頭部的最新標準和最佳實踐
4. **測試影響**: 確保安全頭部不會影響網站功能

---

## 相關資源

- [MDN: HTTP Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)
- [OWASP: Secure Headers](https://owasp.org/www-project-secure-headers/)
- [Security Headers](https://securityheaders.com/)
- [Helmet.js Documentation](https://helmetjs.github.io/)

---

## 更新日誌

- **2024**: 初始配置，包含所有主要安全頭部
- **2024**: 添加 Permissions-Policy 支持
- **2024**: 優化 CSP 配置，移除 HTTP 支持
- **2024**: 添加 HSTS 和 upgrade-insecure-requests

