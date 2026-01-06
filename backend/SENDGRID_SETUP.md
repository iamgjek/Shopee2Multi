# SendGrid SMTP 配置指南

如果 Gmail SMTP 在 Railway 等雲平台上無法連接（連接超時），建議使用 SendGrid 作為替代方案。SendGrid 在生產環境中更穩定可靠。

## 為什麼使用 SendGrid？

1. **更穩定的連接**: 專為雲平台設計，不會被防火牆阻止
2. **更好的送達率**: 專業的郵件服務，送達率更高
3. **免費方案**: 每月 100 封郵件（足夠小型應用使用）
4. **更好的分析**: 提供郵件發送統計和分析
5. **無需應用程式密碼**: 使用 API Key，配置更簡單

## 步驟 1: 註冊 SendGrid 帳號

1. 前往 [SendGrid 官網](https://sendgrid.com/)
2. 點擊「Start for free」註冊免費帳號
3. 完成郵箱驗證

## 步驟 2: 創建 API Key

1. 登入 SendGrid Dashboard
2. 前往 **Settings** → **API Keys**
3. 點擊 **Create API Key**
4. 設置：
   - **API Key Name**: `Shopee2Multi`
   - **API Key Permissions**: 選擇 **Full Access** 或 **Restricted Access** → **Mail Send** → **Full Access**
5. 點擊 **Create & View**
6. **複製 API Key**（只會顯示一次，請立即保存）

## 步驟 3: 驗證發送者身份

### 選項 1: 單一發送者驗證（推薦用於測試）

1. 前往 **Settings** → **Sender Authentication** → **Single Sender Verification**
2. 點擊 **Create New Sender**
3. 填寫表單：
   - **From Email Address**: `noreply@shopee2multi.space`（或您的域名郵箱）
   - **From Name**: `Shopee2Multi`
   - **Reply To**: `iamgjek@gmail.com`
   - **Company Address**: 您的公司地址
   - **City**: 您的城市
   - **State**: 您的州/省
   - **Country**: 您的國家
   - **Zip Code**: 郵政編碼
4. 點擊 **Create**
5. 檢查郵箱並點擊驗證連結

### 選項 2: 域名驗證（推薦用於生產環境）

1. 前往 **Settings** → **Sender Authentication** → **Domain Authentication**
2. 點擊 **Authenticate Your Domain**
3. 選擇您的 DNS 提供商（或選擇 **Other**）
4. 按照指示添加 DNS 記錄到您的域名
5. 等待驗證完成（可能需要幾分鐘到幾小時）

## 步驟 4: 配置環境變數

在 Railway 後端服務的 Variables 中添加：

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SMTP_FROM=noreply@shopee2multi.space
ADMIN_EMAIL=iamgjek@gmail.com
SITE_URL=https://shopee2multi.space
```

**重要**：
- `SMTP_USER` 必須設置為 `apikey`（固定值）
- `SMTP_PASSWORD` 替換為步驟 2 創建的 API Key
- `SMTP_FROM` 必須是已驗證的發送者郵箱

## 步驟 5: 驗證配置

1. Railway 會自動重新部署
2. 檢查後端日誌，應該看到：
   ```
   ✅ [郵件服務] SMTP 傳輸器已初始化
   主機: smtp.sendgrid.net:587
   用戶: apikey
   ✅ [郵件服務] SMTP 連接驗證成功
   ```

3. 測試郵件發送：
   - 訪問網站並提交聯絡表單
   - 檢查 `iamgjek@gmail.com` 是否收到通知郵件

## 免費方案限制

SendGrid 免費方案包括：
- **每月 100 封郵件**
- **每天最多 100 封郵件**
- 所有核心功能

對於小型應用，這通常足夠使用。

## 升級方案

如果需要更多郵件配額：
- **Essentials**: $19.95/月，50,000 封郵件
- **Pro**: $89.95/月，100,000 封郵件
- **Premier**: 自定義配額

## 常見問題

### Q: SendGrid 和 Gmail SMTP 有什麼區別？

A: 
- **SendGrid**: 專業郵件服務，專為應用程式設計，連接穩定
- **Gmail SMTP**: 個人郵件服務，可能被某些雲平台阻止

### Q: 為什麼 Gmail SMTP 在 Railway 上連接超時？

A: Railway 的網絡環境可能無法訪問 Gmail SMTP 服務器，或者被防火牆阻止。這是常見問題，使用 SendGrid 可以解決。

### Q: 可以同時使用多個 SMTP 服務嗎？

A: 可以，但需要修改代碼。目前系統只支持一個 SMTP 配置。

### Q: SendGrid API Key 洩露了怎麼辦？

A: 立即在 SendGrid Dashboard 中刪除該 API Key，然後創建新的。

## 安全建議

1. **保護 API Key**: 
   - 不要在代碼中硬編碼
   - 使用環境變數存儲
   - 不要提交到 Git

2. **定期輪換**: 
   - 定期更新 API Key
   - 如果懷疑洩露，立即更換

3. **限制權限**: 
   - 創建 API Key 時選擇最小必要權限
   - 僅授予「Mail Send」權限

## 監控和統計

SendGrid Dashboard 提供：
- 郵件發送統計
- 送達率分析
- 點擊和打開率
- 錯誤日誌

定期檢查這些數據，確保郵件正常發送。

## 從 Gmail 遷移到 SendGrid

1. 在 SendGrid 中完成設置（步驟 1-3）
2. 更新 Railway 環境變數（步驟 4）
3. 測試郵件發送
4. 確認正常後，可以移除 Gmail 配置

配置完成後，郵件發送應該會更穩定可靠！

