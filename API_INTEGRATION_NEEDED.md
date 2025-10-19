# 🔌 API Integration Needed for New Changes

**Commit:** 77924a8 (redesign)  
**Date:** October 2, 2025  
**Status:** ⚠️ New pages created but NOT connected to backend APIs

---

## 📋 Summary

The redesign commit added **2 new pages** that currently have **NO API integration**. They use placeholder logic and console.log statements instead of real backend calls.

---

## 🚨 Files Requiring API Integration

### 1. **LoginPage** 
**File:** `src/features/login/pages/LoginPage.tsx`  
**Status:** ❌ No API integration  
**Current State:** Mock implementation

#### **What It Does Now:**
```typescript
const handleLogin = (e: React.FormEvent) => {
  e.preventDefault();
  // Handle login logic here
  console.log('Login attempt:', formData);
  // Navigate to OTP verification
  navigate('/otp-verification');
};
```

#### **What It Should Do:**
Call the backend **Login with Password** API endpoint.

#### **Required API Integration:**

**Backend Endpoint:** `POST /api/v1/auth/login/password`

**Request:**
```typescript
{
  emailOrPhone: formData.idUnn,  // ID or UNN from form
  password: formData.password,
  device: {
    platform: "web",
    userAgent: navigator.userAgent,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  }
}
```

**Response:**
```typescript
{
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
  userId: string
}
```

#### **Implementation Steps:**

1. **Import API service:**
```typescript
import { loginWithPassword } from '../../../services/realBackendAPI';
// or from onboardingAPI, depending on which you're using
```

2. **Update handleLogin function:**
```typescript
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');
  
  try {
    const response = await loginWithPassword({
      emailOrPhone: formData.idUnn,
      password: formData.password,
      device: {
        platform: 'web',
        userAgent: navigator.userAgent,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    });
    
    // Store tokens
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('userId', response.userId);
    
    // Navigate to dashboard or next page
    navigate('/dashboard');
    
  } catch (error: any) {
    setError(error.message || 'Login failed. Please check your credentials.');
  } finally {
    setIsLoading(false);
  }
};
```

3. **Add state for loading and errors:**
```typescript
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState('');
```

4. **Add error display in UI:**
```tsx
{error && (
  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
    {error}
  </div>
)}
```

5. **Add loading state to button:**
```tsx
<Button type="submit" disabled={isLoading}>
  {isLoading ? 'Logging in...' : 'Login'}
</Button>
```

---

### 2. **OTPVerificationPage**
**File:** `src/features/auth/pages/OTPVerificationPage.tsx`  
**Status:** ❌ No API integration  
**Current State:** Hardcoded OTP validation (1234)

#### **What It Does Now:**
```typescript
const handleVerify = (e: React.FormEvent) => {
  e.preventDefault();
  const otpCode = otp.join('');
  console.log('OTP Verification:', otpCode);
  
  // Simulate OTP validation (replace with actual validation logic)
  if (otpCode === '1234') {
    // Valid OTP - navigate to next page
    console.log('Valid OTP');
    setError('');
    // navigate('/dashboard'); // Uncommented when ready
  } else {
    // Invalid OTP - show error
    setError('The code you entered is incorrect.');
  }
};

const handleResend = () => {
  setTimeLeft(30);
  setIsResendDisabled(true);
  console.log('Resending OTP...');
};
```

#### **What It Should Do:**
1. Verify OTP with backend
2. Resend OTP when requested

#### **Required API Integration:**

**Two Endpoints Needed:**

##### **A. Verify OTP**
**Endpoint:** `POST /api/v1/auth/verify-otp`

**Request:**
```typescript
{
  phoneNumber: "+966501234567",  // Need to get from previous page
  otp: "123456"
}
```

**Response:**
```typescript
{
  success: true,
  userId: "12345",
  nextStep: "login" | "set_credentials",
  hasPassword: boolean,
  hasPasscode: boolean
}
```

##### **B. Resend OTP**
**Endpoint:** `POST /api/v1/auth/send-otp`

**Request:**
```typescript
{
  phoneNumber: "+966501234567",
  businessType: "freelancer" | "b2b"
}
```

**Response:**
```typescript
{
  success: true,
  message: "OTP sent successfully"
}
```

#### **Implementation Steps:**

1. **Import API services:**
```typescript
import { verifyOTP, sendOTP } from '../../../services/onboardingAPI';
```

2. **Add state to store phone number:**
```typescript
const [phoneNumber, setPhoneNumber] = useState('');
const [isLoading, setIsLoading] = useState(false);

// Get phone number from navigation state or context
useEffect(() => {
  const state = location.state as { phoneNumber?: string };
  if (state?.phoneNumber) {
    setPhoneNumber(state.phoneNumber);
  }
}, [location]);
```

3. **Update handleVerify function:**
```typescript
const handleVerify = async (e: React.FormEvent) => {
  e.preventDefault();
  const otpCode = otp.join('');
  
  if (!phoneNumber) {
    setError('Phone number not found. Please go back and try again.');
    return;
  }
  
  setIsLoading(true);
  setError('');
  
  try {
    const response = await verifyOTP(phoneNumber, otpCode);
    
    if (response.verified) {
      // Store user info
      localStorage.setItem('userId', response.token);
      
      // Navigate based on nextStep
      if (response.nextStep === 'login') {
        navigate('/dashboard');
      } else {
        navigate('/onboarding/phone'); // or appropriate next step
      }
    }
  } catch (error: any) {
    if (error.status === 400) {
      setError('Invalid verification code. Please try again.');
    } else {
      setError('Verification failed. Please try again.');
    }
  } finally {
    setIsLoading(false);
  }
};
```

