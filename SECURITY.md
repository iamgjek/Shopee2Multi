# 安全最佳實踐

本文檔概述了 Shopee2Multi 實施的安全措施，以保護網站免受常見攻擊。

## 已實施的安全措施

### 1. HTTP 安全頭部（Helmet）

後端使用 [Helmet](https://helmetjs.github.io/) 設置多個安全 HTTP 頭部：

- **Content Security Policy (CSP)**: 防止 XSS 攻擊
- **X-Frame-Options**: 防止點擊劫持（Clickjacking）
- **X-Content-Type-Options**: 防止 MIME 類型嗅探
- **Strict-Transport-Security (HSTS)**: 強制使用 HTTPS
- **Referrer-Policy**: 控制引用來源資訊
- **Permissions-Policy**: 限制瀏覽器功能訪問

### 2. 輸入驗證

- 使用 [Zod](https://zod.dev/) 進行請求體驗證
- 所有用戶輸入都經過驗證和清理
- 防止 SQL 注入（使用參數化查詢）

### 3. 身份驗證與授權

- JWT 令牌用於身份驗證
- 管理員路由受 `requireAdmin` 中間件保護
- 密碼使用 bcrypt 進行哈希處理

### 4. 速率限制

- 使用 `express-rate-limit` 限制 API 請求頻率
- 默認：15 分鐘內最多 100 個請求
- 可通過環境變數配置

### 5. CORS 配置

- 嚴格控制允許的來源
- 僅允許明確列出的域名
- 支持憑證（credentials）

### 6. 數據庫安全

- 使用參數化查詢防止 SQL 注入
- 生產環境使用 SSL 連接
- 連接池配置限制

### 7. 錯誤處理

- 不向客戶端洩露敏感錯誤信息
- 詳細錯誤僅記錄在服務器日誌中

## 如何檢查網站是否被駭

參考 [Google 的指南](https://web.dev/articles/hacked)：

### 常見跡象

1. **瀏覽器警告**: Google Chrome 可能顯示「此網站可能已遭入侵」警告
2. **異常內容**: 網站上出現意外的內容或廣告
3. **重定向**: 訪問網站時被重定向到其他網站
4. **性能下降**: 網站加載速度異常緩慢
5. **搜尋引擎警告**: Google Search Console 顯示安全問題

### 檢查工具

1. **Google Search Console**: 檢查安全問題報告
2. **Google Safe Browsing**: https://transparencyreport.google.com/safe-browsing/search
3. **網站掃描工具**: 使用在線安全掃描服務

## 預防措施

### 1. 定期更新依賴

```bash
npm audit
npm audit fix
```

### 2. 監控日誌

- 定期檢查後端日誌中的異常活動
- 監控失敗的登錄嘗試
- 監控異常的 API 請求模式

### 3. 環境變數安全

- 不要在代碼中硬編碼敏感信息
- 使用強密碼和 JWT_SECRET
- 定期輪換密鑰

### 4. 備份

- 定期備份數據庫
- 保留多個備份副本
- 測試備份恢復流程

### 5. 訪問控制

- 限制管理員帳號數量
- 使用強密碼策略
- 啟用兩因素驗證（如果可能）

## 如果網站被駭

### 立即行動

1. **隔離網站**: 如果可能，暫時關閉網站
2. **更改所有密碼**: 包括數據庫、管理員帳號、部署平台
3. **檢查日誌**: 找出入侵的時間和方法
4. **清理惡意代碼**: 移除所有惡意代碼和後門
5. **更新所有依賴**: 修補已知漏洞
6. **通知用戶**: 如果用戶數據可能受到影響

### 恢復步驟

1. **從乾淨備份恢復**: 使用已知乾淨的備份
2. **修補漏洞**: 確保所有安全漏洞都已修補
3. **重新部署**: 使用最新的安全配置重新部署
4. **請求審查**: 向 Google 請求重新審查網站
5. **監控**: 持續監控網站活動

## 安全檢查清單

- [ ] 所有依賴都是最新版本
- [ ] 環境變數已正確設置且安全
- [ ] 數據庫使用 SSL 連接
- [ ] 速率限制已啟用
- [ ] CORS 配置正確
- [ ] 所有路由都有適當的身份驗證
- [ ] 輸入驗證已實施
- [ ] 錯誤處理不洩露敏感信息
- [ ] 定期備份數據庫
- [ ] 監控日誌已設置

## 相關資源

- [Google 網站被駭指南](https://web.dev/articles/hacked)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Helmet.js 文檔](https://helmetjs.github.io/)
- [Express 安全最佳實踐](https://expressjs.com/en/advanced/best-practice-security.html)

## 報告安全問題

如果您發現安全漏洞，請通過以下方式報告：

- Email: iamgjek@gmail.com
- 請提供詳細的問題描述和重現步驟
- 我們會盡快回應並修復問題

