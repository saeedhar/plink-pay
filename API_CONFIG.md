# API Configuration - Plink Web App

## Production Backend Server
**Host:** `101.46.58.237`  
**Port:** `8080`  
**Base URL:** `http://101.46.58.237:8080/api/v1`

## ✅ Completed Updates (2025-10-07)

### 1. Updated API Base URLs
All API service files now point to the production server:

- ✅ `src/services/onboardingAPI.ts` → `http://101.46.58.237:8080/api/v1`
- ✅ `src/services/http.ts` → `http://101.46.58.237:8080/api/v1`
- ✅ `src/services/realBackendAPI.ts` → `http://101.46.58.237:8080/api/v1`
- ✅ `src/features/admin/api/kybOptionsService.ts` → `http://101.46.58.237:8080/api/v1`
- ✅ `src/features/onboarding/api/kybPublicService.ts` → `http://101.46.58.237:8080/api/v1`

### 2. Fixed Endpoint Paths
Corrected endpoint paths to match backend API:

- ✅ **Phone Uniqueness:** `/auth/phone-uniqueness` → `/auth/check-phone-uniqueness`
- ✅ **Profile Creation:** `/onboarding/create-profile` → `/onboarding/profile`

### 3. API Connectivity Verified
✅ Server is reachable and responding correctly:
- Health Check: `GET /api/v1/health` → ✅ Status: UP
- KYB Options: `GET /api/v1/kyb/options` → ✅ Data retrieved successfully

## API Endpoints Reference

### Authentication
| Endpoint | Method | Description | Status |
|----------|--------|-------------|---------|
| `/auth/send-otp` | POST | Send OTP to phone | ✅ |
| `/auth/verify-otp` | POST | Verify OTP code | ✅ |
| `/auth/set-password` | POST | Set user password | ✅ |
| `/auth/set-passcode` | POST | Set user passcode | ✅ |
| `/auth/login/password` | POST | Login with password | ✅ |
| `/auth/login/passcode` | POST | Login with passcode | ✅ |
| `/auth/login/biometric` | POST | Login with biometric | ✅ |
| `/auth/check-phone-uniqueness` | POST | Check phone availability | ✅ Fixed |
| `/auth/refresh` | POST | Refresh access token | ✅ |
| `/auth/logout` | POST | Logout user | ✅ |

### Verification
| Endpoint | Method | Description | Status |
|----------|--------|-------------|---------|
| `/verification/validate-cr` | POST | Validate CR number | ✅ |
| `/verification/validate-id` | POST | Validate national ID | ✅ |
| `/verification/validate-freelancer-license` | POST | Validate freelancer license | ✅ |

### Nafath
| Endpoint | Method | Description | Status |
|----------|--------|-------------|---------|
| `/nafath/initiate` | POST | Initiate Nafath verification | ✅ |
| `/nafath/status/{sessionId}` | GET | Get Nafath status | ✅ |

### Onboarding
| Endpoint | Method | Description | Status |
|----------|--------|-------------|---------|
| `/onboarding/profile` | POST | Create user profile | ✅ Fixed |
| `/onboarding/status` | GET | Get onboarding status | ✅ |

### KYB (Know Your Business)
| Endpoint | Method | Description | Status |
|----------|--------|-------------|---------|
| `/kyb/options` | GET | Get KYB dropdown options | ✅ Tested |

### Health
| Endpoint | Method | Description | Status |
|----------|--------|-------------|---------|
| `/health` | GET | Health check | ✅ Tested |

## Environment Variables

### For Production:
```bash
VITE_API_BASE_URL=http://101.46.58.237:8080/api/v1
VITE_USE_MOCKS=false
VITE_ADMIN_ENABLED=true
```

### For Local Development (if needed):
```bash
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_USE_MOCKS=false
VITE_ADMIN_ENABLED=true
```

### For Mock Testing:
```bash
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_USE_MOCKS=true
VITE_ADMIN_ENABLED=true
```

## Testing Commands

### Test Health Endpoint
```bash
curl http://101.46.58.237:8080/api/v1/health
```

### Test KYB Options
```bash
curl 'http://101.46.58.237:8080/api/v1/kyb/options?category=annual_revenue&locale=en'
```

### Test Phone Uniqueness
```bash
curl -X POST http://101.46.58.237:8080/api/v1/auth/check-phone-uniqueness \
  -H "Content-Type: application/json" \
  -d '{"phoneE164": "+966501234567"}'
```

## Known Issues & Notes

### Resolved:
- ✅ Wrong endpoint path for profile creation (fixed)
- ✅ Wrong endpoint path for phone uniqueness check (fixed)
- ✅ Multiple conflicting API base URLs (standardized to production)

### Remaining:
- ⚠️ Duplicate API service files (`onboardingAPI.ts` vs `realBackendAPI.ts`)
  - Recommendation: Use `onboardingAPI.ts` as primary, remove `realBackendAPI.ts`

## Next Steps

1. ✅ All API endpoints updated to production server
2. ✅ Fixed incorrect endpoint paths
3. ✅ Verified server connectivity
4. 🔄 Recommend consolidating duplicate API service files
5. 🔄 Test full onboarding flow end-to-end

## Support

- **Backend Server:** 101.46.58.237:8080
- **SSH Access:** root@101.46.58.237 -p 22
- **API Documentation:** Check backend OpenAPI/Swagger docs




