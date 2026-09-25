# Drive Copy Name + URL

在 Google 雲端硬碟按「複製連結」時，剪貼簿不會只有一串網址，會連同名稱一起複製：

```
會議記錄_2026-01.pdf
https://drive.google.com/file/d/FILE_ID/view?usp=drive_link
```

直接貼到 Slack、LINE、Email、Notion，對方一眼就知道連結是什麼檔案。

## 支援的操作

| 在哪裡按「複製連結」 | 貼上的結果 |
|---|---|
| 檔案列表：在檔案或資料夾上按右鍵，或按該列最右邊的「⋮」→「共用」→「複製連結」 | 檔名 + 網址 |
| 檔案列表：選取檔案後，按上方工具列的連結圖示 | 檔名 + 網址 |
| 共用對話框（「共用『xxx』」視窗）的「複製連結」按鈕 | 檔名 + 網址 |
| 上方路徑列的資料夾名稱 → 下拉選單 →「共用」→「複製連結」 | 資料夾名稱 + 網址 |
| 一次選取多個檔案後複製連結 | 每個檔案各佔一段，中間空一行 |

格式固定是兩行：第一行名稱，第二行網址。

資料夾範例：

```
專案資料夾
https://drive.google.com/drive/folders/FOLDER_ID?usp=drive_link
```

### 附加功能：複製目前分頁

在任何網頁（包括 Google 文件、試算表、簡報）按瀏覽器工具列上的擴充功能圖示，或按 `Alt+Shift+C`，會複製「分頁標題 + 網址」。標題結尾的「- Google 文件」這類字樣會自動去掉。貼到 Google 文件、Gmail、Slack 這類支援格式的地方時，會變成可以點的檔名連結。

## 安裝

目前沒有上架 Chrome 線上應用程式商店，請用開發人員模式載入：

1. 下載這個 repo：按 GitHub 頁面上的 **Code → Download ZIP** 後解壓縮，或執行
   `git clone https://github.com/pon50895/google-chrome-extension-google-drive-copy-name-with-url.git`
2. 在 Chrome 網址列輸入 `chrome://extensions`
3. 打開右上角的「**開發人員模式**」
4. 按「**載入未封裝項目**」，選剛才下載的資料夾
5. **已經開著的 Google 雲端硬碟分頁要重新整理一次**，功能才會生效

## 更新（已經裝過舊版的話）

1. 取得新版：在資料夾裡執行 `git pull`，或重新下載 ZIP，**解壓縮後覆蓋原本載入的那個資料夾**
2. 開 `chrome://extensions`，找到「Drive Copy Name + URL」，按卡片右下角的 **↻ 重新載入** 圖示
3. **把所有已開著的 Google 雲端硬碟分頁重新整理一次**

第 3 步最容易漏掉：沒重新整理的分頁還在跑舊版，會看起來像沒更新或功能失效。

> 如果下載到的是另一個新資料夾，Chrome 仍會讀原本的資料夾。這時請先在 `chrome://extensions` 移除舊的，再用「載入未封裝項目」選新資料夾。

## 注意事項

- 找不到名稱時，剪貼簿維持 Drive 原本複製的網址，不會變成錯誤的內容。
- 名稱是從 Drive 頁面上讀出來的。如果 Google 改版後出現只有網址、沒有名稱的情況，請開 issue。
- 不會把任何資料傳到外部，也不需要登入或授權。只讀目前頁面上的內容，並改寫你自己按下的那次複製。
- 權限：只在 `drive.google.com` 上執行。工具列按鈕用 `activeTab`，只有你按下時才讀取目前分頁的標題和網址。

## 檔案說明

| 檔案 | 用途 |
|---|---|
| `manifest.json` | 擴充功能設定 |
| `content.js` | 在 Drive 上攔截「複製連結」，補上名稱 |
| `popup.html` / `popup.js` | 工具列按鈕：複製目前分頁的標題和網址 |
| `test.js` | 測試，執行 `node test.js` |
