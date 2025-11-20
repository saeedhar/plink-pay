# User Management API Integration Plan - Plink Web App

## 📋 Overview

This plan outlines the integration of the User Management API (created by you and Yazan) with the existing Plink web app user management screens.

## ✅ Current Status

### API Service Created
- ✅ `src/services/userManagementService.ts` - Complete API service with 18 methods
- ✅ All TypeScript interfaces defined
- ✅ Follows existing service patterns

### Existing Screens (Need Integration)
- ✅ `AccountSettings.tsx` - Main settings page (uses `getCurrentUser()` - needs update)
- ✅ `UpdateMobileNumber.tsx` - Mobile update form (no API call yet)
- ✅ `UpdateMobileOTP.tsx` - Mobile OTP verification (no API call yet)
- ✅ `UpdateEmail.tsx` - Email update form (no API call yet)
- ✅ `UpdateEmailOTP.tsx` - Email OTP verification (no API call yet)
- ✅ `ChangePassword.tsx` - Password change entry (no API call yet)
- ✅ `SetPassword.tsx` - Set new password (no API call yet)
- ✅ `UpdateKYB.tsx` - KYB update form (no API call yet)
- ✅ `UpdateKYBOTP.tsx` - KYB OTP verification (no API call yet)
- ✅ `NotificationManagement.tsx` - Notification preferences (TODO comments)
- ✅ `PreferredLanguage.tsx` - Language preferences (TODO comments)
- ✅ `UpdateNationalAddress.tsx` - Address update form (no API call yet)
- ✅ `UpdateNationalAddressOTP.tsx` - Address OTP verification (no API call yet)
- ✅ `TrustedDevicesManagement.tsx` - Device list (mock data)
- ✅ `DeactivateDevice.tsx` - Device deactivation (no API call yet)
- ✅ `DeactivateDeviceOTP.tsx` - Device deactivation OTP (no API call yet)

## 🎯 Integration Plan

### Phase 1: Profile & Basic Settings (Priority: High)

#### 1.1 AccountSettings.tsx
**Current:** Uses `getCurrentUser()` from `realBackendAPI.ts`  
**Action:** Replace with `UserManagementService.getProfile()`

**Changes:**
```typescript
// OLD
import { getCurrentUser } from '../../../services/realBackendAPI';
const user = await getCurrentUser();
setName(user.name || '');
setEmail(user.email || '');

// NEW
import { UserManagementService } from '../../../services/userManagementService';
const profile = await UserManagementService.getProfile();
setName(profile.name || profile.email || 'User');
setEmail(profile.email || '');
```

**Files to modify:**
- `src/features/dashboard/pages/AccountSettings.tsx`

---

#### 1.2 NotificationManagement.tsx
**Current:** Has TODO comments, uses local state only  
**Action:** Integrate with API to load and save preferences

**Changes:**
```typescript
// Add useEffect to load preferences on mount
useEffect(() => {
  const loadPreferences = async () => {
    try {
      const prefs = await UserManagementService.getNotificationPreferences();
      setEmailNotifications(prefs.emailNotifications);
      setMarketingNotifications(prefs.marketingNotifications || false);
    } catch (error) {
      console.error('Failed to load notification preferences:', error);
    }
  };
  loadPreferences();
}, []);

// Update handleEmailToggle and handleMarketingToggle
const handleEmailToggle = async () => {
  const newValue = !emailNotifications;
  setEmailNotifications(newValue);
  try {
    await UserManagementService.updateNotificationPreferences({
      emailNotifications: newValue
    });
  } catch (error) {
    // Revert on error
    setEmailNotifications(!newValue);
    alert('Failed to update notification preferences');
  }
};
```

**Files to modify:**
- `src/features/dashboard/pages/NotificationManagement.tsx`

---

#### 1.3 PreferredLanguage.tsx
**Current:** Has TODO comment, only console.log  
**Action:** Integrate with API to load and save language preference

