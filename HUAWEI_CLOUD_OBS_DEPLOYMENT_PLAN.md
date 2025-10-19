# Huawei Cloud OBS Deployment Plan
## Deploying Plink Frontend to Huawei Cloud Object Storage Service

---

## 📋 Overview

Deploy the Plink React frontend as a static website on Huawei Cloud OBS (Object Storage Service) with CDN acceleration.

**Current Setup:**
- Frontend: Vite + React + TypeScript
- Backend: Spring Boot on ECS (101.46.58.237:8080)
- OTP: IntegrealMW API integration

**Target Setup:**
- Frontend: Static files on OBS with HTTPS
- CDN: Huawei Cloud CDN for global acceleration
- Backend: Same ECS server (no changes)

---

## 🎯 Architecture

```
Users
  ↓ HTTPS
[CDN] (Huawei Cloud CDN)
  ↓
[OBS Bucket] (Static Website Hosting)
  - index.html
  - JavaScript bundles
  - CSS files
  - Assets
  ↓ API Calls
[ECS Backend] (101.46.58.237:8080)
  ↓
[IntegrealMW API]
[PostgreSQL Database]
```

---

## ✅ Step 1: Prepare Frontend for Production

### 1.1 Update Environment Configuration

Create `.env.production`:

```bash
# Production environment variables
VITE_API_BASE_URL=http://101.46.58.237:8080
VITE_USE_MOCKS=false
VITE_ADMIN_ENABLED=true
```

**Key Change:** Use full backend URL (not empty string for proxy)

### 1.2 Update `src/lib/api.ts`

Already done! ✅ The `apiUrl()` function will use `VITE_API_BASE_URL` in production:

```typescript
const BASE = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
export function apiUrl(path: string) {
  return `${BASE}${path.startsWith('/') ? path : `/${path}`}`
}
```

### 1.3 Build for Production

```bash
cd /Users/saeedhar/plink
npm run build
```

**Output:** `dist/` folder with optimized static files

**Build will:**
- ✅ Minify JavaScript/CSS
- ✅ Hash filenames for caching
- ✅ Optimize assets
- ✅ Tree-shake unused code
- ✅ Generate source maps

---

## ✅ Step 2: Create OBS Bucket

### 2.1 Login to Huawei Cloud Console
- Go to: https://console.huaweicloud.com
- Navigate to: **Object Storage Service (OBS)**

### 2.2 Create Bucket

**Settings:**
- **Bucket Name:** `plink-frontend` (or your preferred name)
- **Region:** Same as your ECS server (for lower latency)
- **Storage Class:** Standard
- **Bucket Policy:** Public Read (for website hosting)
- **Versioning:** Optional (recommended for rollback)

### 2.3 Enable Static Website Hosting

**In bucket settings:**
- Go to: **Basic Configurations** → **Static Website Hosting**
- Enable: ✅ Static Website Hosting
- **Default Homepage:** `index.html`
- **Error Page:** `index.html` (for SPA routing)
- **Redirect All Requests:** Leave empty

**This generates a public URL like:**
```
http://plink-frontend.obs.cn-north-4.myhuaweicloud.com
```

---

## ✅ Step 3: Configure CORS (Important!)

### 3.1 Set Bucket CORS Rules

**In OBS Console:**
- Go to bucket → **Access Control** → **CORS Rules**
- Add rule:

```json
{
  "AllowedOrigin": ["*"],
  "AllowedMethod": ["GET", "HEAD"],
  "AllowedHeader": ["*"],
  "MaxAgeSeconds": 3600
}
```

**This allows:** Frontend on OBS to make API calls to backend ECS

---

## ✅ Step 4: Upload Files to OBS

### Option A: Using OBS Browser Tool (Recommended)

1. **Download OBS Browser:**
   - https://support.huaweicloud.com/browsertg-obs/obs_03_1003.html

2. **Configure Access:**
   - AK (Access Key)
   - SK (Secret Key)
   - Get from: **My Credentials** → **Access Keys**

3. **Upload:**
   - Select bucket: `plink-frontend`
   - Upload entire `dist/` folder contents
   - **Don't upload the `dist` folder itself** - upload its CONTENTS

### Option B: Using Huawei Cloud CLI

```bash
# Install Huawei Cloud CLI
pip install huaweicloudcli huaweicloudcli-obs

# Configure
hcloud configure

# Upload dist folder
hcloud obs object upload \
  --bucket plink-frontend \
  --key / \
  --file /Users/saeedhar/plink/dist/ \
  --recursive
```

### Option C: Using OBSUtil

```bash
# Download OBSUtil
# https://support.huaweicloud.com/utiltg-obs/obs_11_0001.html

# Configure
./obsutil config \
  -i=<AK> \
  -k=<SK> \
  -e=obs.cn-north-4.myhuaweicloud.com

# Upload
./obsutil cp dist/ obs://plink-frontend/ -r -f
```

---

