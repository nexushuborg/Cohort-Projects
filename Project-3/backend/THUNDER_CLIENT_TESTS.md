# ⚡ Thunder Client API Verification & Test Proofs

This document serves as empirical proof of API verification and endpoint execution for the **PERN Rental Listing Marketplace** backend. All tests were executed live via VS Code's **Thunder Client** extension against `http://localhost:5000/api`.

---

## 📊 Summary of Verified Endpoints

| Test # | Endpoint | Method | Status | Verification Summary |
| :---: | :--- | :---: | :---: | :--- |
| **1** | `/api/auth/register` | `POST` | `400 Bad Request` | Correctly detected existing user in database (`host@test.com`) and blocked duplicate registration. |
| **2** | `/api/auth/login` | `POST` | `200 OK` | Successfully authenticated host user and issued dual JWT token pair (`accessToken` + `refreshToken`). |
| **3** | `/api/auth/login` | `POST` | `200 OK` | Re-verified user payload (`Priya Sharma`, `host@test.com`, role `host`) and token issuance. |
| **4** | `/api/auth/register` | `POST` | `201 Created` | Successfully registered new user (`newuser@test.com`) with role `guest` and returned JWT access token. |

---

## 📸 Test Proofs & Screenshots

### 1. User Registration Duplicate Check (`POST /api/auth/register`)
> [!NOTE]
> Tests duplicate email validation when attempting to register an already existing user (`host@test.com`).

![Duplicate Registration Error Check](file:///C:/Users/Lenovo/.gemini/antigravity/brain/5a1a1729-f5c1-45ad-994b-f0d047f506d8/.user_uploaded/media_1787660214494.png)

* **Status:** `400 Bad Request`
* **Response Body:**
  ```json
  {
    "status": "failed",
    "message": "Email already registered"
  }
  ```

---

### 2. Host Authentication & Dual Token Issue (`POST /api/auth/login`)
> [!IMPORTANT]
> Verifies that logging in with valid credentials returns a 200 OK status, user profile data, a 15-minute `accessToken`, and a 7-day `refreshToken`.

![Host Login Success](file:///C:/Users/Lenovo/.gemini/antigravity/brain/5a1a1729-f5c1-45ad-994b-f0d047f506d8/.user_uploaded/media_1787660237300.png)

* **Status:** `200 OK`
* **Response Body:**
  ```json
  {
    "status": "success",
    "message": "Login successful",
    "data": {
      "id": "b747c79e-ba43-4155-a70c-0cde838272c8",
      "name": "Priya Sharma",
      "email": "host@test.com",
      "role": "host"
    },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
  ```

---

### 3. Login Verification & Session Token Payload (`POST /api/auth/login`)
> [!NOTE]
> Confirms token validity and response payload structure.

![Host Session Token Check](file:///C:/Users/Lenovo/.gemini/antigravity/brain/5a1a1729-f5c1-45ad-994b-f0d047f506d8/.user_uploaded/media_1787660267741.png)

* **Status:** `200 OK`
* **Time:** 136 ms

---

### 4. New User Registration (`POST /api/auth/register`)
> [!IMPORTANT]
> Verifies the registration of a new guest user (`newuser@test.com`), returning status `201 Created` and a fresh access token.

![New User Registration Success](file:///C:/Users/Lenovo/.gemini/antigravity/brain/5a1a1729-f5c1-45ad-994b-f0d047f506d8/.user_uploaded/media_1787660283269.png)

* **Status:** `201 Created`
* **Response Body:**
  ```json
  {
    "status": "success",
    "message": "User created successfully",
    "data": {
      "id": "193e3571-1874-4907-b1a2-1ed20eeb10e2",
      "name": "New User",
      "email": "newuser@test.com",
      "role": "guest"
    },
    "accessToken": "eyJhbGci..."
  }
  ```
