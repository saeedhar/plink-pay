# Login Pages Audit

## Summary
Analysis of all login-related pages in the Plink frontend, their API calls, and verification of correct implementation.

### Defined Routes (in `App.tsx`):
- ✅ `/login` → `LoginPage` (Password login)
- ✅ `/otp-verification` → `OTPVerificationPage` (OTP-based auth)
- ✅ `/admin/login` → `AdminLoginPage` (Admin panel)

### Missing Routes:
- ❌ `/forgot-password` (Backend ready, frontend missing)
- ❌ `/reset-password` (Backend ready, frontend missing)
- ❌ `/login/passcode` (Backend ready, frontend missing)
- ❌ `/login/biometric` (Backend ready, frontend missing)

---

## 1. LoginPage (`/login`)
**File:** `src/features/login/pages/LoginPage.tsx`  
**Route:** `/login`

### What it does:
- Password-based login with ID/UNN (phone/email) and password
- Has "Forgot Password" button (NOT IMPLEMENTED)
- Links to Sign Up (onboarding)

### Current API Call:
```typescript
loginWithPassword({
  emailOrPhone: formData.idUnn,
  password: formData.password,
  device: { platform, userAgent, screenResolution, timezone }
})
```

### Backend Endpoint:
✅ **`POST /api/v1/auth/login/password`**

### API Service Used:
✅ **`realBackendAPI.ts`** - Correct!

### Status: ✅ **WORKING**
- ✅ Calling correct API endpoint
- ✅ Sending correct payload structure
- ✅ Stores tokens and userId in localStorage
- ✅ Navigates to `/dashboard` on success
- ✅ Good error handling

### Missing Features:
❌ **Forgot Password** - Button exists but not wired up (lines 179-184)
- Should navigate to `/forgot-password` page
- Backend endpoint EXISTS: `POST /api/v1/auth/forgot-password`

---

## 2. OTPVerificationPage (`/otp-verification`)
**File:** `src/features/auth/pages/OTPVerificationPage.tsx`  
**Route:** `/otp-verification`

### What it does:
- Verifies 6-digit OTP sent to phone
- Resend OTP functionality
- Change mobile number option
- Used for login (not onboarding)

### Current API Calls:
1. **Verify OTP (Line 86):**
```typescript
verifyOTP(phoneNumber, otpCode)
```

2. **Resend OTP (Line 122):**
```typescript
sendOTP(phoneNumber, businessType)
```

### Backend Endpoints:
✅ **`POST /api/v1/auth/verify-otp`**  
✅ **`POST /api/v1/auth/send-otp`**

### API Service Used:
⚠️ **`onboardingAPI.ts`** - WRONG!
- Should use: `realBackendAPI.ts`

### Status: ⚠️ **WORKING BUT ISSUES**
- ✅ Calling correct API endpoints
- ✅ OTP verification works
- ✅ Resend works
- ⚠️ **Using wrong API service** - uses `onboardingAPI.ts` instead of `realBackendAPI.ts`
- ⚠️ **Response structure mismatch** - expects `{verified, token}` instead of backend's `{success, userId, nextStep, hasPassword, hasPasscode}`
- ⚠️ **Navigation issue** - always goes to `/dashboard`, doesn't check `nextStep`

### Issues to Fix:

#### Issue 1: Wrong API Service (Line 5)
**Current:**
```typescript
import { verifyOTP, sendOTP } from '../../../services/onboardingAPI';
```

**Should be:**
```typescript
import { verifyOtp, sendOtp } from '../../../services/realBackendAPI';
```

#### Issue 2: Response Handling (Lines 86-96)
**Current:**
```typescript
const response = await verifyOTP(phoneNumber, otpCode);
if (response.verified) {
  localStorage.setItem('userId', response.token);
  navigate('/dashboard');
}
```

**Should be:**
```typescript
const response = await verifyOtp({phoneNumber, otp: otpCode});
if (response.success) {
  localStorage.setItem('userId', response.userId);
  
  // Route based on nextStep
  if (response.nextStep === 'set_credentials') {
    if (!response.hasPassword) {
      navigate('/set-password');
    } else if (!response.hasPasscode) {
      navigate('/set-passcode');
    } else {
      navigate('/dashboard');
    }
  } else {
    navigate('/dashboard');
  }
}
```

#### Issue 3: Resend OTP (Lines 122)
**Current:**
```typescript
await sendOTP(phoneNumber, businessType);
```

**Should be:**
```typescript
await sendOtp({phoneNumber, businessType});
```

---

## 3. AdminLoginPage (`/admin/login`)
**File:** `src/features/admin/pages/AdminLoginPage.tsx`  
**Route:** `/admin/login`

### Status: ✅ **ASSUMED WORKING**
- Separate authentication system for admin panel
- Not audited in this document (admin-specific)

---

## 4. Forgot Password Flow ❌ **MISSING**
**Files:** Not created yet

### What should exist:

