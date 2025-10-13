# E-Wallet Backend API Reference

**Base URL:** `http://101.46.58.237:8080/api/v1`  
**Version:** 1.0.0  
**Server Status:** ✅ UP  
**Last Updated:** October 7, 2025

---

## 📑 Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [Verification APIs](#verification-apis)
3. [Nafath APIs](#nafath-apis)
4. [Onboarding APIs](#onboarding-apis)
5. [KYB APIs](#kyb-apis)
6. [Health Check APIs](#health-check-apis)

---

## 🔐 Authentication APIs

### 1. Send OTP
**Endpoint:** `POST /auth/send-otp`  
**Description:** Send OTP to phone number for verification  
**Authentication:** None

**Request Body:**
```json
{
  "phoneNumber": "+966501234567",
  "businessType": "freelancer"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

---

### 2. Verify OTP
**Endpoint:** `POST /auth/verify-otp`  
**Description:** Verify OTP code and get user status  
**Authentication:** None

**Request Body:**
```json
{
  "phoneNumber": "+966501234567",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "userId": "12345",
  "nextStep": "set_credentials",
  "hasPassword": false,
  "hasPasscode": false
}
```

---

### 3. Set Password
**Endpoint:** `POST /auth/set-password`  
**Description:** Set password for user account  
**Authentication:** None

**Request Body:**
```json
{
  "userId": "12345",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password set successfully"
}
```

---

### 4. Set Passcode
**Endpoint:** `POST /auth/set-passcode`  
**Description:** Set numeric passcode for user account  
**Authentication:** None

**Request Body:**
```json
{
  "userId": "12345",
  "passcode": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Passcode set successfully"
}
```

---

### 5. Enable Biometric
**Endpoint:** `POST /auth/enable-biometric`  
**Description:** Enable biometric authentication for user  
**Authentication:** Required

**Request Body:**
```json
{
  "userId": "12345",
  "biometricToken": "fingerprint_hash_or_token",
  "deviceId": "device_unique_id"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Biometric enabled successfully"
}
```

---

### 6. Login with Password
**Endpoint:** `POST /auth/login/password`  
**Description:** Login using email/phone and password  
**Authentication:** None

**Request Body:**
```json
{
  "emailOrPhone": "+966501234567",
  "password": "SecurePass123!",
  "device": {
    "platform": "web",
    "userAgent": "Mozilla/5.0...",
    "screenResolution": "1920x1080",
    "timezone": "Asia/Riyadh"
  }
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600,
  "userId": "12345"
}
```

---

### 7. Login with Passcode
**Endpoint:** `POST /auth/login/passcode`  
**Description:** Login using phone and passcode  
**Authentication:** None

**Request Body:**
```json
{
  "phoneNumber": "+966501234567",
  "passcode": "123456"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600,
  "userId": "12345"
}
```

---

### 8. Login with Biometric
**Endpoint:** `POST /auth/login/biometric`  
**Description:** Login using biometric authentication  
**Authentication:** None

**Request Body:**
```json
{
  "userId": "12345",
  "biometricToken": "fingerprint_hash_or_token",
  "deviceId": "device_unique_id"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600,
  "userId": "12345"
}
```

---

### 9. Refresh Token
**Endpoint:** `POST /auth/refresh`  
**Description:** Refresh access token using refresh token  
**Authentication:** None

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 3600
}
```

---

### 10. Logout
**Endpoint:** `POST /auth/logout`  
**Description:** Logout and revoke all user sessions  
**Authentication:** Required (Bearer Token)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response:**
```
200 OK (No content)
```

---

### 11. Check Phone Uniqueness
**Endpoint:** `POST /auth/phone-uniqueness`  
**Description:** Check if phone number is available for registration  
**Authentication:** None

**Request Body:**
```json
{
  "phoneE164": "+966501234567"
}
```

**Response:**
```json
{
  "phoneE164": "+966501234567",
  "unique": true,
  "message": "Phone number is available"
}
```

---

## ✅ Verification APIs

### 1. Validate CR Number
**Endpoint:** `POST /verification/validate-cr`  
**Description:** Validate commercial registration number  
**Authentication:** None

**Request Body:**
```json
{
  "crNumber": "1234567890"
}
```

**Response:**
```json
{
  "valid": true,
  "companyName": "Tech Solutions LLC",
  "companyNameArabic": "شركة الحلول التقنية",
  "issueDate": "2020-01-15",
  "expiryDate": "2030-01-15",
  "status": "active"
}
```

---

### 2. Validate Freelancer License
**Endpoint:** `POST /verification/validate-freelancer-license`  
**Description:** Validate freelancer license number  
**Authentication:** None

**Request Body:**
```json
{
  "licenseNumber": "FL123456789",
  "nationalId": "1234567890"
}
```

**Response:**
```json
{
  "valid": true,
  "freelancerName": "Ahmed Mohammed",
  "profession": "Software Developer",
  "expiry": "2030-12-31"
}
```

---

### 3. Validate National ID
**Endpoint:** `POST /verification/validate-id`  
**Description:** Validate national ID number with SIM matching  
**Authentication:** None

**Request Body:**
```json
{
  "nationalId": "1234567890",
  "phoneE164": "+966501234567"
}
```

**Response:**
```json
{
  "valid": true,
  "match": true,
  "confidence": 0.98,
  "riskScore": 10,
  "decision": "approved"
}
```

---

## 🆔 Nafath APIs

### 1. Initiate Nafath Verification
**Endpoint:** `POST /nafath/initiate`  
**Description:** Start Nafath identity verification process  
**Authentication:** None

**Request Body:**
```json
{
  "nationalId": "1234567890",
  "phoneE164": "+966501234567"
}
```

**Response:**
```json
{
  "sessionId": "nafath_abc123xyz",
  "status": "pending",
  "message": "Nafath verification initiated",
  "redirectUrl": "https://nafath.sa/verify?session=abc123"
}
```

---

### 2. Get Nafath Status
**Endpoint:** `GET /nafath/status/{sessionId}`  
**Description:** Check status of Nafath verification session  
**Authentication:** None

**URL Parameters:**
- `sessionId`: Nafath session ID

**Response:**
```json
{
  "sessionId": "nafath_abc123xyz",
  "status": "approved",
  "nationalId": "1234567890",
  "fullName": "Ahmed Mohammed Ali",
  "dateOfBirth": "1990-01-15",
  "message": "Verification completed successfully"
}
```

**Status Values:**
- `pending` - Waiting for user action
- `approved` - Verification successful
- `rejected` - Verification rejected by user
- `expired` - Session expired

---

## 🏢 Onboarding APIs

### 1. Create Profile
**Endpoint:** `POST /onboarding/create-profile`  
**Description:** Create business onboarding profile  
**Authentication:** None

**Request Body:**
```json
{
  "userId": "12345",
  "businessType": "COMPANY",
  "businessName": "Tech Solutions LLC",
  "businessNameArabic": "شركة الحلول التقنية",
  "crNumber": "1234567890",
  "nationalId": "1234567890",
  "phoneE164": "+966501234567",
  "annualRevenue": "100k_500k",
  "businessActivity": "it_services",
  "accountPurpose": "business_payments, payroll"
}
```

**Response:**
```json
{
  "profileId": "prof_abc123",
  "status": "created",
  "nextStep": "kyc_verification",
  "message": "Profile created successfully"
}
```

---

### 2. Get Onboarding Status
**Endpoint:** `GET /onboarding/status`  
**Description:** Get current onboarding status for user  
**Authentication:** Required

**Query Parameters:**
- `userId`: User ID

**Response:**
```json
{
  "userId": "12345",
  "currentStep": "kyb_verification",
  "completedSteps": ["phone_verification", "otp_verification", "cr_verification"],
  "status": "in_progress",
  "percentComplete": 75
}
```

---

## 📊 KYB APIs

### 1. Get KYB Options
**Endpoint:** `GET /kyb/options`  
**Description:** Get dropdown options for KYB forms  
**Authentication:** None

**Query Parameters:**
- `category`: Category of options (`annual_revenue`, `business_activity`, `purpose_of_account`)
- `locale`: Language locale (default: `en`)

**Example:**
```
GET /kyb/options?category=annual_revenue&locale=en
```

**Response:**
```json
{
  "items": [
    {
      "id": "1",
      "label": "Less than $100K",
      "code": "under_100k",
      "order": 1
    },
    {
      "id": "2",
      "label": "$100K - $500K",
      "code": "100k_500k",
      "order": 2
    },
    {
      "id": "3",
      "label": "$500K - $1M",
      "code": "500k_1m",
      "order": 3
    }
  ]
}
```

**Available Categories:**
1. **`annual_revenue`** - Annual revenue ranges
   - Less than $100K
   - $100K - $500K
   - $500K - $1M
   - $1M - $5M
   - $5M - $10M
   - More than $10M

2. **`business_activity`** - Business activity types
   - Retail & E-commerce
   - IT Services & Software
   - Construction & Engineering
   - Healthcare & Medical
   - Education & Training
   - Financial Services
   - Real Estate
   - Manufacturing
   - Food & Beverage
   - Transportation & Logistics
   - Consulting & Professional Services
   - Other

3. **`purpose_of_account`** - Purpose of account
   - Business Payments
   - Client Billing
   - Supplier Payments
   - Payroll & Employee Payments
   - Investment & Savings
   - Cash Management
   - Online Commerce
   - Government Payments
   - Tax Payments
   - Emergency Fund
   - Other Business Operations

---

## ❤️ Health Check APIs

### 1. Health Check
**Endpoint:** `GET /health`  
**Description:** Check application health status  
**Authentication:** None

**Response:**
```json
{
  "status": "UP",
  "timestamp": "2025-10-07T11:35:59.198Z",
  "service": "ewallet-backend"
}
```

---

### 2. Status Check
**Endpoint:** `GET /status`  
**Description:** Get application status and version  
**Authentication:** None

**Response:**
```json
{
  "status": "RUNNING",
  "version": "1.0.0",
  "timestamp": "2025-10-07T11:35:59.198Z"
}
```

---

## 🔒 Authentication & Security

### Bearer Token Authentication
Most protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Public Endpoints (No Auth Required)
- All `/auth/*` endpoints (except logout)
- All `/verification/*` endpoints
- All `/nafath/*` endpoints
- `/kyb/options`
- `/health` and `/status`

### Protected Endpoints (Auth Required)
- `/auth/logout`
- `/onboarding/status`

---

## 📝 Common Error Responses

### 400 Bad Request
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid phone number format",
  "timestamp": "2025-10-07T11:35:59.198Z"
}
```

### 401 Unauthorized
```json
{
  "error": "UNAUTHORIZED",
  "message": "Invalid or expired token",
  "timestamp": "2025-10-07T11:35:59.198Z"
}
```

### 404 Not Found
```json
{
  "error": "NOT_FOUND",
  "message": "Resource not found",
  "timestamp": "2025-10-07T11:35:59.198Z"
}
```

### 409 Conflict
```json
{
  "error": "PHONE_DUPLICATE",
  "message": "Phone number already registered",
  "timestamp": "2025-10-07T11:35:59.198Z"
}
```

### 422 Unprocessable Entity
```json
{
  "error": "CR_VERIFICATION_FAILED",
  "message": "CR Number not found in commercial registry",
  "timestamp": "2025-10-07T11:35:59.198Z"
}
```

### 500 Internal Server Error
```json
{
  "error": "INTERNAL_ERROR",
  "message": "An unexpected error occurred",
  "timestamp": "2025-10-07T11:35:59.198Z"
}
```

---

## 🧪 Testing the APIs

### Using cURL

**Test Health Check:**
```bash
curl http://101.46.58.237:8080/api/v1/health
```

**Send OTP:**
```bash
curl -X POST http://101.46.58.237:8080/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+966501234567",
    "businessType": "freelancer"
  }'
```

**Verify OTP:**
```bash
curl -X POST http://101.46.58.237:8080/api/v1/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+966501234567",
    "otp": "123456"
  }'
```

**Get KYB Options:**
```bash
curl 'http://101.46.58.237:8080/api/v1/kyb/options?category=annual_revenue&locale=en'
```

---

## 📚 Additional Resources

- **OpenAPI Spec:** Available at `/src/main/resources/openapi/ewallet.yaml`
- **Swagger UI:** May be available at `http://101.46.58.237:8080/swagger-ui.html` (if enabled)
- **API Documentation:** This file

---

## 📞 Support

- **Backend Server:** 101.46.58.237:8080
- **SSH Access:** root@101.46.58.237 -p 22
- **Base URL:** http://101.46.58.237:8080/api/v1

---

**Total Endpoints:** 23  
**Categories:** 6  
**DTOs:** 32

**Last Verified:** October 7, 2025 ✅