**Changes:**
```typescript
// Add useEffect to load language on mount
useEffect(() => {
  const loadLanguage = async () => {
    try {
      const lang = await UserManagementService.getLanguagePreference();
      setSelectedLanguage(lang.language === 'ar' ? 'arabic' : 'english');
    } catch (error) {
      console.error('Failed to load language preference:', error);
    }
  };
  loadLanguage();
}, []);

// Update handleConfirm
const handleConfirm = async () => {
  try {
    await UserManagementService.updateLanguagePreference({
      language: selectedLanguage === 'arabic' ? 'ar' : 'en',
      locale: selectedLanguage === 'arabic' ? 'ar-SA' : 'en-US'
    });
    navigate('/app/account-settings');
  } catch (error) {
    setError('Failed to update language preference');
  }
};
```

**Files to modify:**
- `src/features/dashboard/pages/PreferredLanguage.tsx`

---

### Phase 2: Mobile & Email Updates (Priority: High)

#### 2.1 UpdateMobileNumber.tsx
**Current:** Only validates and navigates to OTP screen  
**Action:** Call API to initiate mobile update

**Changes:**
```typescript
const handleNext = async () => {
  const validationError = validateMobileNumber(mobileNumber);
  
  if (validationError) {
    setError(validationError);
    return;
  }
  
  try {
    const fullPhoneNumber = `${countryCode}${mobileNumber}`;
    const response = await UserManagementService.initiateMobileUpdate({
      newPhoneNumber: fullPhoneNumber
    });
    
    // Navigate to OTP verification page with sessionId
    navigate('/app/account-settings/mobile/otp', {
      state: { 
        mobileNumber: fullPhoneNumber,
        sessionId: response.sessionId,
        otpCode: response.otpCode // For testing
      }
    });
  } catch (error: any) {
    setError(error.message || 'Failed to initiate mobile update');
  }
};
```

**Files to modify:**
- `src/features/dashboard/pages/UpdateMobileNumber.tsx`

---

#### 2.2 UpdateMobileOTP.tsx
**Current:** Only validates OTP locally  
**Action:** Call API to verify OTP and complete update

**Changes:**
```typescript
// Get sessionId from location state
const { mobileNumber, sessionId } = location.state || {};

const handleVerify = async () => {
  const otp = otpDigits.join('');
  
  if (!sessionId) {
    setError('Session expired. Please start over.');
    return;
  }
  
  try {
    const response = await UserManagementService.verifyMobileUpdate({
      sessionId,
      otp
    });
    
    if (response.success) {
      navigate('/app/account-settings/mobile/success', {
        state: { phoneE164: response.phoneE164 }
      });
    }
  } catch (error: any) {
    setError(error.message || 'Invalid OTP. Please try again.');
  }
};
```

**Files to modify:**
- `src/features/dashboard/pages/UpdateMobileOTP.tsx`

---

#### 2.3 UpdateEmail.tsx
**Current:** Only validates and navigates to OTP screen  
**Action:** Call API to initiate email update

**Changes:**
```typescript
const handleNext = async () => {
  const validationError = validateEmail(email);
  
  if (validationError) {
    setError(validationError);
    return;
  }
  
  try {
    const response = await UserManagementService.initiateEmailUpdate({
      email
    });
    
    // Navigate to OTP verification page with sessionId
    navigate('/app/account-settings/email/otp', {
      state: { 
        email,
        sessionId: response.sessionId,
        otpCode: response.otpCode // For testing
      }
    });
  } catch (error: any) {
    setError(error.message || 'Failed to initiate email update');
  }
};
```

**Files to modify:**
- `src/features/dashboard/pages/UpdateEmail.tsx`

---

#### 2.4 UpdateEmailOTP.tsx
**Current:** Only validates OTP locally  
**Action:** Call API to verify OTP and complete update

**Changes:**
```typescript
// Get sessionId from location state
const { email, sessionId } = location.state || {};

const handleVerify = async () => {
  const otp = otpDigits.join('');
  
  if (!sessionId) {
    setError('Session expired. Please start over.');
    return;
  }
  
  try {
    const response = await UserManagementService.verifyEmailUpdate({
      sessionId,
      otp
    });
    
    if (response.success) {
      navigate('/app/account-settings/email/success', {
        state: { email: response.email }
      });
    }
  } catch (error: any) {
    setError(error.message || 'Invalid OTP. Please try again.');
  }
};
```