#### 4.1 ForgotPasswordPage (`/forgot-password`)
**Purpose:** Enter phone/ID to request password reset

**UI:**
- Input: Phone number or National ID
- Optional: Date of birth (for additional verification)
- Button: "Send OTP"

**API Call:**
```typescript
POST /api/v1/auth/forgot-password
{
  "phoneOrEmail": "0501234567",
  "nationalId": "1010101015",  // optional
  "dateOfBirth": "1990-01-01"  // optional
}
```

**Response:**
```typescript
{
  "success": true,
  "message": "OTP sent to registered phone",
  "resetToken": "uuid-token-here"
}
```

**Navigation:** `/forgot-password/otp` with `resetToken` in state

---

#### 4.2 ForgotPasswordOTPPage (`/forgot-password/otp`)
**Purpose:** Verify OTP sent to phone

**UI:**
- 6-digit OTP input
- Resend OTP button
- Timer countdown

**API Call:** (Reuse OTP verification or create specific endpoint)

**Navigation:** `/reset-password` with `resetToken` in state

---

#### 4.3 ResetPasswordPage (`/reset-password`)
**Purpose:** Set new password

**UI:**
- New password input (with validation)
- Confirm password input
- Password strength indicator
- Submit button

**API Call:**
```typescript
POST /api/v1/auth/reset-password
{
  "resetToken": "uuid-token-here",
  "otp": "123456",
  "newPassword": "NewSecurePass123!"
}
```

**Response:**
```typescript
{
  "success": true,
  "message": "Password reset successfully"
}
```

**Navigation:** `/login` with success message

---

### Backend Endpoints (READY):
✅ **`POST /api/v1/auth/forgot-password`**
- Request: `{phoneOrEmail: string, nationalId?: string, dateOfBirth?: string}`
- Response: `{success: boolean, message: string, resetToken: string}`

✅ **`POST /api/v1/auth/reset-password`**
- Request: `{resetToken: string, otp: string, newPassword: string}`
- Response: `{success: boolean, message: string}`

---

## 5. Additional Login Methods (Backend Ready, Frontend Missing)

### 5.1 Passcode Login ❌ **NOT IMPLEMENTED**
**Backend:** ✅ `POST /api/v1/auth/login/passcode`  
**Frontend:** ❌ No page exists  
**Route:** Should be `/login/passcode`

**Request:**
```typescript
{
  "phoneE164": "+966501234567",
  "passcode": "1234",
  "device": {
    "platform": "web",
    "userAgent": "...",
    "screenResolution": "1920x1080",
    "timezone": "Asia/Riyadh"
  }
}
```

---

### 5.2 Biometric Login ❌ **NOT IMPLEMENTED**
**Backend:** ✅ `POST /api/v1/auth/login/biometric`  
**Frontend:** ❌ No page exists  
**Route:** Should be `/login/biometric` (or native app only)

**Request:**
```typescript
{
  "userId": "uuid",
  "biometricData": "encrypted-biometric-signature",
  "device": {...}
}
```

---

### 5.3 Set Passcode ❌ **NOT IMPLEMENTED**
**Backend:** ✅ `POST /api/v1/auth/set-passcode`  
**Frontend:** ❌ No page exists  
**Route:** Should be `/set-passcode`

**Request:**
```typescript
{
  "userId": "uuid",
  "passcode": "1234"
}
```

---

### 5.4 Enable Biometric ❌ **NOT IMPLEMENTED**
**Backend:** ✅ `POST /api/v1/auth/enable-biometric`  
**Frontend:** ❌ No integration  

**Request:**
```typescript
{
  "userId": "uuid",
  "publicKey": "base64-encoded-public-key"
}
```

---

## 6. Session Management

### 6.1 Refresh Token ❌ **NOT IMPLEMENTED**
**Backend:** ✅ `POST /api/v1/auth/refresh`  
**Frontend:** ❌ Not implemented  
**Should:** Auto-refresh tokens before expiry

**Request:**
```typescript
{
  "refreshToken": "jwt-refresh-token"
}
```

**Response:**
```typescript
{
  "accessToken": "new-jwt-access-token",
  "expiresIn": 3600
}
```

**Implementation Needed:**
- HTTP interceptor to catch 401 errors
- Auto-refresh before token expiry
- Retry failed requests with new token

---

### 6.2 Logout ❌ **NOT IMPLEMENTED**
**Backend:** ✅ `POST /api/v1/auth/logout`  
**Frontend:** ❌ Not implemented globally  
**Should:** Call on logout and clear localStorage

**Request:** (Requires authentication)

**Response:** `200 OK`

**Implementation Needed:**
- Global logout function
- Clear localStorage
- Redirect to `/login`
- Call backend to revoke sessions

---

## Priority Fixes Needed

### 🔴 CRITICAL (Breaks functionality)
1. ✅ **OTPVerificationPage - Line 5**: Switch from `onboardingAPI` to `realBackendAPI`
   ```diff
   - import { verifyOTP, sendOTP } from '../../../services/onboardingAPI';
   + import { verifyOtp, sendOtp } from '../../../services/realBackendAPI';
   ```