4. **Update handleResend function:**
```typescript
const handleResend = async () => {
  if (!phoneNumber) {
    setError('Phone number not found.');
    return;
  }
  
  setIsLoading(true);
  
  try {
    await sendOTP(phoneNumber, 'freelancer'); // or get businessType from state
    setTimeLeft(30);
    setIsResendDisabled(true);
    setError('');
    // Show success message
    console.log('OTP resent successfully');
  } catch (error: any) {
    setError('Failed to resend OTP. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
```

5. **Update button states:**
```tsx
<Button type="submit" disabled={isLoading || otp.some(digit => !digit)}>
  {isLoading ? 'Verifying...' : 'Verify'}
</Button>

<button
  type="button"
  onClick={handleResend}
  disabled={isResendDisabled || isLoading}
  className={...}
>
  {isLoading ? 'Sending...' : 'Resend'}
</button>
```

---

## 🔗 Additional Features Needed

### **Forgot Password Flow**
**File:** `src/features/login/pages/LoginPage.tsx` (line 134)

Currently just a button with no functionality:
```tsx
<button
  type="button"
  className="text-[#0475CC] hover:text-[#022466] text-sm font-medium transition-colors"
>
  Forgot Password?
</button>
```

**Needs:**
- Create "Forgot Password" page
- Implement password reset flow
- Use backend APIs for password reset

---

## 📊 Integration Priority

| Page | Priority | Complexity | Estimated Time |
|------|----------|------------|----------------|
| **LoginPage** | 🔴 HIGH | Medium | 2-3 hours |
| **OTPVerificationPage** | 🔴 HIGH | Medium | 2-3 hours |
| **Forgot Password** | 🟡 MEDIUM | High | 4-6 hours |

---

## ✅ What's Already Connected

The following existing pages **DO have API integration**:
- ✅ `PhoneNumberEntry.tsx` - Uses `sendOTP()`
- ✅ `OTPVerification.tsx` (old one) - Uses `verifyOTP()`
- ✅ `CRNumberEntry.tsx` - Uses `verifyCR()`
- ✅ `IDNumberEntry.tsx` - Uses `verifyID()`
- ✅ `NafathPage.tsx` - Uses `initiateNafath()` and `getNafathStatus()`
- ✅ `KYBPage.tsx` - Uses `fetchKybOptions()`
- ✅ `PasswordSetup.tsx` - Uses `setPassword()`
- ✅ `OnboardingComplete.tsx` - Uses `createProfile()`

---

## 🎯 Quick Start Guide

### **Step 1: Update LoginPage**
```bash
# Edit the file
code /Users/saeedhar/plink/src/features/login/pages/LoginPage.tsx

# Add the API integration code from above
```

### **Step 2: Update OTPVerificationPage**
```bash
# Edit the file
code /Users/saeedhar/plink/src/features/auth/pages/OTPVerificationPage.tsx

# Add the API integration code from above
```

### **Step 3: Test the Integration**
```bash
# Start the dev server
npm run dev

# Navigate to /login
# Try logging in with test credentials
# Verify OTP flow works
```

---

## 🔍 Backend APIs Available

All the APIs needed are already available in the backend:

| API | Endpoint | Method | Status |
|-----|----------|--------|--------|
| Login with Password | `/auth/login/password` | POST | ✅ Available |
| Send OTP | `/auth/send-otp` | POST | ✅ Available |
| Verify OTP | `/auth/verify-otp` | POST | ✅ Available |

**Base URL:** `http://101.46.58.237:8080/api/v1`

See [BACKEND_API_REFERENCE.md](./BACKEND_API_REFERENCE.md) for full API documentation.

---

## ⚠️ Important Notes

1. **Phone Number Flow:**
   - The OTPVerificationPage needs to receive the phone number from the previous page
   - Use React Router's `location.state` or Context API to pass the phone number

2. **Token Management:**
   - Store JWT tokens in localStorage or Context
   - Implement token refresh logic
   - Handle expired token scenarios

3. **Error Handling:**
   - Add proper error messages for all API failures
   - Handle network errors gracefully
   - Show user-friendly error messages

4. **Loading States:**
   - Add loading indicators for all API calls
   - Disable buttons during API requests
   - Prevent multiple simultaneous requests

5. **Navigation:**
   - Update navigation logic based on API responses
   - Handle different user states (new user vs returning user)
   - Implement proper route guards

---

## 📞 Next Steps

1. ✅ Review this document
2. ⬜ Implement LoginPage API integration
3. ⬜ Implement OTPVerificationPage API integration
4. ⬜ Test both pages end-to-end
5. ⬜ Implement Forgot Password flow (optional)
6. ⬜ Add proper error handling and loading states
7. ⬜ Test with real backend server

---

**Total API Integrations Needed:** 2 pages (3-4 API calls)  
**Estimated Total Time:** 4-6 hours  
**Difficulty:** Medium




