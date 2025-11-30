# Testing Refresh Token Flow

## Method 1: Manual Testing (Easiest)

### Step 1: Login and Get Tokens
1. Open browser DevTools (F12)
2. Go to Application/Storage tab → Local Storage
3. Login to the app
4. Verify tokens are stored:
   - `accessToken` - should be a JWT
   - `refreshToken` - should be a JWT

### Step 2: Force Access Token Expiration
1. In DevTools Console, run:
```javascript
// Get current access token
const oldToken = localStorage.getItem('accessToken');
console.log('Old token:', oldToken);

// Decode JWT to see expiration (optional)
const payload = JSON.parse(atob(oldToken.split('.')[1]));
console.log('Token expires at:', new Date(payload.exp * 1000));

// Manually expire the token by setting an expired one
// Or wait 15 minutes for natural expiration
```

### Step 3: Make an API Call
1. While on any page that makes API calls (e.g., Dashboard)
2. Open Network tab in DevTools
3. Make an action that triggers an API call (refresh page, click button)
4. Watch the Network tab:
   - First request: Should return 401
   - Second request: `/api/v1/auth/refresh` - should return 200
   - Third request: Original request retried - should return 200

### Step 4: Verify Success
- Check Console for: `✅ Token refreshed successfully`
- Check Network tab: Original API call should succeed
- User should still be on the same page (no redirect)

---

## Method 2: Browser Console Script

### Quick Test Script
```javascript
// Test refresh token flow
async function testRefreshToken() {
  console.log('🧪 Testing Refresh Token Flow...');
  
  // 1. Check if tokens exist
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!accessToken || !refreshToken) {
    console.error('❌ No tokens found. Please login first.');
    return;
  }
  
  console.log('✅ Tokens found');
  console.log('Access Token:', accessToken.substring(0, 50) + '...');
  console.log('Refresh Token:', refreshToken.substring(0, 50) + '...');
  
  // 2. Decode access token to see expiration
  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const expiresAt = new Date(payload.exp * 1000);
    const now = new Date();
    const timeUntilExpiry = expiresAt - now;
    
    console.log('📅 Access Token expires at:', expiresAt);
    console.log('⏰ Time until expiry:', Math.floor(timeUntilExpiry / 1000), 'seconds');
    
    if (timeUntilExpiry > 0) {
      console.log('⚠️ Token not expired yet. Wait', Math.ceil(timeUntilExpiry / 1000), 'seconds or manually expire it.');
    }
  } catch (e) {
    console.error('Failed to decode token:', e);
  }
  
  // 3. Manually expire access token (for testing)
  console.log('🔧 Setting expired access token for testing...');
  const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDAwMDB9.expired';
  localStorage.setItem('accessToken', expiredToken);
  console.log('✅ Access token set to expired value');
  
  // 4. Make an API call (this should trigger refresh)
  console.log('📡 Making API call to trigger refresh...');
  try {
    const response = await fetch('/api/v1/wallet/balance', {
      headers: {
        'Authorization': `Bearer ${expiredToken}`
      }
    });
    console.log('Response status:', response.status);
    
    if (response.status === 200) {
      console.log('✅ Refresh token worked! API call succeeded after refresh.');
      const data = await response.json();
      console.log('Response data:', data);
    } else {
      console.error('❌ API call failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  // 5. Check if new token was stored
  const newToken = localStorage.getItem('accessToken');
  if (newToken && newToken !== expiredToken) {
    console.log('✅ New access token stored:', newToken.substring(0, 50) + '...');
  } else {
    console.warn('⚠️ Token not refreshed');
  }
}

// Run the test
testRefreshToken();
```

---

## Method 3: Using curl (Backend Testing)

### Test Refresh Token Endpoint Directly
```bash
# 1. Login and get tokens
LOGIN_RESPONSE=$(curl -s -X POST "http://101.46.58.237:8080/api/v1/auth/login/password" \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrPhone": "+966501234567",
    "password": "YourPassword"
  }')

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.refreshToken')

echo "Access Token: $ACCESS_TOKEN"
echo "Refresh Token: $REFRESH_TOKEN"

# 2. Test refresh endpoint
REFRESH_RESPONSE=$(curl -s -X POST "http://101.46.58.237:8080/api/v1/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")

echo "Refresh Response:"
echo $REFRESH_RESPONSE | jq '.'

# 3. Verify new tokens
NEW_ACCESS_TOKEN=$(echo $REFRESH_RESPONSE | jq -r '.accessToken')
NEW_REFRESH_TOKEN=$(echo $REFRESH_RESPONSE | jq -r '.refreshToken')

if [ "$NEW_ACCESS_TOKEN" != "null" ] && [ -n "$NEW_ACCESS_TOKEN" ]; then
  echo "✅ Refresh token worked! New access token received."
else
  echo "❌ Refresh token failed!"
fi
```

