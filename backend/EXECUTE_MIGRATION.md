# 執行資料庫遷移指南

## 問題
錯誤訊息：`relation "users" does not exist` 表示資料庫表尚未創建。

## 解決方案（選擇一種）

### 方案 1: 在 Railway 上直接執行 SQL（最簡單）

1. 進入 [Railway Dashboard](https://railway.app)
2. 選擇您的 **PostgreSQL 資料庫服務**
3. 點擊 **"Query"** 標籤
4. 複製並貼上 `backend/src/db/schema.sql` 的內容
5. 點擊 **"Run"** 執行

**優點**：最簡單，不需要命令行

### 方案 2: 使用 Railway CLI 執行遷移

1. 安裝 Railway CLI（如果還沒有）：
   ```bash
   npm i -g @railway/cli
   ```

2. 登入 Railway：
   ```bash
   railway login
   ```

3. 連接到專案：
   ```bash
   railway link
   ```

4. 執行遷移：
   ```bash
   cd backend
   railway run npm run migrate
   ```

**優點**：使用遷移腳本，更安全

### 方案 3: 在本地執行（需要資料庫連接）

1. 設置環境變數（從 Railway 複製）：
   ```bash
   export DATABASE_URL="postgresql://user:password@host:port/database"
   # 或設置個別變數
   export PGHOST=...
   export PGPORT=...
   export PGDATABASE=...
   export PGUSER=...
   export PGPASSWORD=...
   ```

2. 執行遷移：
   ```bash
   cd backend
   npm run migrate
   ```

**優點**：可以在本地測試

### 方案 4: 自動遷移（推薦用於生產環境）

修改服務啟動腳本，在服務啟動時自動執行遷移（見下方）

## 推薦：自動遷移腳本

創建一個啟動腳本，在服務啟動時自動檢查並執行遷移。

