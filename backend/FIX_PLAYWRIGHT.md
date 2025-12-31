# Playwright 瀏覽器安裝修復指南

## 問題描述

如果遇到以下錯誤：
```
browserType.launch: Executable doesn't exist at /Users/.../chrome-headless-shell
```

這表示 Playwright 瀏覽器尚未安裝。

## 解決方案

### 方法 1: 自動安裝（推薦）

在 `backend` 目錄執行：

```bash
cd backend
npm install
```

`package.json` 中的 `postinstall` 腳本會自動安裝 Playwright 瀏覽器。

### 方法 2: 手動安裝

如果自動安裝失敗，手動執行：

```bash
cd backend
npx playwright install chromium
```

或者安裝所有瀏覽器（包含依賴）：

```bash
cd backend
npx playwright install chromium --with-deps
```

### 方法 3: 僅安裝系統依賴（Linux/macOS）

如果只需要系統依賴：

```bash
npx playwright install-deps chromium
```

## 驗證安裝

執行以下命令驗證 Playwright 是否正確安裝：

```bash
cd backend
npx playwright --version
```

應該會顯示 Playwright 版本號。

## Railway 部署

在 Railway 上部署時，`postinstall` 腳本會自動執行，無需手動操作。

如果 Railway 部署時遇到 Playwright 問題，請檢查：

1. Railway 構建日誌中是否有 `postinstall` 腳本的輸出
2. 確認 `package.json` 中的 `postinstall` 腳本存在
3. Railway 可能需要更多構建時間來下載瀏覽器

## 常見問題

### Q: 安裝時間很長？

A: Playwright 需要下載 Chromium 瀏覽器（約 100-200 MB），首次安裝可能需要幾分鐘。

### Q: 權限錯誤？

A: 確保有寫入 `node_modules` 和快取目錄的權限。

### Q: 在 Docker 中部署？

A: 參考 `Dockerfile`，已包含 Playwright 所需的系統依賴。

