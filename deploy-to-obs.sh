#!/bin/bash
set -e

echo "📦 Huawei Cloud OBS Deployment Script"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
BUCKET_NAME="${OBS_BUCKET_NAME:-plink-frontend}"
REGION="${OBS_REGION:-cn-north-4}"

echo -e "${BLUE}Configuration:${NC}"
echo "  Bucket: $BUCKET_NAME"
echo "  Region: $REGION"
echo ""

# Check if dist exists
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Error: dist/ folder not found${NC}"
    echo "Please run 'npm run build' first"
    exit 1
fi

echo -e "${BLUE}📊 Build Information:${NC}"
echo "  Build size: $(du -sh dist/ | awk '{print $1}')"
echo "  Files: $(find dist/ -type f | wc -l | tr -d ' ') files"
echo ""

# Create deployment archive
echo -e "${BLUE}📦 Creating deployment archive...${NC}"
cd dist
tar -czf ../plink-frontend-deploy.tar.gz .
cd ..

echo -e "${GREEN}✅ Archive created: plink-frontend-deploy.tar.gz${NC}"
echo "  Size: $(du -sh plink-frontend-deploy.tar.gz | awk '{print $1}')"
echo ""

echo -e "${YELLOW}📋 Next Steps:${NC}"
echo ""
echo "1. Login to Huawei Cloud Console: https://console.huaweicloud.com"
echo "2. Navigate to: Object Storage Service (OBS)"
echo "3. Create bucket (if not exists): $BUCKET_NAME"
echo "   - Region: $REGION"
echo "   - Storage Class: Standard"
echo "   - Bucket Policy: Public Read"
echo ""
echo "4. Enable Static Website Hosting:"
echo "   - Basic Configurations → Static Website Hosting"
echo "   - Default Homepage: index.html"
echo "   - Error Page: index.html"
echo ""
echo "5. Upload files:"
echo "   Option A (Browser):"
echo "     - Extract: tar -xzf plink-frontend-deploy.tar.gz -C /tmp/plink-deploy"
echo "     - Upload /tmp/plink-deploy/* to bucket root (not in a subfolder!)"
echo ""
echo "   Option B (OBS Browser Tool):"
echo "     - Use OBS Browser to upload dist/ contents"
echo ""
echo "   Option C (obsutil CLI):"
echo "     obsutil cp dist/ obs://$BUCKET_NAME/ -r -f"
echo ""
echo "6. Test website:"
echo "   http://$BUCKET_NAME.obs.$REGION.myhuaweicloud.com"
echo ""
echo -e "${GREEN}🎉 Deployment package ready!${NC}"
echo ""
echo "Files ready for upload in: dist/"
echo "Archive for manual upload: plink-frontend-deploy.tar.gz"
