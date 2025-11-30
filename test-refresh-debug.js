// Enhanced Refresh Token Test with Debugging
async function testRefreshDebug() {
  console.log('🔍 Enhanced Refresh Token Test');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // 1. Check tokens
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  console.log('📋 Token Check:');
  console.log('  Access Token:', accessToken ? accessToken.substring(0, 50) + '...' : '❌ Not found');
  console.log('  Refresh Token:', refreshToken ? refreshToken.substring(0, 50) + '...' : '❌ Not found');
  
  if (!refreshToken) {
    console.error('❌ No refresh token found. Please login first.');
    return;
  }
  
  // 2. Decode refresh token to check expiration
  try {
    const parts = refreshToken.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      const expiresAt = new Date(payload.exp * 1000);
      const now = new Date();
      const isExpired = expiresAt < now;
      
      console.log('\n📅 Refresh Token Info:');
      console.log('  Issued at:', new Date(payload.iat * 1000));
      console.log('  Expires at:', expiresAt);
      console.log('  Current time:', now);
      console.log('  Is expired:', isExpired ? '❌ YES' : '✅ NO');
      console.log('  Time until expiry:', isExpired ? 'EXPIRED' : Math.floor((expiresAt - now) / 1000 / 60 / 60 / 24) + ' days');
    }
  } catch (e) {
    console.warn('⚠️ Could not decode refresh token:', e);
  }
  
  // 3. Test refresh endpoint with full URL
  console.log('\n📡 Testing refresh endpoint...');
  
  // Use the apiUrl function if available, otherwise construct manually
  const baseUrl = window.location.origin.includes('localhost') 
    ? 'http://101.46.58.237:8080' 
    : window.location.origin;
  
  const refreshUrl = `${baseUrl}/api/v1/auth/refresh`;
  console.log('  URL:', refreshUrl);
  console.log('  Method: POST');
  console.log('  Body:', { refreshToken: refreshToken.substring(0, 30) + '...' });
  
  try {
    const response = await fetch(refreshUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });
    
    console.log('\n📥 Response:');
    console.log('  Status:', response.status);
    console.log('  Status Text:', response.statusText);
    console.log('  Headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('  Raw Response:', text);
    
    let data;
    try {
      data = JSON.parse(text);
      console.log('  Parsed Data:', data);
    } catch (e) {
      console.error('  ❌ Failed to parse JSON:', e);
      console.log('  Response text:', text);
      return;
    }
    
    if (response.ok && data.accessToken) {
      console.log('\n✅ Refresh token works!');
      console.log('  New Access Token:', data.accessToken.substring(0, 50) + '...');
      console.log('  New Refresh Token:', data.refreshToken?.substring(0, 50) + '...');
      
      localStorage.setItem('accessToken', data.accessToken);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      console.log('  ✅ Tokens updated in localStorage');
    } else {
      console.error('\n❌ Refresh failed:');
      console.error('  Status:', response.status);
      console.error('  Error:', data.error || 'Unknown error');
      console.error('  Message:', data.message || 'No message');
      console.error('  Exception Type:', data.exceptionType || 'N/A');
      
      if (response.status === 500 && data.message?.includes('Invalid refresh token')) {
        console.error('\n⚠️ Backend is returning 500 instead of 401');
        console.error('   This means the GlobalExceptionHandler fix needs to be deployed');
        console.error('   OR the refresh token is actually invalid/expired');
      }
    }
  } catch (error) {
    console.error('\n❌ Network Error:', error);
    console.error('  Message:', error.message);
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

testRefreshDebug();

