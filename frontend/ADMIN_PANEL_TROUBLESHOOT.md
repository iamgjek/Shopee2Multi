# 管理後台顯示問題診斷指南

## 問題描述

在 production 環境中，管理後台沒有顯示。

## 檢查步驟

### 步驟 1: 確認用戶角色

管理後台只對 `role === 'admin'` 的用戶顯示。

**檢查方法**：

1. 打開瀏覽器開發者工具（F12）
2. 進入 Console 標籤
3. 執行以下命令：
   ```javascript
   // 檢查當前用戶信息
   const authStore = JSON.parse(localStorage.getItem('auth-storage') || '{}');
   console.log('用戶信息:', authStore.state?.user);
   console.log('用戶角色:', authStore.state?.user?.role);
   ```

**預期結果**：
- `role` 應該是 `'admin'`
- 如果 `role` 是 `'user'` 或 `undefined`，則不會顯示管理後台

### 步驟 2: 確認後端返回的角色信息

**檢查方法**：

1. 打開瀏覽器開發者工具 → Network 標籤
2. 登入後，查找 `/api/auth/login` 請求
3. 查看響應中的 `user` 對象：
   ```json
   {
     "success": true,
     "data": {
       "token": "...",
       "user": {
         "id": "...",
         "email": "...",
         "role": "admin"  // 應該是 "admin"
       }
     }
   }
   ```

**如果 `role` 不是 `'admin'`**：
- 需要將用戶角色更新為管理員（見下方）

### 步驟 3: 將用戶設置為管理員

#### 方法 1: 使用資料庫查詢（推薦）

1. 進入 [Railway Dashboard](https://railway.app)
2. 選擇 PostgreSQL 資料庫服務
3. 點擊 **"Query"** 標籤
4. 執行以下 SQL：

```sql
-- 將指定用戶設置為管理員（替換 email）
UPDATE users 
SET role = 'admin' 
WHERE email = 'your-admin-email@example.com';

-- 驗證更新
SELECT id, email, role, plan FROM users WHERE email = 'your-admin-email@example.com';
```

#### 方法 2: 使用後端 API（如果已有管理員）

如果有其他管理員帳號，可以通過管理後台更新用戶角色。

#### 方法 3: 使用遷移腳本

如果還沒有管理員，可以使用 `create-admin.sql` 腳本創建：

1. Railway Dashboard → 資料庫服務 → Query
2. 執行 `backend/src/db/create-admin.sql` 的內容

### 步驟 4: 重新登入

更新角色後，需要：

1. **清除瀏覽器緩存**：
   - 打開開發者工具（F12）
   - Application 標籤 → Local Storage
   - 刪除 `auth-storage` 項
   - 或執行：`localStorage.removeItem('auth-storage')`

2. **重新登入**：
   - 登出當前帳號
   - 重新登入
   - 管理後台應該會顯示

### 步驟 5: 檢查管理後台顯示位置

管理後台鏈接會顯示在以下位置：

1. **桌面導航欄**（僅管理員可見）：
   - 在 "轉檔工具" 鏈接旁邊
   - 顯示為 "管理後台"

2. **用戶下拉菜單**（僅管理員可見）：
   - 點擊右上角用戶頭像
   - 在菜單中顯示 "管理後台"

3. **移動端抽屜菜單**（僅管理員可見）：
   - 點擊左上角漢堡菜單
   - 在菜單中顯示 "管理後台"

## 常見問題

### Q: 為什麼我看不到管理後台鏈接？

**A**: 可能的原因：
1. 用戶角色不是 `'admin'`
2. 瀏覽器緩存了舊的用戶信息
3. 後端沒有正確返回 `role` 字段

**解決方案**：
1. 檢查用戶角色（見步驟 1）
2. 清除瀏覽器緩存並重新登入
3. 檢查後端響應（見步驟 2）

### Q: 如何確認用戶是否真的是管理員？

**A**: 檢查資料庫：

```sql
SELECT id, email, role, plan, status 
FROM users 
WHERE email = 'your-email@example.com';
```

`role` 列應該是 `'admin'`。

### Q: 更新角色後仍然看不到管理後台？

**A**: 
1. 確認已清除瀏覽器緩存
2. 確認已重新登入
3. 檢查瀏覽器控制台是否有錯誤
4. 檢查 Network 標籤，確認登入響應包含 `role: 'admin'`

### Q: 如何創建第一個管理員？

**A**: 使用 SQL 查詢：

```sql
-- 方法 1: 更新現有用戶
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

-- 方法 2: 創建新管理員（使用 create-admin.sql）
-- 見 backend/src/db/create-admin.sql
```

## 驗證清單

- [ ] 用戶角色在資料庫中是 `'admin'`
- [ ] 登入 API 響應包含 `role: 'admin'`
- [ ] 瀏覽器 localStorage 中的用戶信息包含 `role: 'admin'`
- [ ] 已清除瀏覽器緩存
- [ ] 已重新登入
- [ ] 管理後台鏈接在桌面導航欄顯示
- [ ] 管理後台鏈接在用戶下拉菜單顯示
- [ ] 可以直接訪問 `/admin` 路由

## 如果問題仍然存在

請提供以下信息：

1. **瀏覽器控制台輸出**（特別是 localStorage 中的用戶信息）
2. **Network 標籤中的登入響應**（隱藏敏感信息）
3. **資料庫查詢結果**（用戶角色）
4. **是否能看到管理後台鏈接**（在哪個位置）

