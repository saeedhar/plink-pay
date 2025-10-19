# Backend API Summary

**Server:** `http://101.46.58.237:8080/api/v1`  
**Status:** ✅ Running  
**Total APIs:** 23 endpoints

---

## Quick Reference

### 🔐 Authentication (11 APIs)
| # | Endpoint | Method | Description |
|---|----------|--------|-------------|
| 1 | `/auth/send-otp` | POST | Send OTP to phone |
| 2 | `/auth/verify-otp` | POST | Verify OTP code |
| 3 | `/auth/set-password` | POST | Set user password |
| 4 | `/auth/set-passcode` | POST | Set user passcode |
| 5 | `/auth/enable-biometric` | POST | Enable biometric auth |
| 6 | `/auth/login/password` | POST | Login with password |
| 7 | `/auth/login/passcode` | POST | Login with passcode |
| 8 | `/auth/login/biometric` | POST | Login with biometric |
| 9 | `/auth/refresh` | POST | Refresh access token |
| 10 | `/auth/logout` | POST | Logout user |
| 11 | `/auth/phone-uniqueness` | POST | Check phone availability |

### ✅ Verification (3 APIs)
| # | Endpoint | Method | Description |
|---|----------|--------|-------------|
| 12 | `/verification/validate-cr` | POST | Validate CR number |
| 13 | `/verification/validate-id` | POST | Validate national ID |
| 14 | `/verification/validate-freelancer-license` | POST | Validate freelancer license |

### 🆔 Nafath (2 APIs)
| # | Endpoint | Method | Description |
|---|----------|--------|-------------|
| 15 | `/nafath/initiate` | POST | Start Nafath verification |
| 16 | `/nafath/status/{sessionId}` | GET | Check Nafath status |

### 🏢 Onboarding (2 APIs)
| # | Endpoint | Method | Description |
|---|----------|--------|-------------|
| 17 | `/onboarding/create-profile` | POST | Create user profile |
| 18 | `/onboarding/status` | GET | Get onboarding status |

### 📊 KYB (1 API)
| # | Endpoint | Method | Description |
|---|----------|--------|-------------|
| 19 | `/kyb/options` | GET | Get KYB dropdown options |

**KYB Categories:**
- `annual_revenue` - 6 options
- `business_activity` - 12 options  
- `purpose_of_account` - 11 options

### ❤️ Health (2 APIs)
| # | Endpoint | Method | Description |
|---|----------|--------|-------------|
| 20 | `/health` | GET | Health check |
| 21 | `/status` | GET | Status check |

---

## Authentication Types

### 🔓 Public (No Auth Required)
- All Authentication APIs (except logout)
- All Verification APIs
- All Nafath APIs
- KYB Options API
- Health Check APIs

### 🔒 Protected (Bearer Token Required)
- `/auth/logout`
- `/onboarding/status`

---

## Quick Test Commands

```bash
# Health Check
curl http://101.46.58.237:8080/api/v1/health

# Send OTP
curl -X POST http://101.46.58.237:8080/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+966501234567", "businessType": "freelancer"}'

# Get KYB Options
curl 'http://101.46.58.237:8080/api/v1/kyb/options?category=annual_revenue&locale=en'
```

---

📖 **For detailed documentation, see:** [BACKEND_API_REFERENCE.md](./BACKEND_API_REFERENCE.md)




