# OTP Endpoints Audit Report

## 📋 Summary

This report identifies all modules that use the email update endpoint (`/api/v1/users/me/email/update`) as a workaround for OTP generation.

---

## ✅ Modules Using Email Update Endpoint (Workaround)

### 1. **Wallet Service** (`walletService.ts`)
- **Method:** `requestOTP()`
- **Used For:** Wallet activate/deactivate operations
- **Endpoint:** `/api/v1/users/me/email/update`
- **Line:** 153
- **Status:** ✅ **Uses unique temp email** (`temp-${Date.now()}@${domain}`)
- **Issue:** None - already generates unique email

### 2. **Sub-Wallet Service** (`walletService.ts`)
- **Method:** `requestSubWalletOTP()`
- **Used For:** Sub-wallet creation
- **Endpoint:** `/api/v1/users/me/email/update`
- **Line:** 242
- **Status:** ✅ **FIXED** - Now uses unique temp email (`subwallet-${timestamp}-${random}@${domain}`)
- **Previous Issue:** Was using hardcoded `'temp@example.com'` - **FIXED**

### 3. **Limits Service** (`limitsService.ts`)
- **Method:** `requestOTP()`
- **Used For:** Limits configuration updates
- **Endpoint:** `/api/v1/users/me/email/update`
- **Line:** 263
- **Status:** ✅ **Uses unique temp email** (`temp-${Date.now()}@${domain}` or `limits-${Date.now()}@temp.com`)
- **Issue:** None - already generates unique email

### 4. **User Management Service** (`userManagementService.ts`)
- **Method:** `requestKybOTP()`
- **Used For:** KYB (Know Your Business) profile updates
- **Endpoint:** `/api/v1/users/me/email/update`
- **Line:** 450
- **Status:** ⚠️ **Uses temp email** (`temp-${Date.now()}@temp.com`)
- **Issue:** Uses timestamp but no random number - could potentially conflict if called simultaneously
- **Recommendation:** Add random number for better uniqueness

---

## ✅ Modules Using Dedicated OTP Endpoints

### 5. **Card API** (`cardAPI.ts`)
- **Method:** `sendCardOtp()`
- **Used For:** Card operations (freeze, activate, request, etc.)
- **Endpoint:** `/api/v1/cards/otp/send` ✅ **Dedicated endpoint**
- **Status:** ✅ **Proper implementation** - No workaround needed

### 6. **Onboarding API** (`onboardingAPI.ts`)
- **Method:** `sendOTP()`
- **Used For:** Onboarding/registration
- **Endpoint:** `/api/v1/auth/send-otp` ✅ **Dedicated endpoint**
- **Status:** ✅ **Proper implementation** - No workaround needed

### 7. **Real Backend API** (`realBackendAPI.ts`)
- **Methods:** `sendOtp()`, `verifyOtp()`, `verifyLoginOtp()`, `forgotPassword()`
- **Used For:** Authentication flows
- **Endpoints:** `/api/v1/auth/send-otp`, `/api/v1/auth/verify-otp`, etc. ✅ **Dedicated endpoints**
- **Status:** ✅ **Proper implementation** - No workaround needed

---

## 🔍 Detailed Analysis

### Email Update Endpoint Usage Pattern

All modules using the email update endpoint follow this pattern:
1. Generate a temporary email address
2. Call `/api/v1/users/me/email/update` with the temp email
3. Backend sends OTP to user's phone (side effect)
4. Backend rejects email update (expected - it's a temp email)
5. Frontend extracts `sessionId` and `otpCode` from response
6. Frontend uses `sessionId` to verify OTP via `/api/v1/users/me/email/verify-otp`

### Issues Found

1. ✅ **Sub-Wallet OTP** - **FIXED**
   - Was using hardcoded `'temp@example.com'`
   - Now uses unique email: `subwallet-${timestamp}-${random}@${domain}`

2. ⚠️ **KYB OTP** - **Minor Issue**
   - Uses `temp-${Date.now()}@temp.com`
   - Could conflict if called at exact same millisecond
   - **Recommendation:** Add random number like: `temp-${Date.now()}-${Math.random()}@temp.com`

3. ✅ **Wallet OTP** - **OK**
   - Uses unique email with timestamp and domain

4. ✅ **Limits OTP** - **OK**
   - Uses unique email with timestamp

---

## 📊 Statistics

- **Total modules using email update workaround:** 4
- **Modules with issues:** 1 (Sub-Wallet - **FIXED**)
- **Modules with minor improvements needed:** 1 (KYB OTP)
- **Modules using dedicated endpoints:** 3

---

## 🎯 Recommendations

### Immediate Actions
1. ✅ **Sub-Wallet OTP** - Already fixed
2. ⚠️ **KYB OTP** - Consider adding random number for better uniqueness

### Long-term Solution
Create dedicated OTP endpoints for:
- `/api/v1/wallet/otp/send` - For wallet operations
- `/api/v1/sub-wallets/otp/send` - For sub-wallet operations
- `/api/v1/limits/otp/send` - For limits operations
- `/api/v1/kyb/otp/send` - For KYB operations

This would:
- Remove the need for email workaround
- Make the API more semantic and clear
- Avoid potential email validation issues
- Improve code maintainability

---

## ✅ Conclusion

**Status:** 1 issue found and fixed (Sub-Wallet OTP)

All other modules either:
- Use unique temp emails (Wallet, Limits)
- Use dedicated OTP endpoints (Card, Onboarding, Auth)

**Recommendation:** Consider improving KYB OTP uniqueness, but it's not critical since timestamp-based uniqueness is generally sufficient.

---

**Report Generated:** 2025-01-XX  
**Status:** ✅ **Audit Complete - 1 Issue Fixed**
