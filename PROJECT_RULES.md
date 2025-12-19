# 專案 AI 開發守則 (PROJECT_RULES)

這個檔案用來定義本專案的「不可變規則」，所有 AI Agent 在進行開發時必須優先遵守此檔案的指示。

## 1. 代碼穩定性原則 (Code Stability)
*   **禁止任意重命名**: 除非 User 明確要求，否則**嚴禁**修改現有的變數名稱、函數名稱或類別名稱。如果覺得命名不好，請先「詢問」而非「直接修改」。
*   **保留註解**: 不要刪除現有的 TODO 或重要註解。
*   **最小修改原則**: 修復 Bug 時，只修改必要的行數，不要順便重構周圍無關的代碼。

## 2. 前後端溝通契約 (Interface Contract)
*   **SSOT (Single Source of Truth)**: `API_CONTRACT.md` 是前後端溝通的唯一真理。
    *   **後端開發時**: 修改 API 邏輯前，必須先更新 `API_CONTRACT.md`，User 確認後再寫 Java 代碼。
    *   **前端開發時**: 嚴格按照 `API_CONTRACT.md` 定義的 JSON 結構進行開發，不要猜測欄位名稱。

## 3. 命名慣例 (Naming Convention)
*   **Java (Backend)**: 使用 CamelCase (e.g., `userProfile`)，類別使用 PascalCase (e.g., `UserProfile`)。
*   **JSON/API**: 保持與 Java POJO 一致 (除非有特殊 `@JsonProperty` 定義)。
*   **禁止縮寫**: 使用 `userIdentification` 而非 `uID`，除非該縮寫是全域通用的（如 `id`, `url`）。

## 4. 變更流程
1. 閱讀 `API_CONTRACT.md` 確認需求。
2. 實作功能。
3. 如果發現需要修改欄位（例如 `userId` 改為 `id`），必須先回報 User 並更新 `API_CONTRACT.md`，最後才能修改代碼。
