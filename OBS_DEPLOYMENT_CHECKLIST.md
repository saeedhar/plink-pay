# Huawei Cloud OBS Deployment - Step by Step Checklist

## ✅ Preparation Complete

- ✅ Frontend built for production (2.7MB, 17 files)
- ✅ Production env configured
- ✅ All API calls use `apiUrl()`
- ✅ Zero linting errors
- ✅ Deployment archive created: `plink-frontend-deploy.tar.gz` (796KB)

---

## 📋 Now Follow These Steps in Huawei Cloud Console

### STEP 1: Create OBS Bucket

1. Login to: https://console.huaweicloud.com
2. Search for: **OBS** or go to **Object Storage Service**
3. Click: **Create Bucket**

**Configuration:**
```
Bucket Name: plink-frontend
Region: cn-north-4 (or same as your ECS)
Storage Class: Standard
Versioning: Disabled (for now)
Encryption: Optional
Bucket Policy: Public Read
```

4. Click **Create**

---

### STEP 2: Enable Static Website Hosting

1. Click on your bucket: `plink-frontend`
2. Go to: **Basic Configurations** → **Static Website Hosting**
3. Click **Configure**

**Settings:**
```
Status: Enabled
Default Homepage: index.html
Error Document: index.html  (IMPORTANT for React routing!)
Redirect All Requests: Leave empty
```

4. Click **OK**

**You'll get a URL like:**
```
http://plink-frontend.obs.cn-north-4.myhuaweicloud.com
```

---

### STEP 3: Configure CORS

1. In bucket, go to: **Access Control** → **CORS Rules**
2. Click **Create**

**Rule Configuration:**
```
Allowed Origins: *
Allowed Methods: GET, HEAD
Allowed Headers: *
Exposed Headers: ETag
Max Age (seconds): 3600
```

3. Click **OK**

---

### STEP 4: Upload Files

**⚠️ CRITICAL:** Upload the **CONTENTS** of `dist/` folder, NOT the `dist` folder itself!

#### Option A: Using OBS Browser (Easiest)

1. Download OBS Browser from Huawei Cloud
2. Login with your AK/SK
3. Navigate to `plink-frontend` bucket
4. **Drag and drop ALL files from `dist/` folder into bucket ROOT**
   - ✅ Correct: `index.html` at bucket root
   - ❌ Wrong: `dist/index.html` in bucket

#### Option B: Using Console Web Upload

1. In bucket, click **Upload Object**
2. Click **Add File** → Select all files from `dist/`
3. Or use the archive:
   ```bash
   # On your Mac, extract first:
   mkdir /tmp/plink-deploy
   tar -xzf plink-frontend-deploy.tar.gz -C /tmp/plink-deploy
   
   # Then upload all files from /tmp/plink-deploy/
   ```

4. Set **Storage Class:** Standard
5. Click **Upload**

#### Option C: Using obsutil CLI

```bash
# If you have obsutil installed:
./obsutil cp dist/ obs://plink-frontend/ -r -f
```

---

### STEP 5: Set Permissions

1. In bucket, go to: **Access Control** → **Bucket Policies**
2. Click **Create**

**Policy (Public Read):**
```json
{
  "Statement": [{
    "Effect": "Allow",
    "Principal": {"ID": ["*"]},
    "Action": ["GetObject"],
    "Resource": ["plink-frontend/*"]
  }]
}
```

Or use **Quick Config** → **Public Read**

3. Click **OK**

---

### STEP 6: Verify Upload

**Check these files exist in bucket root:**
- ✅ `index.html`
- ✅ `assets/` folder
  - `index-2GuBNYDV.js`
  - `index-lJ0C3iof.css`
  - SVG images
  - PNG images
- ✅ `mockServiceWorker.js`
- ✅ `vite.svg`

**Total:** 17 files

---

### STEP 7: Test Website

1. Copy the Static Website Hosting URL:
   ```
   http://plink-frontend.obs.cn-north-4.myhuaweicloud.com
   ```

2. Open in browser

3. **Check:**
   - [ ] Page loads (not 404)
   - [ ] CSS loads (page is styled)
   - [ ] Images load
   - [ ] No console errors
   - [ ] Can navigate to `/login`
   - [ ] Can navigate to `/onboarding/business-type`

---

### STEP 8: Test API Integration

1. Open browser DevTools (F12)
2. Go to login page
3. Try to send OTP
4. **Check Network tab:**
   - Request URL should be: `http://101.46.58.237:8080/api/v1/auth/send-otp`
   - Status should be: 200
   - Response should have: `{"success":true,...}`

5. **If CORS error appears:**
   - Update backend CORS (see Step 9 below)

---

### STEP 9: Update Backend CORS (If Needed)

**On backend server:**

```bash
ssh root@101.46.58.237

# Add OBS URL to allowed origins
# Edit SecurityConfig.java or application.yml
```

**In `application-prod.yml`:**
```yaml
app:
  cors:
    allowedOrigins: "http://plink-frontend.obs.cn-north-4.myhuaweicloud.com,http://localhost:5174"
```

**Then rebuild and restart backend**

---

## 🎯 Success Criteria

When deployment is successful, you should be able to:

- ✅ Access website via OBS URL
- ✅ See styled pages (CSS loaded)
- ✅ Navigate between pages (SPA routing works)
- ✅ Call backend APIs (CORS working)
- ✅ Login flow works
- ✅ OTP generation works (IntegrealMW)
- ✅ Complete onboarding flow

---

## 🐛 Troubleshooting

### Problem: Page shows 404
**Fix:** 
- Check files uploaded to bucket ROOT (not in subfolder)
- Verify Static Website Hosting is enabled
- Check Error Document is set to `index.html`

### Problem: White screen
**Fix:**
- Open DevTools console
- Check for asset loading errors
- Verify bucket is Public Read
- Check CORS is configured

### Problem: API calls fail
**Fix:**
- Check `VITE_API_BASE_URL` in build
- Verify backend CORS allows OBS URL
- Check Network tab for exact error

### Problem: Routes return 404 on refresh
**Fix:**
- Verify Error Document is `index.html`
- This makes all 404s serve index.html (SPA routing)

---

## 📊 Current Status

✅ **Ready to Deploy:**
- Frontend built: `dist/` (2.7MB, 17 files)
- Archive created: `plink-frontend-deploy.tar.gz` (796KB)
- Production config: `.env.production`
- Preview tested: `http://localhost:4173`

**Next:** Follow Steps 1-9 above in Huawei Cloud Console

---

## 🚀 Quick Reference

**OBS Website URL (after deployment):**
```
http://plink-frontend.obs.cn-north-4.myhuaweicloud.com
```

**Backend API:**
```
http://101.46.58.237:8080
```

**Files to upload:**
```
dist/* → OBS bucket root
```

**Test after deployment:**
```
curl http://plink-frontend.obs.cn-north-4.myhuaweicloud.com
```

---

**Ready to proceed with OBS Console setup!** 🎉

When you create the bucket, let me know and I'll help verify it's configured correctly.