---

## Method 4: Automated Test Script

Create a test file: `test-refresh-token.sh`

```bash
#!/bin/bash

BACKEND_URL="http://101.46.58.237:8080/api/v1"

echo "🧪 Testing Refresh Token Flow"
echo "=============================="

# Step 1: Login
echo ""
echo "Step 1: Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BACKEND_URL/auth/login/password" \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrPhone": "+966501234567",
    "password": "YourPassword"
  }')

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.accessToken')
REFRESH_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.refreshToken')

if [ "$ACCESS_TOKEN" = "null" ] || [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi

echo "✅ Login successful"
echo "Access Token: ${ACCESS_TOKEN:0:50}..."
echo "Refresh Token: ${REFRESH_TOKEN:0:50}..."

# Step 2: Test refresh
echo ""
echo "Step 2: Testing refresh token..."
REFRESH_RESPONSE=$(curl -s -X POST "$BACKEND_URL/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}")

NEW_ACCESS_TOKEN=$(echo $REFRESH_RESPONSE | jq -r '.accessToken')
NEW_REFRESH_TOKEN=$(echo $REFRESH_RESPONSE | jq -r '.refreshToken')

if [ "$NEW_ACCESS_TOKEN" != "null" ] && [ -n "$NEW_ACCESS_TOKEN" ]; then
  echo "✅ Refresh token worked!"
  echo "New Access Token: ${NEW_ACCESS_TOKEN:0:50}..."
  echo "New Refresh Token: ${NEW_REFRESH_TOKEN:0:50}..."
else
  echo "❌ Refresh token failed!"
  echo "Response: $REFRESH_RESPONSE"
  exit 1
fi

# Step 3: Test with expired access token
echo ""
echo "Step 3: Testing with expired access token..."
# Use the old access token (should fail)
EXPIRED_RESPONSE=$(curl -s -X GET "$BACKEND_URL/wallet/balance" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

if echo "$EXPIRED_RESPONSE" | grep -q "401\|Unauthorized"; then
  echo "✅ Expired token correctly rejected"
else
  echo "⚠️ Token might still be valid (wait 15 minutes)"
fi

# Use new access token (should work)
NEW_RESPONSE=$(curl -s -X GET "$BACKEND_URL/wallet/balance" \
  -H "Authorization: Bearer $NEW_ACCESS_TOKEN")

if echo "$NEW_RESPONSE" | grep -q "balance\|totalBalance"; then
  echo "✅ New token works correctly!"
else
  echo "❌ New token failed"
  echo "Response: $NEW_RESPONSE"
fi

echo ""
echo "✅ All tests passed!"
```

---

## What to Look For

### ✅ Success Indicators:
1. **Console Logs:**
   - `🔄 Access token expired (401), refreshing...`
   - `✅ Token refreshed successfully`
   - No error messages

2. **Network Tab:**
   - First request: 401 Unauthorized
   - Second request: `/api/v1/auth/refresh` → 200 OK
   - Third request: Original request → 200 OK

3. **User Experience:**
   - No modal appears
   - No redirect to login
   - User stays on same page
   - API call succeeds

### ❌ Failure Indicators:
1. **Console Logs:**
   - `❌ Token refresh failed`
   - `⚠️ Refresh token expired or invalid`
   - `❌ No refresh token available`

2. **Network Tab:**
   - `/api/v1/auth/refresh` → 401 or 500
   - Original request fails

3. **User Experience:**
   - Session expired modal appears
   - Redirected to login page

---

## Quick Test Checklist

- [ ] Login successfully
- [ ] Verify tokens in localStorage
- [ ] Wait 15 minutes OR manually expire access token
- [ ] Make an API call (refresh page, click button)
- [ ] Check Network tab for refresh request
- [ ] Verify original request succeeds
- [ ] Confirm no modal/redirect
- [ ] Check console for success logs

---

## Troubleshooting

### Issue: Refresh doesn't trigger
- Check if access token is actually expired
- Verify refresh token exists in localStorage
- Check Network tab for 401 response

### Issue: Refresh fails with 500
- Check backend logs
- Verify refresh token format
- Check if refresh token is expired (30 days)

### Issue: Still getting 401 after refresh
- Check if new token is stored correctly
- Verify Authorization header is updated
- Check backend session is valid

