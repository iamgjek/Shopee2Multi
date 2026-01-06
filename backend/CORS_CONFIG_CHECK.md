# CORS 配置檢查清單

## 環境變數配置

在 Railway Dashboard → 後端服務 → Variables 中，確保設置了以下環境變數：

```
CORS_ORIGIN=https://shopee2multi.vercel.app,https://shopee2multi.space
```

**重要**：
- 多個域名用**逗號分隔**（不要有空格，或確保有空格時代碼會 trim）
- 必須包含完整的協議（`https://`）
- 必須包含完整的域名（不要遺漏 `www.` 如果需要的話）

## 配置驗證

### 1. 檢查環境變數是否正確設置

啟動服務後，查看日誌輸出，應該看到：

```
🌐 CORS Configuration:
   - Allowed origins from env: https://shopee2multi.vercel.app, https://shopee2multi.space
   - Auto-allowing: *.vercel.app, localhost, *.shopee2multi.space
   - Test endpoint: /api/cors-test
   - Health check: /health
```

### 2. 測試 CORS 配置

#### 方法一：使用測試端點

訪問以下 URL（替換為您的後端 URL）：
```
https://your-backend-url.railway.app/api/cors-test
```

應該返回類似以下的 JSON：
```json
{
  "origin": "https://shopee2multi.vercel.app",
  "allowed": true,
  "allowedOrigins": [
    "https://shopee2multi.vercel.app",
    "https://shopee2multi.space"
  ],
  "message": "CORS test endpoint"
}
```

#### 方法二：使用瀏覽器開發者工具

1. 打開前端網站（例如：`https://shopee2multi.vercel.app`）
2. 打開瀏覽器開發者工具（F12）
3. 切換到 Network 標籤
4. 執行任何 API 請求
5. 檢查請求標頭，應該看到：
   - `Access-Control-Allow-Origin: https://shopee2multi.vercel.app`
   - `Access-Control-Allow-Credentials: true`

### 3. 驗證允許的來源

以下來源應該**自動允許**（即使不在環境變數中）：

✅ `https://shopee2multi.vercel.app` - 匹配 `*.vercel.app` 模式
✅ `https://shopee2multi.space` - 匹配 `shopee2multi.space` 模式
✅ `https://any-subdomain.shopee2multi.space` - 匹配 `shopee2multi.space` 模式
✅ `http://localhost:5173` - 匹配 localhost 模式
✅ `http://127.0.0.1:5173` - 匹配 localhost 模式

以下來源需要**在環境變數中明確指定**：

⚠️ `https://www.shopee2multi.space` - 如果需要的話，必須在 `CORS_ORIGIN` 中明確添加
⚠️ 任何其他自定義域名

## 配置邏輯說明

CORS 檢查按以下順序進行：

1. **首先檢查環境變數中明確指定的來源**
   - 如果 `CORS_ORIGIN` 環境變數包含該來源，直接允許

2. **然後檢查自動允許的模式**
   - `*.vercel.app` - 所有 Vercel 預覽部署
   - `shopee2multi.space` - 所有包含此域名的來源
   - `localhost` / `127.0.0.1` - 本地開發

3. **如果都不匹配，則拒絕**

## 常見問題

### Q: 為什麼 `https://shopee2multi.vercel.app` 在環境變數中，但還是會被 `*.vercel.app` 匹配？

A: 這是正常的。即使環境變數中明確指定了，代碼也會先檢查環境變數列表，如果匹配就直接允許。即使沒有在環境變數中，`*.vercel.app` 模式也會自動允許。這是為了確保所有 Vercel 預覽部署都能正常工作。

### Q: 如果環境變數設置錯誤會怎樣？

A: 如果 `CORS_ORIGIN` 環境變數格式錯誤（例如缺少協議），該來源可能無法匹配。但 `*.vercel.app` 和 `shopee2multi.space` 模式仍然會自動允許這些域名。

### Q: 如何確認配置是否生效？

A: 
1. 檢查服務啟動日誌中的 CORS 配置輸出
2. 使用 `/api/cors-test` 端點測試
3. 檢查瀏覽器 Network 標籤中的 CORS 標頭
4. 如果出現 CORS 錯誤，檢查後端日誌中的 CORS 相關訊息

## 當前配置狀態

根據代碼檢查，當前配置應該支援：

- ✅ `https://shopee2multi.vercel.app` - 通過環境變數或 `*.vercel.app` 模式
- ✅ `https://shopee2multi.space` - 通過環境變數或 `shopee2multi.space` 模式
- ✅ 所有 `*.vercel.app` 域名 - 自動允許
- ✅ 所有 `*.shopee2multi.space` 子域名 - 自動允許
- ✅ `localhost` 和 `127.0.0.1` - 自動允許

## 建議的環境變數設置

為了最佳實踐和明確性，建議在 Railway 中設置：

```
CORS_ORIGIN=https://shopee2multi.vercel.app,https://shopee2multi.space
```

這樣可以：
1. 明確記錄允許的來源
2. 即使模式匹配邏輯改變，也能正常工作
3. 在日誌中清楚顯示允許的來源

