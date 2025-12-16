# 🧪 測試報告與指令 (Test Report & Commands)

本專案使用 **Playwright** 進行端對端 (E2E) 測試，確保所有核心功能運作正常。

## 🚀 測試指令

在專案根目錄下執行以下指令：

### 執行所有測試
```bash
npm run test:e2e
```
或者使用：
```bash
npx playwright test
```

### 查看 HTML 測試報告
測試完成後，如有需要查看詳細的圖形化報告，請執行：
```bash
npx playwright show-report
```

---

## 📊 最新測試結果摘要

- **測試日期**: 2025-12-16
- **總測試數**: 10
- **通過**: ✅ 10
- **失敗**: ❌ 0

### 測試覆蓋範圍

| 測試檔案 | 描述 | 結果 |
| :--- | :--- | :--- |
| `navigation.spec.js` | **導航測試**<br>驗證首頁重定向與頁面路由功能 | ✅ 通過 |
| `json-formatter.spec.js` | **JSON 格式化**<br>驗證正確的 JSON 格式化與錯誤 JSON 的提示訊息 | ✅ 通過 |
| `props-yaml.spec.js` | **Properties ⟷ YAML**<br>驗證雙向轉換功能的正確性 | ✅ 通過 |
| `json-pojo.spec.js` | **JSON 轉 POJO**<br>驗證 JSON 轉換為 Java 類別的功能與異常處理 | ✅ 通過 |
| `image-tools.spec.js` | **圖片工具**<br>驗證圖片轉 Base64 與 OCR 上傳流程 | ✅ 通過 |

## 🛠️ 環境配置

測試配置檔案位於 `playwright.config.js`。
- **Browser**: Chromium (預設)
- **Base URL**: http://localhost:5173
- **Headless**: 是 (CI/CLI 模式)

如需進行除錯模式 (開啟瀏覽器視窗)，可使用：
```bash
npx playwright test --headed
```