2. ✅ **OTPVerificationPage - Lines 86-96**: Fix response handling
   - Check `response.success` instead of `response.verified`
   - Use `response.userId` instead of `response.token`
   - Route based on `response.nextStep` and credential status

3. ✅ **OTPVerificationPage - Line 122**: Fix sendOTP call
   ```diff
   - await sendOTP(phoneNumber, businessType);
   + await sendOtp({phoneNumber, businessType});
   ```

### 🟡 HIGH (Missing core features)
4. ❌ **Forgot Password Flow**: Create 3 missing pages
   - Create `ForgotPasswordPage.tsx` (enter phone/ID)
   - Create `ForgotPasswordOTPPage.tsx` (verify OTP)
   - Create `ResetPasswordPage.tsx` (set new password)
   - Wire up routes in `App.tsx`

5. ❌ **Wire up Forgot Password button** in LoginPage
   ```diff
   - <button type="button" className="...">
   + <button type="button" onClick={() => navigate('/forgot-password')} className="...">
   ```

### 🟢 MEDIUM (Enhancement)
6. ❌ **Logout Implementation**: Add global logout
7. ❌ **Token Refresh**: Implement auto-refresh logic
8. ❌ **Better Error Handling**: Improve error messages

### 🔵 LOW (Future)
9. ❌ **Passcode Login Page**
10. ❌ **Biometric Login Integration** (May be mobile-only)

---

## API Endpoint Mapping (Complete List)

| Frontend Page/Route | Current Call | Backend Endpoint | API Service | Status |
|---|---|---|---|---|
| `/login` | `loginWithPassword()` | `POST /api/v1/auth/login/password` | `realBackendAPI` | ✅ Working |
| `/otp-verification` | `verifyOTP()` | `POST /api/v1/auth/verify-otp` | `onboardingAPI` | ⚠️ Wrong service |
| `/otp-verification` | `sendOTP()` | `POST /api/v1/auth/send-otp` | `onboardingAPI` | ⚠️ Wrong service |
| ❌ `/forgot-password` | ❌ None | `POST /api/v1/auth/forgot-password` | - | ❌ No page |
| ❌ `/reset-password` | ❌ None | `POST /api/v1/auth/reset-password` | - | ❌ No page |
| ❌ `/login/passcode` | ❌ None | `POST /api/v1/auth/login/passcode` | - | ❌ No page |
| ❌ `/login/biometric` | ❌ None | `POST /api/v1/auth/login/biometric` | - | ❌ No page |
| ❌ `/set-passcode` | ❌ None | `POST /api/v1/auth/set-passcode` | - | ❌ No page |
| ❌ (Global) | ❌ None | `POST /api/v1/auth/enable-biometric` | - | ❌ Not implemented |
| ❌ (Interceptor) | ❌ None | `POST /api/v1/auth/refresh` | - | ❌ Not implemented |
| ❌ (Global) | ❌ None | `POST /api/v1/auth/logout` | - | ❌ Not implemented |

---

## Testing Checklist

### LoginPage (`/login`)
- [ ] Can login with valid phone/email and password
- [ ] Shows error on invalid credentials
- [ ] Stores tokens and userId correctly
- [ ] Navigates to dashboard on success
- [ ] "Sign Up" button navigates to onboarding
- [ ] "Forgot Password" button (needs wiring)

### OTPVerificationPage (`/otp-verification`)
- [ ] Receives phone number from navigation state
- [ ] Can enter 6-digit OTP
- [ ] Auto-focuses next input
- [ ] Backspace navigates to previous input
- [ ] Can verify OTP successfully
- [ ] Can resend OTP
- [ ] Timer counts down correctly
- [ ] Resend button disabled during countdown
- [ ] "Change Mobile Number" navigates back
- [ ] AFTER FIX: Routes based on nextStep

### Forgot Password Flow (TO BE IMPLEMENTED)
- [ ] Can enter phone/ID
- [ ] Backend sends OTP
- [ ] Can verify OTP
- [ ] Can set new password
- [ ] Password validation works
- [ ] Navigates to login after success

---

## Next Steps

### Immediate (This Session)
1. ✅ Fix `OTPVerificationPage` to use `realBackendAPI.ts`
2. ✅ Update response handling to check `nextStep`
3. ✅ Wire up "Forgot Password" button (navigate to `/forgot-password`)

### Short Term (Next Session)
4. ❌ Create `ForgotPasswordPage.tsx`
5. ❌ Create `ForgotPasswordOTPPage.tsx`  
6. ❌ Create `ResetPasswordPage.tsx`
7. ❌ Add routes to `App.tsx`

### Medium Term
8. ❌ Implement global logout
9. ❌ Add token refresh interceptor
10. ❌ Improve error handling

### Long Term
11. ❌ Create passcode login page
12. ❌ Implement biometric authentication (if needed for web)


