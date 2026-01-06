# Gmail SMTP 配置指南

本指南將幫助您配置 Gmail SMTP 來發送聯絡表單通知郵件。

## 步驟 1: 啟用 Gmail 兩步驟驗證

1. 前往 [Google 帳戶安全設定](https://myaccount.google.com/security)
2. 在「登入 Google」區塊中，找到「兩步驟驗證」
3. 如果尚未啟用，請點擊「開始使用」並按照指示完成設定
4. **重要**：必須啟用兩步驟驗證才能生成應用程式密碼

## 步驟 2: 生成應用程式密碼

1. 前往 [Google 帳戶應用程式密碼頁面](https://myaccount.google.com/apppasswords)
   - 如果直接訪問無法找到，請：
     - 前往 [Google 帳戶](https://myaccount.google.com/)
     - 點擊左側「安全性」
     - 在「登入 Google」區塊中找到「兩步驟驗證」
     - 點擊進入後，在頁面底部找到「應用程式密碼」

2. 選擇應用程式和裝置：
   - **應用程式**：選擇「郵件」
   - **裝置**：選擇「其他（自訂名稱）」，輸入「Shopee2Multi」

3. 點擊「產生」

4. **複製生成的 16 位應用程式密碼**（格式：xxxx xxxx xxxx xxxx）
   - ⚠️ **重要**：這個密碼只會顯示一次，請立即複製保存
   - 如果忘記，需要重新生成

## 步驟 3: 配置環境變數

### 在 Railway 中配置

1. 登入 [Railway Dashboard](https://railway.app)
2. 選擇您的後端服務
3. 點擊 **Variables** 標籤
4. 添加以下環境變數：

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=iamgjek@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
SMTP_FROM=service@shopee2multi.space
ADMIN_EMAIL=iamgjek@gmail.com
SITE_URL=https://shopee2multi.space
```

**注意**：
- 將 `your-email@gmail.com` 替換為您的 Gmail 地址
- 將 `xxxx xxxx xxxx xxxx` 替換為步驟 2 生成的應用程式密碼（可以包含空格，也可以移除空格）
- `SMTP_FROM` 可以設置為您的 Gmail 地址或自定義名稱

### 在本地開發環境配置

在 `backend/.env` 文件中添加：

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
SMTP_FROM=noreply@shopee2multi.space
ADMIN_EMAIL=iamgjek@gmail.com
SITE_URL=http://localhost:5173
```

## 步驟 4: 驗證配置

1. 重新啟動後端服務（Railway 會自動重新部署）
2. 檢查後端日誌，應該看到：
   ```
   ✅ [郵件服務] SMTP 傳輸器已初始化
   ```

3. 測試郵件發送：
   - 訪問網站並提交聯絡表單
   - 檢查 `iamgjek@gmail.com` 是否收到通知郵件

## 常見問題

### Q: 為什麼需要使用應用程式密碼而不是 Gmail 密碼？

A: Google 為了安全，不允許直接使用 Gmail 帳號密碼。必須使用應用程式密碼，這是專為第三方應用程式設計的。

### Q: 應用程式密碼忘記了怎麼辦？

A: 可以重新生成新的應用程式密碼，然後更新環境變數。舊的應用程式密碼會自動失效。

### Q: 可以多個應用程式使用同一個應用程式密碼嗎？

A: 可以，但為了安全建議為每個應用程式生成獨立的應用程式密碼。

### Q: 收到「登入嘗試被阻止」的郵件怎麼辦？

A: 這是 Google 的安全機制。如果您的應用程式密碼正確，可以忽略此郵件，或前往 [Google 帳戶安全設定](https://myaccount.google.com/security) 確認沒有異常活動。

### Q: 郵件發送失敗怎麼辦？

檢查以下幾點：
1. 確認兩步驟驗證已啟用
2. 確認應用程式密碼正確（沒有多餘空格）
3. 確認 `SMTP_USER` 是完整的 Gmail 地址
4. 檢查後端日誌中的錯誤訊息
5. 確認防火牆允許連接到 `smtp.gmail.com:587`

### Q: 可以使用其他 Gmail 帳號發送郵件嗎？

A: 可以，只需：
1. 為該 Gmail 帳號啟用兩步驟驗證
2. 生成應用程式密碼
3. 更新 `SMTP_USER` 和 `SMTP_PASSWORD` 環境變數

## 安全建議

1. **不要將應用程式密碼提交到 Git**
   - 確保 `.env` 文件在 `.gitignore` 中
   - 在 Railway 中使用環境變數功能（加密存儲）

2. **定期輪換應用程式密碼**
   - 如果懷疑密碼洩露，立即生成新的應用程式密碼

3. **使用專用郵件帳號**
   - 考慮創建專用的 Gmail 帳號用於發送系統郵件
   - 不要使用個人主要 Gmail 帳號

## 替代方案

如果不想使用 Gmail SMTP，可以考慮：

1. **SendGrid**（推薦用於生產環境）
   - 免費方案：每月 100 封郵件
   - 更穩定的送達率
   - 更好的分析功能

2. **Mailgun**
   - 免費方案：每月 5,000 封郵件（前 3 個月）
   - 適合高流量應用

3. **AWS SES**
   - 按使用量付費
   - 適合大型應用

配置完成後，每當有新的聯絡表單提交，您就會收到郵件通知到 `iamgjek@gmail.com`！

