// Quick Refresh Token Test - Paste in Browser Console
// After logging in, paste this in the console and run it

async function testRefreshToken() {
  console.log('🧪 Testing Refresh Token Flow...');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // 1. Check tokens
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!accessToken || !refreshToken) {
    console.error('❌ No tokens found. Please login first.');
    return;
  }
  
  console.log('✅ Tokens found');
  
  // 2. Decode access token expiration
  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const expiresAt = new Date(payload.exp * 1000);
    const now = new Date();
    const timeUntilExpiry = Math.floor((expiresAt - now) / 1000);
    
    console.log('📅 Access Token expires in:', timeUntilExpiry, 'seconds');
    console.log('   (', Math.floor(timeUntilExpiry / 60), 'minutes )');
    
    if (timeUntilExpiry > 60) {
      console.log('⚠️ Token not expired yet. For testing, we can manually expire it.');
    }
  } catch (e) {
    console.warn('Could not decode token:', e);
  }
  
  // 3. Test refresh endpoint directly
  console.log('\n📡 Testing refresh endpoint directly...');
  try {
    const response = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    
    const text = await response.text();
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = JSON.parse(text);
      console.log('✅ Refresh token works!');
      console.log('New access token:', data.accessToken?.substring(0, 50) + '...');
      console.log('New refresh token:', data.refreshToken?.substring(0, 50) + '...');
      
      // Update tokens
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      console.log('✅ Tokens updated in localStorage');
    } else {
      console.error('❌ Refresh failed:', text);
    }
  } catch (error) {
    console.error('❌ Error testing refresh:', error);
  }
  
  // 4. Test automatic refresh by making API call with expired token
  console.log('\n🔄 Testing automatic refresh (simulating expired token)...');
  console.log('   (This will trigger the automatic refresh in fetchWithAuth)');
  
  // Set a fake expired token temporarily
  const originalToken = accessToken;
  const fakeExpiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0IiwiZXhwIjoxNjAwMDAwMDAwfQ.expired';
  localStorage.setItem('accessToken', fakeExpiredToken);
  
  try {
    // Make an API call - should trigger automatic refresh
    const response = await fetch('/api/v1/wallet/balance', {
      headers: {
        'Authorization': `Bearer ${fakeExpiredToken}`
      }
    });
    
    console.log('API call status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Automatic refresh worked!');
      console.log('Balance data:', data);
      
      // Check if token was updated
      const newToken = localStorage.getItem('accessToken');
      if (newToken && newToken !== fakeExpiredToken) {
        console.log('✅ Access token was automatically refreshed');
      }
    } else {
      const text = await response.text();
      console.error('❌ API call failed:', response.status, text);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    // Restore original token if refresh didn't work
    const currentToken = localStorage.getItem('accessToken');
    if (currentToken === fakeExpiredToken) {
      localStorage.setItem('accessToken', originalToken);
      console.log('⚠️ Restored original token (refresh may not have worked)');
    }
  }
  
  console.log('\n✅ Test complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Check the Network tab to see the refresh request');
  console.log('Check Console for detailed logs');
}

// Run test
testRefreshToken();
