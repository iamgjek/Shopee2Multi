# GitHub 推送指南

## 步驟 1: 在 GitHub 上創建新倉庫

1. 登入 [GitHub](https://github.com)
2. 點擊右上角的 "+" → "New repository"
3. 填寫倉庫資訊：
   - **Repository name**: `Shopee2Multi`（或您喜歡的名稱）
   - **Description**: `電商跨平台自動化轉檔 SaaS 平台`
   - **Visibility**: 選擇 Public 或 Private
   - **不要**勾選 "Initialize this repository with a README"（我們已經有代碼了）
4. 點擊 "Create repository"

## 步驟 2: 連接本地倉庫到 GitHub

GitHub 會顯示連接指令，使用以下命令：

```bash
cd /Users/ian/Repo/Shopee2Multi

# 添加遠程倉庫（將 YOUR_USERNAME 替換為您的 GitHub 用戶名）
git remote add origin https://github.com/iamgjek/Shopee2Multi.git

# 或者使用 SSH（如果您已設置 SSH 密鑰）
# git remote add origin git@github.com:YOUR_USERNAME/Shopee2Multi.git

# 推送到 GitHub
git push -u origin main
```

## 步驟 3: 驗證推送

推送完成後，刷新 GitHub 頁面，您應該能看到所有文件。

## 使用 SSH（可選，推薦）

如果您想使用 SSH 連接（更安全且方便），需要：

1. 生成 SSH 密鑰（如果還沒有）：
   ```bash
   ssh-keygen -t ed25519 -C "iamgjek@gmail.com"
   ```

2. 將公鑰添加到 GitHub：
   ```bash
   cat ~/.ssh/id_ed25519.pub
   # 複製輸出的內容
   ```
   然後在 GitHub → Settings → SSH and GPG keys → New SSH key 中貼上

3. 使用 SSH URL 連接：
   ```bash
   git remote set-url origin git@github.com:iamgjek/Shopee2Multi.git
   ```

## 快速命令參考

```bash
# 查看遠程倉庫
git remote -v

# 推送代碼
git push

# 查看狀態
git status

# 添加新文件並提交
git add .
git commit -m "您的提交訊息"
git push
```

