# Clear Old State and Test Fresh

## Option 1: Clear in Browser Console
Open browser console and run:
```javascript
localStorage.clear()
sessionStorage.clear()
location.reload()
```

## Option 2: Start Fresh Session
1. Open browser in Incognito/Private mode
2. Go to http://localhost:5173
3. Start onboarding from beginning

## Then Test Complete Flow:
- Phone: 0501234567
- OTP: [from response]
- CR: 1234567890
- ID: 1010101015
- Password: Test@1234

You should now see all the debug logs showing userId flowing through!
