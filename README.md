# 🛠️ 格式化工具 (Format Tools)

> JSON 格式化 • Properties ⟷ YAML 轉換 • JSON 轉 Java POJO • 圖片轉 Base64 • OCR 文字辨識

基於 **Vue 3 + Vite** 的前端格式化工具集，提供多種實用的開發者工具。

---

##  快速開始

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建構生產版本
# 建構生產版本
npm run build

# 執行 E2E 測試 (Playwright)
npm run test:e2e
```

開啟 http://localhost:5173 即可使用

---

## 📋 選單結構

```
格式化工具
└── JSON 格式化

圖片處理
├── 圖片轉 Base64
└── OCR 文字辨識

格式轉換
├── Properties ⟷ YAML
└── JSON 轉 Java POJO
```

---

## ✨ 功能總覽

### JSON 格式化

| 功能 | 說明 |
|------|------|
| **格式化** | JSON 美化，縮排 2 空格 |
| **非標準支援** | 支援 `{a:""}` 未加引號 key、尾部逗號 |
| **錯誤定位** | 顯示錯誤行號並高亮標示 |
| **折疊/展開** | 支援 `{` 和 `[` 的內容折疊 |

### Properties ⟷ YAML 轉換

| 功能 | 說明 |
|------|------|
| **雙向轉換** | Properties ↔ YAML 互相轉換 |
| **巢狀結構** | `server.port=8080` → YAML 巢狀 |

### JSON 轉 Java POJO

| 功能 | 說明 |
|------|------|
| **傳統模式** | 生成 Getter/Setter 方法 |
| **Lombok** | `@Data` + `@NoArgsConstructor` + `@AllArgsConstructor` |
| **Lombok + Builder** | 額外加上 `@Builder` 註解 |
| **巢狀支援** | 自動處理巢狀物件和陣列 |

### 圖片轉 Base64

| 功能 | 說明 |
|------|------|
| **拖放上傳** | 支援拖放多張圖片 |
| **複製格式** | Data URL 和 Raw Base64 |

### OCR 文字辨識

| 功能 | 說明 |
|------|------|
| **多語言** | 正體中文、簡體中文、英文 |
| **進度顯示** | 即時顯示辨識進度 |

---

## 🏗️ 技術架構

| 技術 | 說明 |
|------|------|
| **Vue 3** | 前端框架 |
| **Vite** | 建構工具 |
| **Vue Router** | 路由管理 |
| **js-yaml** | YAML 解析 |
| **Tesseract.js** | OCR 辨識 |

---

## 📅 更新日誌

| 日期 | 版本 | 說明 |
|------|------|------|
| 2025-12-16 | v2.1.0 | 新增格式轉換選單、JSON 轉 POJO (支援 Lombok) |
| 2025-12-16 | v2.0.0 | 重構為 Vue 3 + Vite |
| 2025-12-14 | v1.1.0 | 新增圖片處理功能 |
| 2025-12-14 | v1.0.0 | 初始版本 |
