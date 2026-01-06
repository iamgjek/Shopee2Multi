# Resend 郵件服務配置指南

Resend 是 Vercel 官方推薦的郵件服務，配置簡單，適合在 Vercel 和 Railway 上部署的應用。

## 為什麼選擇 Resend？

- ✅ **Vercel 官方推薦**：與 Vercel 完美整合
- ✅ **簡單易用**：只需一個 API Key
- ✅ **免費方案**：每月 3,000 封郵件（測試階段 100 封/天）
- ✅ **高送達率**：專業的郵件基礎設施
- ✅ **無需配置 SMTP**：直接使用 REST API

## 步驟 1: 註冊 Resend 帳號

1. 前往 [Resend](https://resend.com)
2. 點擊 **Sign Up** 註冊帳號（可以使用 GitHub 帳號快速註冊）
3. 完成郵件驗證

## 步驟 2: 獲取 API Key

1. 登入 Resend Dashboard
2. 點擊左側選單的 **API Keys**
3. 點擊 **Create API Key**
4. 輸入名稱（例如：`Shopee2Multi Production`）
5. 選擇權限（建議選擇 **Full Access** 或 **Sending Access**）
6. 點擊 **Add**
7. **複製生成的 API Key**（格式：`re_xxxxxxxxxxxxxxxxxxxxx`）
   - ⚠️ **重要**：API Key 只會顯示一次，請立即複製保存

## 步驟 3: 驗證發送域名（可選）

### 選項 A: 使用測試域名（快速開始）

如果您只是想快速測試，可以使用 Resend 提供的測試域名：
- 發送地址：`onboarding@resend.dev`
- 無需驗證域名
- 僅用於測試，不適合生產環境

### 選項 B: 驗證您的域名（生產環境推薦）

1. 在 Resend Dashboard 中點擊 **Domains**
2. 點擊 **Add Domain**
3. 輸入您的域名（例如：`shopee2multi.space`）
4. 按照指示添加 DNS 記錄：
   - **SPF 記錄**：`v=spf1 include:resend.com ~all`
   - **DKIM 記錄**：Resend 會提供具體的記錄值
   - **DMARC 記錄**（可選）：`v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com`
5. 等待 DNS 驗證完成（通常幾分鐘到幾小時）
6. 驗證完成後，可以使用 `noreply@yourdomain.com` 等地址發送郵件

## 步驟 4: 配置環境變數

### 在 Railway 中配置

1. 登入 [Railway Dashboard](https://railway.app)
2. 選擇您的後端服務
3. 點擊 **Variables** 標籤
4. 添加以下環境變數：

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM=onboarding@resend.dev
ADMIN_EMAIL=iamgjek@gmail.com
SITE_URL=https://shopee2multi.space
```

**說明**：
- `RESEND_API_KEY`：步驟 2 中獲取的 API Key
- `RESEND_FROM`：
  - 測試：使用 `onboarding@resend.dev`
  - 生產：使用已驗證的域名地址，例如 `noreply@shopee2multi.space`
- `ADMIN_EMAIL`：接收聯絡表單通知的郵件地址（設置為 `iamgjek@gmail.com`）
- `SITE_URL`：您的網站 URL（用於郵件中的連結）

### 在本地開發環境配置

在 `backend/.env` 文件中添加：

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM=onboarding@resend.dev
ADMIN_EMAIL=iamgjek@gmail.com
SITE_URL=http://localhost:5173
```

## 步驟 5: 測試郵件發送

1. 重啟後端服務（Railway 會自動重新部署）
2. 在前端提交一個測試聯絡表單
3. 檢查 `iamgjek@gmail.com` 是否收到通知郵件
4. 檢查後端日誌，應該看到：
   ```
   ✅ [郵件服務] 使用 Resend API（Vercel 推薦）
   ✅ [郵件服務] Resend 郵件已發送: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
   ```

## 優先級說明

系統會按以下優先級選擇郵件服務：

1. **Resend**（如果配置了 `RESEND_API_KEY`）
2. **SMTP**（如果未配置 Resend，但配置了 SMTP）
3. **禁用**（如果兩者都未配置）

## 故障排除

### 郵件未發送

1. **檢查 API Key**：
   - 確認 `RESEND_API_KEY` 環境變數已正確設置
   - 確認 API Key 格式正確（以 `re_` 開頭）

2. **檢查發送地址**：
   - 如果使用測試域名 `onboarding@resend.dev`，確認 `RESEND_FROM` 設置正確
   - 如果使用自定義域名，確認域名已驗證

3. **檢查後端日誌**：
   - 查看 Railway 部署日誌
   - 查找 `[郵件服務]` 相關的日誌訊息

4. **檢查 Resend Dashboard**：
   - 登入 Resend Dashboard
   - 查看 **Logs** 標籤，檢查郵件發送狀態
   - 查看是否有錯誤訊息

### 常見錯誤

**錯誤：`Invalid API key`**
- 解決：確認 `RESEND_API_KEY` 正確且未過期

**錯誤：`Domain not verified`**
- 解決：如果使用自定義域名，確認域名已驗證；或使用測試域名 `onboarding@resend.dev`

**錯誤：`Rate limit exceeded`**
- 解決：免費方案每天限制 100 封郵件，等待或升級方案

## 升級到生產環境

當準備好使用生產環境時：

1. **驗證您的域名**（參考步驟 3 選項 B）
2. **更新環境變數**：
   ```
   RESEND_FROM=noreply@shopee2multi.space
   ```
3. **測試發送**：確認郵件正常發送
4. **監控使用量**：在 Resend Dashboard 中監控郵件發送量

## 費用說明

- **免費方案**：
  - 每月 3,000 封郵件
  - 測試階段：每天 100 封
  - 適合小型應用

- **付費方案**：
  - 從 $20/月起
  - 更多郵件配額
  - 優先支援

## 相關資源

- [Resend 官方文檔](https://resend.com/docs)
- [Resend API 參考](https://resend.com/docs/api-reference/emails/send-email)
- [Vercel 郵件服務推薦](https://vercel.com/docs/guides/sending-emails)

配置完成後，每當有新的聯絡表單提交，您就會收到郵件通知到 `iamgjek@gmail.com`！

