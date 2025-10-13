# Backend CSRF Fix Instructions

## Problem
The backend is rejecting all POST requests with **403 Forbidden** due to Spring Security's CSRF protection.

## Solution
You need to update the Spring Security configuration on the backend to disable CSRF for API endpoints.

## SSH into Backend Server

```bash
sshpass -p '1234566Yoyo$' ssh root@101.46.58.237
```

## Option 1: Quick Fix - Restart with CSRF Disabled Profile

If the backend has a configuration to disable CSRF, you can restart it with:

```bash
# Stop the current application
pkill -f ewallet-backend.jar

# Start with CSRF disabled (if such profile exists)
cd /opt/ewallet
nohup java -jar ewallet-backend.jar \
  --spring.config.location=classpath:/application.yml,/opt/ewallet/application-prod.yml \
  --spring.profiles.active=prod,mock,no-csrf \
  > /opt/ewallet/app.log 2>&1 &

# Or modify the application-prod.yml to add:
```

## Option 2: Add CSRF Configuration to application-prod.yml

Edit the production config:

```bash
nano /opt/ewallet/application-prod.yml
```

Add this at the end:

```yaml
spring:
  security:
    csrf:
      enabled: false
```

Then restart:

```bash
pkill -f ewallet-backend.jar
cd /opt/ewallet
nohup java -jar ewallet-backend.jar \
  --spring.config.location=classpath:/application.yml,/opt/ewallet/application-prod.yml \
  --spring.profiles.active=prod,mock \
  > /opt/ewallet/app.log 2>&1 &
```

## Option 3: Recompile Backend (Best but takes longer)

If you have the backend source code on the server:

1. Find the SecurityConfig.java file
2. Add `.csrf().disable()` to the security configuration
3. Rebuild and redeploy

## Verify Fix

After making changes, test:

```bash
curl -X POST http://101.46.58.237:8080/api/v1/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"+966501234567","businessType":"freelancer"}'
```

Should return **200 OK** instead of **403 Forbidden**.

## Current Status
- ✅ Frontend configured correctly
- ✅ Vite proxy working
- ❌ Backend CSRF protection blocking requests
- ⏳ Waiting for backend fix


