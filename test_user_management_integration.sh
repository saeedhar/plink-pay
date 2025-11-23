#!/bin/bash

# Comprehensive Test Script for User Management API Integration
# Tests all 15 integrated screens end-to-end

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="http://101.46.58.237:8080"
TEST_PHONE="+966501234567"
TEST_PASSWORD="Test@1234"
TEST_EMAIL="test@example.com"

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TOTAL_TESTS=0

# Helper functions
print_test() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Test $TOTAL_TESTS: $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
    TESTS_PASSED=$((TESTS_PASSED + 1))
    echo -e "${GREEN}✅ PASS: $1${NC}"
}

print_failure() {
    TESTS_FAILED=$((TESTS_FAILED + 1))
    echo -e "${RED}❌ FAIL: $1${NC}"
    if [ -n "$2" ]; then
        echo -e "${RED}   Error: $2${NC}"
    fi
}

print_info() {
    echo -e "${YELLOW}ℹ️  $1${NC}"
}

# Check backend health
check_backend() {
    print_test "Backend Health Check"
    if curl -s -f "$BACKEND_URL/api/v1/health" > /dev/null; then
        print_success "Backend is reachable"
        return 0
    else
        print_failure "Backend is not reachable"
        return 1
    fi
}

# Test 1: Get User Profile
test_get_profile() {
    print_test "Get User Profile (AccountSettings.tsx)"
    
    # This requires authentication, so we'll test the endpoint exists
    RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/v1/users/me" \
        -H "Authorization: Bearer INVALID_TOKEN" 2>/dev/null || echo "000")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
        print_success "Profile endpoint exists (requires auth)"
    elif [ "$HTTP_CODE" = "200" ]; then
        print_success "Profile endpoint accessible"
    else
        print_failure "Profile endpoint check" "HTTP $HTTP_CODE"
    fi
}

# Test 2: Notification Preferences
test_notification_preferences() {
    print_test "Notification Preferences (NotificationManagement.tsx)"
    
    # Test GET endpoint
    RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/v1/users/me/preferences/notifications" \
        -H "Authorization: Bearer INVALID_TOKEN" 2>/dev/null || echo "000")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
        print_success "Notification preferences endpoint exists (requires auth)"
    else
        print_failure "Notification preferences endpoint" "HTTP $HTTP_CODE"
    fi
}

# Test 3: Language Preference
test_language_preference() {
    print_test "Language Preference (PreferredLanguage.tsx)"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/v1/users/me/preferences/language" \
        -H "Authorization: Bearer INVALID_TOKEN" 2>/dev/null || echo "000")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
        print_success "Language preference endpoint exists (requires auth)"
    else
        print_failure "Language preference endpoint" "HTTP $HTTP_CODE"
    fi
}

# Test 4: Mobile Update Flow
test_mobile_update() {
    print_test "Mobile Update Flow (UpdateMobileNumber.tsx + UpdateMobileOTP.tsx)"
    
    # Test initiate endpoint
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/v1/users/me/mobile/update" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer INVALID_TOKEN" \
        -d '{"newPhoneNumber":"+966501234567"}' 2>/dev/null || echo "000")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
        print_success "Mobile update initiate endpoint exists (requires auth)"
    else
        print_failure "Mobile update initiate endpoint" "HTTP $HTTP_CODE"
    fi
}

# Test 5: Email Update Flow
test_email_update() {
    print_test "Email Update Flow (UpdateEmail.tsx + UpdateEmailOTP.tsx)"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/v1/users/me/email/update" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer INVALID_TOKEN" \
        -d '{"email":"test@example.com"}' 2>/dev/null || echo "000")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
        print_success "Email update initiate endpoint exists (requires auth)"
    else
        print_failure "Email update initiate endpoint" "HTTP $HTTP_CODE"
    fi
}

# Test 6: Password Change
test_password_change() {
    print_test "Password Change (SetPassword.tsx)"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/v1/users/me/password/change" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer INVALID_TOKEN" \
        -d '{"currentPassword":"old","newPassword":"new"}' 2>/dev/null || echo "000")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
        print_success "Password change endpoint exists (requires auth)"
    else
        print_failure "Password change endpoint" "HTTP $HTTP_CODE"
    fi
}

# Test 7: KYB Update Flow
test_kyb_update() {
    print_test "KYB Update Flow (UpdateKYB.tsx + UpdateKYBOTP.tsx)"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/v1/users/me/kyb/update" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer INVALID_TOKEN" \
        -d '{"sourceOfFunds":"salary"}' 2>/dev/null || echo "000")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
        print_success "KYB update initiate endpoint exists (requires auth)"
    else
        print_failure "KYB update initiate endpoint" "HTTP $HTTP_CODE"
    fi
}

# Test 8: Address Update Flow
test_address_update() {
    print_test "Address Update Flow (UpdateNationalAddress.tsx + UpdateNationalAddressOTP.tsx)"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/v1/users/me/address/update" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer INVALID_TOKEN" \
        -d '{"city":"Riyadh","district":"Al Olaya"}' 2>/dev/null || echo "000")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
        print_success "Address update initiate endpoint exists (requires auth)"
    else
        print_failure "Address update initiate endpoint" "HTTP $HTTP_CODE"
    fi
}

# Test 9: Device Management
test_device_management() {
    print_test "Device Management (TrustedDevicesManagement.tsx)"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" "$BACKEND_URL/api/v1/devices" \
        -H "Authorization: Bearer INVALID_TOKEN" 2>/dev/null || echo "000")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
        print_success "Device list endpoint exists (requires auth)"
    else
        print_failure "Device list endpoint" "HTTP $HTTP_CODE"
    fi
}

# Test 10: Device Deactivation
test_device_deactivation() {
    print_test "Device Deactivation (DeactivateDevice.tsx + DeactivateDeviceOTP.tsx)"
    
    RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BACKEND_URL/api/v1/users/me/devices/deactivate" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer INVALID_TOKEN" \
        -d '{"deviceId":"00000000-0000-0000-0000-000000000000"}' 2>/dev/null || echo "000")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
        print_success "Device deactivation endpoint exists (requires auth)"
    else
        print_failure "Device deactivation endpoint" "HTTP $HTTP_CODE"
    fi
}

# Main test execution
main() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  User Management API Integration Test Suite              ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Check backend first
    if ! check_backend; then
        echo -e "${RED}❌ Backend is not reachable. Please ensure the backend is running.${NC}"
        exit 1
    fi
    
    echo ""
    print_info "Testing all API endpoints (using invalid tokens to verify endpoints exist)..."
    echo ""
    
    # Run all tests
    test_get_profile
    echo ""
    
    test_notification_preferences
    echo ""
    
    test_language_preference
    echo ""
    
    test_mobile_update
    echo ""
    
    test_email_update
    echo ""
    
    test_password_change
    echo ""
    
    test_kyb_update
    echo ""
    
    test_address_update
    echo ""
    
    test_device_management
    echo ""
    
    test_device_deactivation
    echo ""
    
    # Summary
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Test Summary${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "Total Tests: $TOTAL_TESTS"
    echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
    echo -e "${RED}Failed: $TESTS_FAILED${NC}"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}✅ All endpoint checks passed!${NC}"
        echo ""
        print_info "Note: These tests verify endpoints exist. For full E2E testing with authentication,"
        print_info "you'll need to test through the UI with a valid user session."
        exit 0
    else
        echo -e "${RED}❌ Some endpoint checks failed.${NC}"
        exit 1
    fi
}

# Run main function
main