## ✅ Step 5: Configure Backend CORS

### 5.1 Update SecurityConfig.java

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    
    // Add OBS bucket URL
    configuration.setAllowedOrigins(Arrays.asList(
        "http://localhost:5174",  // Dev
        "http://plink-frontend.obs.cn-north-4.myhuaweicloud.com",  // OBS
        "https://your-domain.com"  // Production domain (if using CDN)
    ));
    
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

### 5.2 Rebuild and Redeploy Backend

```bash
cd /Users/saeedhar/ewallet-backend
gradle bootJar
scp build/libs/ewallet-backend-0.0.1-SNAPSHOT.jar root@101.46.58.237:/opt/ewallet/
# Restart backend
```

---

## ✅ Step 6: Configure CDN (Optional but Recommended)

### 6.1 Create CDN Distribution

**In Huawei Cloud Console:**
- Navigate to: **CDN**
- Click: **Create Distribution**

**Settings:**
- **Domain Name:** `cdn.yourapp.com` (your custom domain)
- **Origin Server:** OBS bucket URL
- **Origin Protocol:** HTTP
- **Cache Rules:** Aggressive caching for static assets

### 6.2 Configure SSL Certificate

- Upload SSL certificate for HTTPS
- Or use Huawei Cloud managed certificate

### 6.3 Update DNS

Point your domain to CDN:
```
cdn.yourapp.com → CNAME → xxx.xxx.cdn.huaweicloud.com
```

---

## ✅ Step 7: Production Environment Setup

### 7.1 File Structure in OBS

```
plink-frontend/ (bucket)
├── index.html
├── assets/
│   ├── index-abc123.js
│   ├── index-def456.css
│   ├── logo-xyz789.svg
│   └── ...
└── favicon.ico
```

### 7.2 Update .env.production

```bash
# Production API URL
VITE_API_BASE_URL=https://api.yourapp.com

# Or if using IP:
VITE_API_BASE_URL=http://101.46.58.237:8080

# Disable mocks
VITE_USE_MOCKS=false

# Admin panel
VITE_ADMIN_ENABLED=true
```

---

## ✅ Step 8: Testing Checklist

### Before Deployment:
- [ ] Build succeeds: `npm run build`
- [ ] Check dist/ folder size (should be < 10MB)
- [ ] Verify `VITE_API_BASE_URL` in build
- [ ] Test locally: `npm run preview`

### After Deployment:
- [ ] Access OBS URL: `http://plink-frontend.obs.xxx.myhuaweicloud.com`
- [ ] Check if index.html loads
- [ ] Check browser console for errors
- [ ] Test login flow
- [ ] Test OTP flow (IntegrealMW)
- [ ] Test forgot password
- [ ] Test onboarding
- [ ] Verify API calls reach backend
- [ ] Check backend logs for requests

### Security:
- [ ] Verify CORS is working
- [ ] Check no sensitive data in frontend
- [ ] Verify HTTPS (if using CDN)
- [ ] Test from different devices/networks

---

## 🔧 Step 9: Deployment Script

Create `deploy-obs.sh`:

```bash
#!/bin/bash
set -e

echo "🏗️  Building Plink Frontend for Production..."

# Clean previous build
rm -rf dist/

# Build
npm run build

echo "✅ Build complete!"
echo "📦 Build size:"
du -sh dist/

echo ""
echo "📤 Uploading to OBS..."

# Upload using obsutil
./obsutil cp dist/ obs://plink-frontend/ -r -f

echo "✅ Deployment complete!"
echo "🌐 Access at: http://plink-frontend.obs.cn-north-4.myhuaweicloud.com"
echo ""
echo "🔍 Next steps:"
echo "  1. Test the website"
echo "  2. Check browser console"
echo "  3. Verify API calls work"
echo "  4. Monitor backend logs"
```

**Usage:**
```bash
chmod +x deploy-obs.sh
./deploy-obs.sh
```

---

## 🚨 Common Issues & Solutions

### Issue 1: API Calls Fail (CORS)
**Symptom:** Browser console shows CORS errors
**Fix:** Update backend CORS configuration (Step 5)

### Issue 2: Routes Return 404
**Symptom:** `/login` works but refresh shows 404
**Fix:** Set Error Page to `index.html` in OBS bucket settings

### Issue 3: Assets Not Loading
**Symptom:** White screen, missing CSS/JS
**Fix:** 
- Check bucket is Public Read
- Verify files uploaded to bucket root (not in `dist/` subfolder)

### Issue 4: Slow Loading
**Symptom:** Website takes long to load
**Fix:** 
- Enable CDN (Step 6)
- Configure aggressive caching
- Use image optimization

### Issue 5: API URL Wrong
**Symptom:** API calls go to wrong server
**Fix:**
- Check `.env.production` has correct `VITE_API_BASE_URL`
- Rebuild after changing env

---

## 💰 Cost Estimation

