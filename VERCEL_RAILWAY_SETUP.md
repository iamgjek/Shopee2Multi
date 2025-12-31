# Vercel & Railway 環境變數設定指南

## 🚀 快速設定步驟

### Railway 後端環境變數設定

#### 步驟 1: 進入後端服務的 Variables 頁面
1. 登入 [Railway](https://railway.app)
2. 進入專案：`cheerful-light`
3. 點擊服務：`hopee2multi-backend`
4. 點擊左側選單的 **Variable** 標籤

#### 步驟 2: 添加環境變數

點擊 **"New Variable"** 按鈕，逐一添加以下環境變數：

##### 基本設定
```
Key: NODE_ENV
Value: production
```

```
Key: PORT
Value: 3001
```

##### JWT 設定
```
Key: JWT_SECRET
Value: syIsmuM7bTvrc5FpQWsSH8oTcHI2B3Dqfq0KFextEFY=
```

```
Key: JWT_EXPIRES_IN
Value: 7d
```

##### CORS 設定
```
Key: CORS_ORIGIN
Value: https://shopee2multi.vercel.app
```
**注意**：請將此值替換為您的實際 Vercel 前端 URL

##### 資料庫連線（重要！）

**方法 1: 使用 Variable Reference（推薦）**

1. 在後端服務的 Variables 頁面，點擊 **"New Variable"**
2. 選擇 **"Variable Reference"** 選項
3. 選擇資料庫服務：`Postgre`
4. 選擇變數：`DATABASE_URL` 或 `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`
5. 如果選擇 `DATABASE_URL`，Railway 會自動創建引用

**方法 2: 手動複製 DATABASE_URL**

1. 進入資料庫服務：`Postgre` → **Variable** 標籤
2. 找到 `DATABASE_URL` 環境變數
3. 點擊 **"Copy value"** 複製連接字串
4. 在後端服務的 Variables 頁面，點擊 **"New Variable"**
5. Key: `DATABASE_URL`
6. Value: 貼上剛才複製的連接字串
7. 點擊 **"Add"** 保存

---

### Vercel 前端環境變數設定

#### 步驟 1: 進入專案的環境變數設定
1. 登入 [Vercel](https://vercel.com)
2. 進入專案：`shopee2multi`
3. 點擊 **Settings** → **Environment Variables**

#### 步驟 2: 添加環境變數

點擊 **"Create new"** 標籤，然後添加：

```
Key: VITE_API_URL
Value: https://hopee2multi-backend-production.up.railway.app
```

**注意**：
- 將 `shopee2multi-backend-production.up.railway.app` 替換為您的實際 Railway 後端 URL
- 如果後端 URL 已包含 `/api`，請直接使用完整 URL
- 如果後端 URL 不包含 `/api`，系統會自動添加

#### 步驟 3: 選擇環境
- 選擇 **"All Environments"**（或分別設定 Production、Preview、Development）
- 點擊 **"Save"** 保存

#### 步驟 4: 重新部署
- 環境變數設定完成後，Vercel 會自動觸發新的部署
- 或手動前往 **Deployments** 頁面觸發重新部署

---

## 📋 環境變數檢查清單

### Railway 後端
- [ ] `NODE_ENV=production`
- [ ] `PORT=3001`
- [ ] `DATABASE_URL`（從資料庫服務引用或手動添加）
- [ ] `JWT_SECRET=syIsmuM7bTvrc5FpQWsSH8oTcHI2B3Dqfq0KFextEFY=`
- [ ] `JWT_EXPIRES_IN=7d`
- [ ] `CORS_ORIGIN=https://shopee2multi.vercel.app`（替換為實際 Vercel URL）

### Vercel 前端
- [ ] `VITE_API_URL=https://shopee2multi-backend-production.up.railway.app`（替換為實際 Railway URL）

---

## 🔍 驗證設定

### Railway 後端
1. 前往後端服務的 **Logs** 頁面
2. 查看啟動日誌，應該看到：
   ```
   ✅ Database connected successfully
   ```
3. 如果看到錯誤，檢查：
   - `DATABASE_URL` 是否正確設定
   - 資料庫服務是否正在運行
   - 後端服務是否已連接到資料庫服務

### Vercel 前端
1. 前往 Vercel 專案的 **Deployments** 頁面
2. 確認最新部署成功
3. 訪問前端 URL，測試 API 連接

---

## 🛠️ 故障排除

### Railway 資料庫連接問題

**問題**：後端無法連接到資料庫

**解決方案**：
1. 確認資料庫服務正在運行（Status: Online）
2. 確認後端服務已連接到資料庫服務：
   - 在專案 Architecture 視圖中，確認兩個服務之間有連接線
   - 如果沒有，點擊資料庫服務 → Settings → Connect → 選擇後端服務
3. 檢查環境變數：
   - 確認 `DATABASE_URL` 已正確設定
   - 或確認 `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` 都已設定

### Vercel API 連接問題

**問題**：前端無法連接到後端 API

**解決方案**：
1. 確認 `VITE_API_URL` 環境變數已正確設定
2. 確認 Railway 後端 URL 正確（不包含 `/api` 後綴）
3. 確認 CORS 設定正確：
   - 在 Railway 後端，確認 `CORS_ORIGIN` 設定為 Vercel 前端 URL
4. 檢查瀏覽器控制台是否有 CORS 錯誤

---

## 📝 重要提示

1. **安全性**：
   - `JWT_SECRET` 必須是強隨機字串
   - 不要將敏感資訊提交到 Git
   - 生產環境請使用不同的 `JWT_SECRET`

2. **重新部署**：
   - Railway：環境變數變更後會自動重新部署
   - Vercel：需要手動觸發重新部署或等待自動部署

3. **URL 格式**：
   - Railway 後端 URL：`https://hopee2multi-backend-production.up.railway.app`
   - Vercel 前端 URL：`https://shopee2multi.vercel.app`
   - 請根據實際情況替換這些 URL

---

## ✅ 完成後檢查

設定完成後，請確認：

1. ✅ Railway 後端服務正常運行
2. ✅ 資料庫連接成功（查看後端日誌）
3. ✅ Vercel 前端部署成功
4. ✅ 前端可以正常調用後端 API
5. ✅ 用戶可以正常登入和註冊

---

**設定完成！** 🎉

如有問題，請檢查上述故障排除部分或查看服務日誌。

