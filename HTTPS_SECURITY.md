# HTTPS 和安全配置指南

本文檔說明如何確保網站被 Chrome 標示為安全，並解決「不安全網站」警告。

## Chrome 標示網站為不安全的原因

1. **未使用 HTTPS**: 網站使用 HTTP 而非 HTTPS
2. **混合內容**: HTTPS 頁面載入了 HTTP 資源
3. **無效的 SSL 證書**: 證書過期、自簽名或不受信任
4. **安全頭部缺失**: 缺少必要的安全 HTTP 頭部
5. **不安全的資源**: 載入了不安全的第三方資源

## 已實施的安全措施

### 1. HTTPS 強制升級

- **Content Security Policy (CSP)**: 包含 `upgrade-insecure-requests`，自動將所有 HTTP 請求升級為 HTTPS
- **Strict-Transport-Security (HSTS)**: 強制瀏覽器使用 HTTPS 連接
- **移除 HTTP 資源**: CSP 中移除了 `http:`，只允許 `https:`

### 2. 安全 HTTP 頭部

後端（Helmet）和前端（Vercel）都設置了：
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`

### 3. Content Security Policy

嚴格控制允許的資源來源：
- 只允許 HTTPS 資源
- 限制腳本和樣式來源
- 防止 XSS 攻擊

## 檢查清單

### ✅ 確保所有資源使用 HTTPS

1. **檢查圖片資源**
   - 確保所有圖片 URL 使用 `https://`
   - 避免使用 `http://` 的圖片

2. **檢查 API 端點**
   - 確保所有 API 請求使用 HTTPS
   - 檢查 `VITE_API_URL` 環境變數

3. **檢查第三方資源**
   - Google Analytics: ✅ 使用 HTTPS
   - 外部圖片: ✅ 使用 HTTPS (Unsplash)

### ✅ 驗證 SSL 證書

1. **Vercel 自動提供 SSL**
   - Vercel 自動為所有部署提供免費 SSL 證書
   - 確保自定義域名已正確配置

2. **Railway 後端**
   - Railway 自動提供 SSL 證書
   - 確保後端 URL 使用 HTTPS

### ✅ 檢查安全頭部

使用以下工具檢查：
- [Security Headers](https://securityheaders.com/)
- [SSL Labs](https://www.ssllabs.com/ssltest/)
- Chrome DevTools → Network → 檢查響應頭部

## 常見問題和解決方案

### Q: Chrome 仍然顯示「不安全」警告

**檢查步驟**：
1. 確認網站使用 HTTPS（URL 以 `https://` 開頭）
2. 檢查是否有混合內容（HTTPS 頁面載入 HTTP 資源）
3. 使用 Chrome DevTools → Security 標籤檢查問題
4. 檢查 SSL 證書是否有效

**解決方案**：
- 確保所有資源使用 HTTPS
- 更新 CSP 配置
- 清除瀏覽器緩存

### Q: 如何檢查混合內容？

1. 打開 Chrome DevTools (F12)
2. 前往 **Console** 標籤
3. 查找 "Mixed Content" 警告
4. 前往 **Security** 標籤查看詳細信息

### Q: 如何強制 HTTPS 重定向？

Vercel 自動處理 HTTPS 重定向。如果需要手動配置：

```json
{
  "redirects": [
    {
      "source": "/(.*)",
      "has": [
        {
          "type": "header",
          "key": "x-forwarded-proto",
          "value": "http"
        }
      ],
      "destination": "https://shopee2multi.space/:splat",
      "permanent": true
    }
  ]
}
```

### Q: 如何測試安全配置？

1. **Security Headers 測試**
   ```
   https://securityheaders.com/?q=https://shopee2multi.space
   ```
   目標：A 或 A+ 評級

2. **SSL Labs 測試**
   ```
   https://www.ssllabs.com/ssltest/analyze.html?d=shopee2multi.space
   ```
   目標：A 或 A+ 評級

3. **Chrome DevTools**
   - 打開網站
   - F12 → Security 標籤
   - 檢查安全狀態

## 部署檢查清單

部署前確認：

- [ ] 所有環境變數中的 URL 使用 HTTPS
- [ ] 前端 `vercel.json` 配置正確
- [ ] 後端 Helmet 配置正確
- [ ] 沒有硬編碼的 HTTP URL
- [ ] SSL 證書有效
- [ ] 通過 Security Headers 測試
- [ ] 通過 SSL Labs 測試
- [ ] Chrome 不再顯示「不安全」警告

## 相關資源

- [Google 的 HTTPS 指南](https://developers.google.com/web/fundamentals/security/encrypt-in-transit/why-https)
- [Mozilla 的 HTTPS 指南](https://developer.mozilla.org/en-US/docs/Web/Security/Mixed_content)
- [Security Headers](https://securityheaders.com/)
- [SSL Labs](https://www.ssllabs.com/)

## 如果問題持續

1. **清除瀏覽器緩存**
   - Chrome: Settings → Privacy → Clear browsing data
   - 選擇「緩存的圖片和文件」

2. **檢查 Chrome 版本**
   - 確保使用最新版本的 Chrome

3. **檢查網站狀態**
   - 使用 [Google Search Console](https://search.google.com/search-console) 檢查安全問題

4. **聯繫支持**
   - 如果問題持續，檢查 Vercel 和 Railway 的 SSL 配置

配置完成後，網站應該被 Chrome 標示為安全！