### Huawei Cloud OBS:
- **Storage:** ~$0.03 per GB/month
- **Traffic:** ~$0.15 per GB (outbound)
- **Requests:** ~$0.01 per 10,000 requests

**Estimated for small app:**
- Storage (100MB): $0.003/month
- Traffic (10GB/month): $1.50/month
- Requests (100k/month): $0.10/month

**Total:** ~$1.60/month for OBS

### Optional CDN:
- **CDN Traffic:** ~$0.12 per GB
- **HTTPS Requests:** $0.01 per 10,000

**Total with CDN:** ~$3-5/month

---

## 🔐 Security Checklist

- [ ] Enable bucket encryption
- [ ] Configure bucket policies (deny public write)
- [ ] Use HTTPS (via CDN)
- [ ] Set appropriate cache headers
- [ ] Remove sensitive data from frontend code
- [ ] Enable access logging
- [ ] Set up bucket lifecycle rules (delete old versions)
- [ ] Configure WAF (Web Application Firewall) if needed

---

## 📊 Monitoring

### OBS Bucket Monitoring:
- **Metrics:** Storage usage, bandwidth, requests
- **Location:** OBS Console → Bucket → Monitoring

### CDN Monitoring:
- **Metrics:** Traffic, cache hit rate, origin latency
- **Location:** CDN Console → Monitoring

### Backend API Monitoring:
- **Log File:** `/opt/ewallet/app_live.log`
- **Health Check:** `http://101.46.58.237:8080/actuator/health`

---

## 🚀 Quick Start Commands

```bash
# 1. Create production env file
cat > .env.production << 'EOF'
VITE_API_BASE_URL=http://101.46.58.237:8080
VITE_USE_MOCKS=false
VITE_ADMIN_ENABLED=true
EOF

# 2. Build
npm run build

# 3. Test locally
npm run preview

# 4. Upload to OBS (using obsutil)
./obsutil cp dist/ obs://plink-frontend/ -r -f

# 5. Access
open http://plink-frontend.obs.cn-north-4.myhuaweicloud.com
```

---

## 📝 Deployment Checklist

### Pre-Deployment:
- [x] Fix all linting errors ✅
- [x] All API calls use `apiUrl()` ✅
- [ ] Create `.env.production`
- [ ] Build successfully
- [ ] Test with `npm run preview`
- [ ] Update backend CORS

### Deployment:
- [ ] Create OBS bucket
- [ ] Enable static website hosting
- [ ] Configure CORS rules
- [ ] Upload dist/ contents
- [ ] Set bucket to Public Read
- [ ] Test OBS website URL

### Post-Deployment:
- [ ] Test all pages load
- [ ] Verify API calls work
- [ ] Test login flow
- [ ] Test OTP generation (IntegrealMW)
- [ ] Test forgot password
- [ ] Monitor backend logs
- [ ] Check for console errors

### Optional:
- [ ] Set up CDN
- [ ] Configure custom domain
- [ ] Enable HTTPS
- [ ] Set up WAF
- [ ] Configure monitoring alerts

---

## 🔄 Update Process (After Initial Deployment)

```bash
# 1. Make code changes
# 2. Build
npm run build

# 3. Upload (overwrites old files)
./obsutil cp dist/ obs://plink-frontend/ -r -f

# 4. Clear CDN cache (if using CDN)
# Via console: CDN → Cache Purge → Enter URL patterns

# 5. Test
# Users may need to hard refresh (Ctrl+Shift+R)
```

---

## 🎯 Alternative: Use Huawei Cloud CodeArts

For automated CI/CD:

```yaml
# .obs-deploy.yml
version: 1.0
steps:
  - name: install
    run: npm install
    
  - name: build
    run: npm run build
    
  - name: deploy
    run: |
      obsutil cp dist/ obs://plink-frontend/ -r -f
```

---

## 📚 Next Steps After This Plan

1. **Create `.env.production`** with correct backend URL
2. **Build the frontend**
3. **Create OBS bucket** in Huawei Cloud
4. **Upload files**
5. **Test website**
6. **Optional:** Set up CDN + custom domain

---

## ⚠️ Important Notes

1. **SPA Routing:** Must set Error Page to `index.html` for client-side routing
2. **API CORS:** Backend must allow OBS bucket URL in CORS
3. **Cache:** Browser caching can prevent seeing updates (use versioned builds)
4. **HTTPS:** Recommended for production (use CDN with SSL certificate)
5. **IntegrealMW:** Still works through backend (no frontend changes needed)

---

## 🎉 Benefits of OBS Deployment

- ✅ **Fast:** Global CDN distribution
- ✅ **Scalable:** Handles traffic spikes automatically
- ✅ **Cheap:** Pay only for storage and bandwidth used
- ✅ **Reliable:** 99.99% SLA
- ✅ **Simple:** No server management
- ✅ **Secure:** HTTPS + WAF available

---

**Ready to deploy?** Let me know if you want to proceed with any step!