**Files to modify:**
- `src/features/dashboard/pages/UpdateEmailOTP.tsx`

---

### Phase 3: Password Management (Priority: High)

#### 3.1 ChangePassword.tsx
**Current:** Only validates and navigates to set password screen  
**Action:** Keep as is (it's just entry point)

**Files to modify:**
- None (already correct flow)

---

#### 3.2 SetPassword.tsx
**Current:** Only validates password locally  
**Action:** Call API to change password

**Changes:**
```typescript
// Get currentPassword from location state
const { currentPassword } = location.state || {};

const handleNext = async () => {
  const validationError = validatePassword(newPassword);
  
  if (validationError) {
    setError(validationError);
    return;
  }
  
  if (!currentPassword) {
    setError('Current password is required');
    return;
  }
  
  try {
    await UserManagementService.changePassword({
      currentPassword,
      newPassword
    });
    
    // Navigate to success page
    navigate('/app/account-settings/password/success');
  } catch (error: any) {
    setError(error.message || 'Failed to change password');
  }
};
```

**Files to modify:**
- `src/features/dashboard/pages/SetPassword.tsx`

---

### Phase 4: KYB Updates (Priority: Medium)

#### 4.1 UpdateKYB.tsx
**Current:** Only validates and navigates to OTP screen  
**Action:** Call API to initiate KYB update

**Changes:**
```typescript
const handleNext = async () => {
  if (!validateForm()) {
    return;
  }
  
  try {
    // Map form fields to API request
    const kybRequest = {
      sourceOfFunds: sourceOfFunds === 'other' ? sourceOfFundsOther : sourceOfFunds,
      businessActivity: expectedTransactionType,
      annualRevenue: expectedMonthlyVolume,
      accountPurpose: purposeOfAccount.join(', ')
    };
    
    const response = await UserManagementService.initiateKybUpdate(kybRequest);
    
    // Navigate to OTP screen
    navigate('/app/account-settings/kyb/otp', {
      state: { 
        kybData: kybRequest,
        sessionId: response.sessionId,
        otpCode: response.otpCode
      }
    });
  } catch (error: any) {
    setErrors({ general: error.message || 'Failed to initiate KYB update' });
  }
};
```

**Note:** Also add option for passcode-based update (no OTP)

**Files to modify:**
- `src/features/dashboard/pages/UpdateKYB.tsx`

---

#### 4.2 UpdateKYBOTP.tsx
**Current:** Only validates OTP locally  
**Action:** Call API to verify OTP and complete update

**Changes:**
```typescript
// Get sessionId from location state
const { kybData, sessionId } = location.state || {};

const handleVerify = async () => {
  const otp = otpDigits.join('');
  
  if (!sessionId) {
    setError('Session expired. Please start over.');
    return;
  }
  
  try {
    const response = await UserManagementService.verifyKybUpdate({
      sessionId,
      otp
    });
    
    if (response.success) {
      navigate('/app/account-settings/kyb/success');
    }
  } catch (error: any) {
    setError(error.message || 'Invalid OTP. Please try again.');
  }
};
```

**Files to modify:**
- `src/features/dashboard/pages/UpdateKYBOTP.tsx`

---

### Phase 5: National Address Updates (Priority: Medium)

#### 5.1 UpdateNationalAddress.tsx
**Current:** Only validates and navigates to OTP screen  
**Action:** Call API to initiate address update

**Changes:**
```typescript
const handleNext = async () => {
  // Validate all required fields
  const newErrors: { [key: string]: string } = {};
  
  if (!formData.city.trim()) {
    newErrors.city = 'City is required';
  }
  if (!formData.district.trim()) {
    newErrors.district = 'District is required';
  }
  if (!formData.streetName.trim()) {
    newErrors.streetName = 'Street Name is required';
  }
  if (!formData.buildingNumber.trim()) {
    newErrors.buildingNumber = 'Building Number is required';
  }
  if (!formData.postalCode.trim()) {
    newErrors.postalCode = 'Postal Code is required';
  }
  
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }
  
  try {
    const response = await UserManagementService.initiateAddressUpdate({
      buildingNumber: formData.buildingNumber,
      street: formData.streetName,
      district: formData.district,
      city: formData.city,
      postalCode: formData.postalCode,
      additionalNumber: formData.additionalNumber
    });
    
    // Navigate to OTP screen
    navigate('/app/account-settings/national-address/otp', {
      state: { 
        formData,
        sessionId: response.sessionId,
        otpCode: response.otpCode
      }
    });
  } catch (error: any) {
    setErrors({ general: error.message || 'Failed to initiate address update' });
  }
};
```

**Note:** Also add option for passcode-based update (no OTP)

**Files to modify:**
- `src/features/dashboard/pages/UpdateNationalAddress.tsx`

---

#### 5.2 UpdateNationalAddressOTP.tsx
**Current:** Only validates OTP locally  
**Action:** Call API to verify OTP and complete update

**Changes:**
```typescript
// Get sessionId from location state
const { formData, sessionId } = location.state || {};

const handleVerify = async () => {
  const otp = otpDigits.join('');
  
  if (!sessionId) {
    setError('Session expired. Please start over.');
    return;
  }
  
  try {
    const response = await UserManagementService.verifyAddressUpdate({
      sessionId,
      otp
    });
    
    if (response.success) {
      navigate('/app/account-settings/national-address/success');
    }
  } catch (error: any) {
    setError(error.message || 'Invalid OTP. Please try again.');
  }
};
```

**Files to modify:**
- `src/features/dashboard/pages/UpdateNationalAddressOTP.tsx`

---

### Phase 6: Device Management (Priority: Low)

#### 6.1 TrustedDevicesManagement.tsx
**Current:** Uses mock data  
**Action:** Fetch devices from API (need to check if device API exists)

**Changes:**
```typescript
// Check if DeviceController has GET /api/v1/devices endpoint
// If yes, create deviceService.ts or add to userManagementService

useEffect(() => {
  const loadDevices = async () => {
    try {
      // TODO: Check if device API exists
      // const devices = await DeviceService.getDevices();
      // setDevices(devices);
    } catch (error) {
      console.error('Failed to load devices:', error);
    }
  };
  loadDevices();
}, []);
```

**Files to modify:**
- `src/features/dashboard/pages/TrustedDevicesManagement.tsx`
- May need to create `src/services/deviceService.ts` if device API exists

---

#### 6.2 DeactivateDevice.tsx
**Current:** Only navigates to OTP screen  
**Action:** Call API to initiate device deactivation

**Changes:**
```typescript
// Get deviceId from location state
const { deviceId } = location.state || {};

const handleNext = async () => {
  if (!deviceId) {
    setError('Device ID is required');
    return;
  }
  
  try {
    const response = await UserManagementService.initiateDeviceDeactivation({
      deviceId
    });
    
    // Navigate to OTP screen
    navigate('/app/account-settings/devices/deactivate/otp', {
      state: { 
        deviceId,
        sessionId: response.sessionId,
        otpCode: response.otpCode
      }
    });
  } catch (error: any) {
    setError(error.message || 'Failed to initiate device deactivation');
  }
};
```

**Files to modify:**
- `src/features/dashboard/pages/DeactivateDevice.tsx`

---

#### 6.3 DeactivateDeviceOTP.tsx
**Current:** Only validates OTP locally  
**Action:** Call API to verify OTP and complete deactivation

**Changes:**
```typescript
// Get sessionId from location state
const { deviceId, sessionId } = location.state || {};

const handleVerify = async () => {
  const otp = otpDigits.join('');
  
  if (!sessionId) {
    setError('Session expired. Please start over.');
    return;
  }
  
  try {
    const response = await UserManagementService.verifyDeviceDeactivation({
      sessionId,
      otp
    });
    
    if (response.success) {
      navigate('/app/account-settings/devices/deactivate/success');
    }
  } catch (error: any) {
    setError(error.message || 'Invalid OTP. Please try again.');
  }
};
```

**Files to modify:**
- `src/features/dashboard/pages/DeactivateDeviceOTP.tsx`

---

## 📝 Implementation Checklist

### Phase 1: Profile & Basic Settings
- [ ] Update `AccountSettings.tsx` to use `UserManagementService.getProfile()`
- [ ] Integrate `NotificationManagement.tsx` with API (load & save)
- [ ] Integrate `PreferredLanguage.tsx` with API (load & save)

### Phase 2: Mobile & Email Updates
- [ ] Integrate `UpdateMobileNumber.tsx` with `initiateMobileUpdate()`
- [ ] Integrate `UpdateMobileOTP.tsx` with `verifyMobileUpdate()`
- [ ] Integrate `UpdateEmail.tsx` with `initiateEmailUpdate()`
- [ ] Integrate `UpdateEmailOTP.tsx` with `verifyEmailUpdate()`

### Phase 3: Password Management
- [ ] Integrate `SetPassword.tsx` with `changePassword()`

### Phase 4: KYB Updates
- [ ] Integrate `UpdateKYB.tsx` with `initiateKybUpdate()`
- [ ] Add passcode option to `UpdateKYB.tsx` (use `updateKybWithPasscode()`)
- [ ] Integrate `UpdateKYBOTP.tsx` with `verifyKybUpdate()`

### Phase 5: National Address Updates
- [ ] Integrate `UpdateNationalAddress.tsx` with `initiateAddressUpdate()`
- [ ] Add passcode option to `UpdateNationalAddress.tsx` (use `updateAddressWithPasscode()`)
- [ ] Integrate `UpdateNationalAddressOTP.tsx` with `verifyAddressUpdate()`

### Phase 6: Device Management
- [ ] Check if device list API exists (GET /api/v1/devices)
- [ ] Integrate `TrustedDevicesManagement.tsx` to fetch devices
- [ ] Integrate `DeactivateDevice.tsx` with `initiateDeviceDeactivation()`
- [ ] Integrate `DeactivateDeviceOTP.tsx` with `verifyDeviceDeactivation()`

## 🔍 Additional Considerations

### Error Handling
- All API calls should have try/catch blocks
- Show user-friendly error messages
- Handle network errors gracefully
- Handle 401 (unauthorized) - API helper should auto-refresh token

### Loading States
- Add loading indicators during API calls
- Disable buttons during submission
- Show success/error messages

### Session Management
- Store `sessionId` in location state (already done in most screens)
- Handle expired sessions (redirect to start)
- Clear session data on success

### Testing
- Test each flow end-to-end
- Test error scenarios
- Test OTP expiration
- Test network failures

## 🚀 Implementation Order

**Recommended order:**
1. Phase 1 (Profile & Basic Settings) - Quick wins, high visibility
2. Phase 2 (Mobile & Email) - Core functionality
3. Phase 3 (Password) - Security critical
4. Phase 4 (KYB) - Business critical
5. Phase 5 (Address) - Important for compliance
6. Phase 6 (Devices) - Nice to have

## 📚 API Reference

All methods are in `UserManagementService`:
- `getProfile()` - Get user profile
- `updateProfile()` - Update profile
- `changePassword()` - Change password
- `getNotificationPreferences()` - Get notifications
- `updateNotificationPreferences()` - Update notifications
- `getLanguagePreference()` - Get language
- `updateLanguagePreference()` - Update language
- `initiateMobileUpdate()` - Start mobile update
- `verifyMobileUpdate()` - Verify mobile update
- `initiateEmailUpdate()` - Start email update
- `verifyEmailUpdate()` - Verify email update
- `initiateKybUpdate()` - Start KYB update
- `verifyKybUpdate()` - Verify KYB update
- `updateKybWithPasscode()` - Update KYB with passcode (no OTP)
- `getNationalAddress()` - Get address
- `initiateAddressUpdate()` - Start address update
- `verifyAddressUpdate()` - Verify address update
- `updateAddressWithPasscode()` - Update address with passcode (no OTP)
- `initiateDeviceDeactivation()` - Start device deactivation
- `verifyDeviceDeactivation()` - Verify device deactivation

## ✅ Success Criteria

- All screens successfully call backend API
- Error handling works correctly
- OTP flows complete successfully
- Passcode-based updates work (KYB, Address)
- User preferences persist correctly
- All navigation flows work end-to-end

