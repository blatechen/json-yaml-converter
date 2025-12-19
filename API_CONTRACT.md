# API 介面契約 (API_CONTRACT)

這個檔案是前後端開發的 **唯一真理 (Single Source of Truth)**。

## 狀態: 草稿 (Draft)

---

## 範例：登入功能 (Example: Login)
### 1. 使用者登入
*   **Endpoint**: `POST /api/v1/auth/login`
*   **Description**: 驗證使用者帳密並回傳 JWT Token。
*   **Request Body (JSON)**:
    ```json
    {
      "username": "admin",  // 必填
      "password": "password123" // 必填
    }
    ```
*   **Response (200 OK)**:
    ```json
    {
      "success": true,
      "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
        "user": {
          "id": 101,
          "name": "Admin User",
          "roles": ["ADMIN"]
        }
      }
    }
    ```
*   **Response (401 Unauthorized)**:
    ```json
    {
      "success": false,
      "error": {
        "code": "AUTH_FAILED",
        "message": "帳號或密碼錯誤"
      }
    }
    ```

---

## 新功能定義區 (在此新增您的 API)

### 2. [功能名稱]
*   **Endpoint**: `GET /api/...`
*   ...
