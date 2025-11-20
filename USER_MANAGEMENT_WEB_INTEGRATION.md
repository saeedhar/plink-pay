# User Management API Integration - Plink Web App

## ✅ Integration Complete

The User Management API has been successfully integrated into the Plink web app frontend.

## 📁 Files Created

### `src/services/userManagementService.ts` (NEW)
- Complete API service with all User Management methods
- TypeScript interfaces for all request/response DTOs
- 18 API methods covering all user management features
- Follows the same pattern as `walletService.ts` and other services

## 📋 Available API Methods

### Profile Management
```typescript
import { UserManagementService } from '@/services/userManagementService';

// Get user profile
const profile = await UserManagementService.getProfile();

// Update profile
await UserManagementService.updateProfile({ dateOfBirth: '1990-01-01' });
```

### Password Management
```typescript
await UserManagementService.changePassword({
  currentPassword: 'OldPass123!',
  newPassword: 'NewPass123!'
});
```

### Notification Preferences
```typescript
// Get preferences
const prefs = await UserManagementService.getNotificationPreferences();

// Update preferences
await UserManagementService.updateNotificationPreferences({
  emailNotifications: false,
  smsNotifications: true
});
```

### Language Preferences
```typescript
// Get language
const lang = await UserManagementService.getLanguagePreference();

// Update language
await UserManagementService.updateLanguagePreference({
  language: 'ar',
  locale: 'ar-SA'
});
```

### Mobile Number Update (OTP Flow)
```typescript
// Step 1: Initiate update
const response = await UserManagementService.initiateMobileUpdate({
  newPhoneNumber: '+966501111002'
});

// Step 2: Verify with OTP
await UserManagementService.verifyMobileUpdate({
  sessionId: response.sessionId,
  otp: '123456'
});
```

### Email Update (OTP Flow)
```typescript
// Step 1: Initiate update
const response = await UserManagementService.initiateEmailUpdate({
  email: 'newemail@example.com'
});

// Step 2: Verify with OTP
await UserManagementService.verifyEmailUpdate({
  sessionId: response.sessionId,
  otp: '123456'
});
```

### KYB Profile Update

#### Option 1: OTP Flow
```typescript
// Step 1: Initiate update
const response = await UserManagementService.initiateKybUpdate({
  businessName: 'New Business Name',
  annualRevenue: '500000-1000000'
});

// Step 2: Verify with OTP
await UserManagementService.verifyKybUpdate({
  sessionId: response.sessionId,
  otp: '123456'
});
```

#### Option 2: Passcode Flow (No OTP)
```typescript
await UserManagementService.updateKybWithPasscode({
  businessName: 'New Business Name',
  sourceOfFunds: 'Salary',
  annualRevenue: '500000-1000000',
  passcode: '12345'
});
```

### National Address Management

#### Get Address
```typescript
const address = await UserManagementService.getNationalAddress();
```

#### Update Address - OTP Flow
```typescript
// Step 1: Initiate update
const response = await UserManagementService.initiateAddressUpdate({
  buildingNumber: '1234',
  street: 'King Fahd Road',
  district: 'Al Olaya',
  city: 'Riyadh',
  postalCode: '12211'
});

// Step 2: Verify with OTP
await UserManagementService.verifyAddressUpdate({
  sessionId: response.sessionId,
  otp: '123456'
});
```

#### Update Address - Passcode Flow (No OTP)
```typescript
await UserManagementService.updateAddressWithPasscode({
  buildingNumber: '1234',
  street: 'King Fahd Road',
  district: 'Al Olaya',
  city: 'Riyadh',
  postalCode: '12211',
  passcode: '12345'
});
```

### Device Deactivation (OTP Flow)
```typescript
// Step 1: Initiate deactivation
const response = await UserManagementService.initiateDeviceDeactivation({
  deviceId: 'device-uuid-here'
});

// Step 2: Verify with OTP
await UserManagementService.verifyDeviceDeactivation({
  sessionId: response.sessionId,
  otp: '123456'
});
```

## 🔐 Authentication

All User Management endpoints require authentication. The `API` helper from `src/lib/api.ts` automatically:
- Adds `Authorization: Bearer <token>` header from `localStorage`
- Handles token refresh on 401 errors
- Redirects to login if refresh fails

## 📝 TypeScript Types

All request/response types are exported and can be imported:

```typescript
import type {
  UserProfileResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  NotificationPreferencesResponse,
  // ... etc
} from '@/services/userManagementService';
```

## 🎯 Next Steps

1. **Create UI Components/Pages** for user management features:
   - Profile settings page
   - Notification preferences page
   - Language settings page
   - Mobile/Email update pages
   - KYB update page
   - Address management page
   - Device management page

2. **Add Navigation** to access these pages from the dashboard

3. **Handle Errors** appropriately in UI:
   - Show error messages for failed API calls
   - Handle OTP expiration
   - Handle validation errors

4. **Test Integration**:
   - Test all API methods with real backend
   - Verify authentication works
   - Test error handling

## 📚 API Endpoints Reference

All endpoints use the base URL from `src/lib/api.ts`:
- Dev: Uses Vite proxy (relative URLs)
- Prod: `http://101.46.58.237:8080`

Endpoints:
- `GET /api/v1/users/me` - Get profile
- `PUT /api/v1/users/me` - Update profile
- `POST /api/v1/users/me/password/change` - Change password
- `GET /api/v1/users/me/notifications` - Get notifications
- `PUT /api/v1/users/me/notifications` - Update notifications
- `GET /api/v1/users/me/language` - Get language
- `PUT /api/v1/users/me/language` - Update language
- `POST /api/v1/users/me/mobile/update` - Initiate mobile update
- `POST /api/v1/users/me/mobile/verify-otp` - Verify mobile update
- `POST /api/v1/users/me/email/update` - Initiate email update
- `POST /api/v1/users/me/email/verify-otp` - Verify email update
- `POST /api/v1/users/me/kyb/update` - Initiate KYB update
- `POST /api/v1/users/me/kyb/verify-otp` - Verify KYB update
- `POST /api/v1/users/me/kyb/update-with-passcode` - Update KYB with passcode
- `GET /api/v1/users/me/address` - Get address
- `POST /api/v1/users/me/address/update` - Initiate address update
- `POST /api/v1/users/me/address/verify-otp` - Verify address update
- `POST /api/v1/users/me/address/update-with-passcode` - Update address with passcode
- `POST /api/v1/users/me/devices/deactivate` - Initiate device deactivation
- `POST /api/v1/users/me/devices/deactivate/verify-otp` - Verify device deactivation

## ✅ Status

- ✅ API service created
- ✅ TypeScript types defined
- ✅ API methods implemented
- ✅ Follows existing service pattern
- ⏳ UI components/pages (pending)
- ⏳ Integration testing (pending)

