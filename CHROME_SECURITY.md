# 防止 Chrome 標記網站為可疑或危險的配置指南

本指南說明如何配置您的網站，避免被 Chrome 瀏覽器標記為可疑或具有危險性。

## 已實施的安全措施

### 1. HTTPS 強制（HSTS）

✅ **已配置**：強制使用 HTTPS，防止中間人攻擊

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

**說明**：
- 強制瀏覽器在 1 年內只使用 HTTPS 連接
- 包含所有子域名
- 支援 HSTS Preload（可選，需要提交到 [HSTS Preload List](https://hstspreload.org/)）

### 2. 內容安全策略（CSP）

✅ **已配置**：防止 XSS 攻擊和數據注入

**後端配置**：
- 只允許從同源載入資源
- 允許 Google Fonts（樣式和字體）
- 禁止內嵌框架和對象
- 自動升級不安全的 HTTP 請求

### 3. 防止點擊劫持（Clickjacking）

✅ **已配置**：禁止網站被嵌入到 iframe 中

```
X-Frame-Options: DENY
```

### 4. MIME 類型嗅探保護

✅ **已配置**：防止瀏覽器猜測文件類型

```
X-Content-Type-Options: nosniff
```

### 5. XSS 保護

✅ **已配置**：啟用瀏覽器的 XSS 過濾器

```
X-XSS-Protection: 1; mode=block
```

### 6. 引用策略（Referrer Policy）

✅ **已配置**：控制引用信息傳遞

```
Referrer-Policy: strict-origin-when-cross-origin
```

### 7. 權限策略（Permissions Policy）

✅ **已配置**：限制瀏覽器功能訪問

```
Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(self)
```

**說明**：
- 禁止地理位置、麥克風、攝像頭訪問
- 只允許同源的支付功能

## 額外建議

### 1. 確保使用有效的 SSL 證書

- ✅ Vercel 自動提供有效的 SSL 證書
- ✅ Railway 自動提供有效的 SSL 證書
- ⚠️ 如果使用自定義域名，確保 SSL 證書有效且未過期

### 2. 避免惡意內容

- ✅ 不要託管惡意軟體或病毒
- ✅ 不要進行釣魚攻擊
- ✅ 不要進行欺詐活動
- ✅ 確保所有外部連結都是安全的

### 3. 定期檢查安全狀態

使用以下工具檢查您的網站：

#### Google Safe Browsing
- 訪問：https://transparencyreport.google.com/safe-browsing/search
- 輸入您的域名檢查是否被標記

#### SSL Labs SSL Test
- 訪問：https://www.ssllabs.com/ssltest/
- 測試 SSL 配置和安全性評分

#### Security Headers
- 訪問：https://securityheaders.com/
- 檢查安全標頭配置

#### Mozilla Observatory
- 訪問：https://observatory.mozilla.org/
- 全面的安全掃描

### 4. 提交到 HSTS Preload（可選）

如果您想將域名加入 Chrome 的 HSTS Preload 列表：

1. 確保 HSTS 標頭包含 `preload` 指令（已配置）
2. 訪問：https://hstspreload.org/
3. 提交您的域名
4. 等待審核通過（通常需要幾週）

**注意**：一旦加入 Preload，很難移除，請謹慎操作。

### 5. 監控安全事件

- 定期檢查後端日誌中的安全警告
- 監控異常的 API 請求
- 使用速率限制防止濫用（已配置）

### 6. 內容合規

確保網站內容符合：
- ✅ 不包含惡意代碼
- ✅ 不進行欺詐活動
- ✅ 遵守當地法律法規
- ✅ 不侵犯版權

## 檢查清單

部署前請確認：

- [ ] HTTPS 已正確配置且證書有效
- [ ] 所有安全標頭已設置（使用 securityheaders.com 檢查）
- [ ] 沒有惡意內容或可疑活動
- [ ] SSL 評分至少為 A（使用 ssllabs.com 檢查）
- [ ] 沒有被 Google Safe Browsing 標記
- [ ] 內容安全策略（CSP）已正確配置
- [ ] 所有外部資源使用 HTTPS
- [ ] 沒有混合內容（HTTP + HTTPS）

## 如果被標記為可疑怎麼辦？

### 1. 檢查 Google Search Console

1. 訪問：https://search.google.com/search-console
2. 添加您的網站
3. 檢查「安全問題」部分
4. 查看是否有安全警告

### 2. 提交審查請求

如果您的網站被錯誤標記：

1. 訪問：https://search.google.com/search-console
2. 選擇「安全問題」
3. 點擊「請求審查」
4. 說明問題已解決
5. 等待 Google 審核（通常 1-3 天）

### 3. 檢查後端日誌

查看是否有：
- 異常的請求模式
- 安全警告
- 錯誤配置

### 4. 驗證安全標頭

使用以下命令檢查標頭：

```bash
curl -I https://your-domain.com
```

或使用在線工具：
- https://securityheaders.com/
- https://observatory.mozilla.org/

## 測試您的配置

### 1. 檢查安全標頭

```bash
# 檢查前端（Vercel）
curl -I https://shopee2multi.vercel.app

# 檢查後端（Railway）
curl -I https://shopee2multi-backend.railway.app/health
```

### 2. 使用瀏覽器開發者工具

1. 打開 Chrome DevTools（F12）
2. 切換到 Network 標籤
3. 重新載入頁面
4. 選擇任何請求
5. 查看 Response Headers
6. 確認所有安全標頭都存在

### 3. 在線安全掃描

訪問以下網站進行掃描：
- https://securityheaders.com/
- https://observatory.mozilla.org/
- https://www.ssllabs.com/ssltest/

## 當前配置狀態

✅ **已實施的安全措施**：

1. ✅ HTTPS 強制（HSTS）
2. ✅ 內容安全策略（CSP）
3. ✅ 防止點擊劫持（X-Frame-Options）
4. ✅ MIME 類型保護（X-Content-Type-Options）
5. ✅ XSS 保護（X-XSS-Protection）
6. ✅ 引用策略（Referrer-Policy）
7. ✅ 權限策略（Permissions-Policy）
8. ✅ 速率限制（防止濫用）
9. ✅ CORS 正確配置
10. ✅ Helmet 安全中間件

## 相關資源

- [Google Safe Browsing](https://transparencyreport.google.com/safe-browsing/search)
- [HSTS Preload](https://hstspreload.org/)
- [Security Headers](https://securityheaders.com/)
- [SSL Labs](https://www.ssllabs.com/ssltest/)
- [Mozilla Observatory](https://observatory.mozilla.org/)
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)

## 注意事項

1. **不要過度限制 CSP**：如果 CSP 太嚴格，可能會破壞網站功能
2. **定期更新**：保持依賴項和框架更新到最新版本
3. **監控日誌**：定期檢查後端日誌中的安全警告
4. **備份數據**：確保有定期備份機制
5. **測試變更**：在生產環境部署前，先在測試環境驗證安全配置

遵循這些指南，您的網站應該不會被 Chrome 標記為可疑或危險。

