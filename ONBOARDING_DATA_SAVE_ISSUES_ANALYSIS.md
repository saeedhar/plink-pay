# Onboarding Data Save Issues - Analysis & Fix Plan

## 🔍 Issues Identified

### Issue 1: Profile Creation Never Happens
**Location**: `src/features/onboarding/pages/PasswordSetup.tsx` (line 93)
- **Problem**: After setting password, the app navigates to `/login` instead of `/onboarding/complete`
- **Impact**: The `OnboardingComplete` component (which calls `createProfile` API) is never executed
- **Result**: National ID and KYB data are never sent to the backend

### Issue 2: National ID Not Saved in State Properly
**Location**: `src/features/onboarding/pages/IDNumberEntry.tsx` (line 79)
- **Problem**: ID number is dispatched to state, but may not persist correctly
- **Impact**: When `OnboardingComplete` reads `state.data.idNumber`, it might be `undefined`
- **Result**: `nationalId` field is sent as `undefined` to backend

### Issue 3: KYB Data Not Handled Correctly
**Location**: `src/features/onboarding/pages/OnboardingComplete.tsx` (lines 28-31, 43-45)
- **Problem**: 
  - Line 28: If `purposeOfAccount` is undefined, calling `.join()` will crash
  - Lines 43-45: KYB fields might be undefined if state wasn't persisted
- **Impact**: Profile creation fails or sends incomplete data
- **Result**: KYB options (annualRevenue, businessActivity, accountPurpose) are not saved

### Issue 4: Backend DTO Missing `sourceOfFunds` Field
**Location**: `ewallet-backend/src/main/java/com/company/ewallet/api/dto/onboarding/CreateProfileRequest.java`
- **Problem**: Frontend sends `sourceOfFunds` but backend DTO doesn't have this field
- **Impact**: `sourceOfFunds` is ignored even though the entity (`OnboardingProfile`) has this field
- **Result**: Source of funds data is lost

### Issue 5: Backend Service Doesn't Save `sourceOfFunds`
**Location**: `ewallet-backend/src/main/java/com/company/ewallet/service/OnboardingService.java` (line 63-65)
- **Problem**: Service saves `annualRevenue`, `businessActivity`, `accountPurpose` but NOT `sourceOfFunds`
- **Impact**: Even if DTO is fixed, the service won't save it
- **Result**: Source of funds is never persisted to database

---

## 📋 Step-by-Step Fix Plan

### Fix 1: Update PasswordSetup to Navigate to Complete Page
**File**: `src/features/onboarding/pages/PasswordSetup.tsx`
- Change line 93 from `navigate('/login')` to `navigate('/onboarding/complete')`
- This ensures profile creation happens after password is set

### Fix 2: Fix OnboardingComplete to Handle Undefined Values
**File**: `src/features/onboarding/pages/OnboardingComplete.tsx`
- Add null checks for `state.data.idNumber` before using it
- Fix `accountPurpose` construction to handle undefined `purposeOfAccount` array
- Add validation to ensure required fields are present before API call
- Add better error handling and logging

### Fix 3: Add `sourceOfFunds` to Backend DTO
**File**: `ewallet-backend/src/main/java/com/company/ewallet/api/dto/onboarding/CreateProfileRequest.java`
- Add `private String sourceOfFunds;` field to the DTO class

### Fix 4: Update Backend Service to Save `sourceOfFunds`
**File**: `ewallet-backend/src/main/java/com/company/ewallet/service/OnboardingService.java`
- Add `profile.setSourceOfFunds(request.getSourceOfFunds());` after line 65

### Fix 5: Verify State Persistence
**Files**: 
- `src/store/OnboardingContext.tsx`
- `src/services/stateService.ts`
- Verify that `idNumber` and `kybData` are properly persisted to localStorage
- Ensure state is loaded correctly when navigating to OnboardingComplete

### Fix 6: Add Frontend Type Safety
**File**: `src/services/onboardingAPI.ts`
- Update `CreateProfileRequest` interface to include `sourceOfFunds?: string;`

---

## 🧪 Testing Checklist

After fixes, verify:
- [ ] National ID is saved in state when entered in IDNumberEntry page
- [ ] KYB data is saved in state when submitted in KYBPage
- [ ] State persists correctly across page navigations
- [ ] PasswordSetup navigates to OnboardingComplete (not login)
- [ ] OnboardingComplete successfully reads all data from state
- [ ] Profile creation API receives all required fields (nationalId, annualRevenue, businessActivity, accountPurpose, sourceOfFunds)
- [ ] Backend saves all fields to database correctly
- [ ] User can login and see their profile data

---

## 🔗 Related Files

### Frontend Files:
1. `src/features/onboarding/pages/PasswordSetup.tsx` - Navigation fix
2. `src/features/onboarding/pages/OnboardingComplete.tsx` - Data handling fix
3. `src/features/onboarding/pages/IDNumberEntry.tsx` - State dispatch (verify)
4. `src/features/onboarding/pages/KYBPage.tsx` - State dispatch (verify)
5. `src/store/onboardingFSM.ts` - State structure (verify)
6. `src/store/OnboardingContext.tsx` - State persistence (verify)
7. `src/services/onboardingAPI.ts` - API interface (add sourceOfFunds)

### Backend Files:
1. `src/main/java/com/company/ewallet/api/dto/onboarding/CreateProfileRequest.java` - Add sourceOfFunds field
2. `src/main/java/com/company/ewallet/service/OnboardingService.java` - Save sourceOfFunds
3. `src/main/java/com/company/ewallet/domain/OnboardingProfile.java` - Entity already has field ✅

---

## ⚠️ Critical Notes

1. **State Persistence**: The `OnboardingContext` uses `useEffect` to save state, but there might be a race condition where navigation happens before state is saved. Consider using a ref or ensuring state is saved synchronously.

2. **Error Handling**: Add comprehensive error handling in `OnboardingComplete` to catch and display issues with missing data.

3. **Backend Validation**: Ensure backend validates that `nationalId` and KYB fields are not null/empty before saving.

4. **Idempotency**: The backend already checks for existing profiles. If a user goes through onboarding twice, ensure the second attempt updates the existing profile with new data.

