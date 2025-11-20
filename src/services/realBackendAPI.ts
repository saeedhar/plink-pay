// Real Backend API Integration for Plink
// This replaces the mock services with actual backend API calls

import { apiUrl, API } from '../lib/api';

// ==========================================
// TYPE DEFINITIONS (Matching Backend)
// ==========================================

export interface SendOtpRequest {
  phoneNumber: string;
  businessType: 'freelancer' | 'b2b';
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  otpCode?: string; // OTP code for testing/display
}

export interface VerifyOtpRequest {
  phoneNumber: string;
  otp: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  userId: string;
  nextStep: 'login' | 'set_credentials';
  hasPassword: boolean;
  hasPasscode: boolean;
}

export interface SetPasswordRequest {
  userId: string;
  password: string;
}

export interface SetPasswordResponse {
  success: boolean;
  message: string;
}

export interface SetPasscodeRequest {
  userId: string;
  passcode: string;
}

export interface SetPasscodeResponse {
  success: boolean;
  message: string;
}

export interface LoginPasswordRequest {
  emailOrPhone: string;
  password: string;
  device?: {
    platform: string;
    userAgent: string;
    screenResolution?: string;
    timezone?: string;
  };
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userId: string;
  needsOtp?: boolean;
  needsCallback?: boolean;
  callbackId?: string;
  deviceId?: string;
  message?: string;
  otpCode?: string; // OTP code for testing/display
}

export interface VerifyLoginOtpRequest {
  userId: string;
  otp: string;
  device?: {
    platform: string;
    userAgent: string;
    screenResolution?: string;
    timezone?: string;
  };
}

export interface PhoneUniquenessRequest {
  phoneE164: string;
}

export interface PhoneUniquenessResponse {
  phoneE164: string;
  unique: boolean;
  message: string;
}

export interface ValidateCrRequest {
  crNumber: string;
}

export interface ValidateCrResponse {
  valid: boolean;
  companyName?: string;
  companyNameArabic?: string;
  expiry?: string;
  status?: string;
  error?: string;
}

export interface ValidateFreelancerRequest {
  licenseNumber: string;
  nationalId?: string;
}

export interface ValidateFreelancerResponse {
  valid: boolean;
  freelancerName?: string;
  profession?: string;
  expiry?: string;
  error?: string;
}

export interface ValidateIdRequest {
  nationalId: string;
  phoneE164?: string;
}

export interface ValidateIdResponse {
  valid: boolean;
  match?: boolean;
  confidence?: number;
  riskScore?: number;
  decision?: string;
  error?: string;
}

export interface NafathInitiateRequest {
  nationalId: string;
  phoneE164: string;
}

export interface NafathInitiateResponse {
  sessionId: string;
  status: 'pending' | 'initiated' | 'failed';
  message: string;
  redirectUrl?: string;
}

export interface NafathStatusResponse {
  sessionId: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  nationalId?: string;
  fullName?: string;
  dateOfBirth?: string;
  message?: string;
}

export interface CreateProfileRequest {
  userId: string;
  businessType: 'COMPANY' | 'FREELANCER';
  businessName?: string;
  businessNameArabic?: string;
  crNumber?: string;
  freelancerLicense?: string;
  nationalId?: string;
  phoneE164: string;
  annualRevenue?: string;
  businessActivity?: string;
  accountPurpose?: string;
}

export interface CreateProfileResponse {
  profileId: string;
  status: string;
  nextStep: string;
  message: string;
}

export interface KybOption {
  id: string;
  label: string;
  code?: string;
  order: number;
}

export interface KybOptionsResponse {
  items: KybOption[];
}

export interface MeResponse {
  id: string;
  email?: string;
  phoneE164?: string;
  name?: string;
}

export interface ForgotPasswordRequest {
  // For ID/BOD flow
  idUnn?: string;
  dateOfBirth?: string;
  
  // For Phone flow  
  phoneNumber?: string; // Must be in E164 format (+966...)
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  resetToken: string;
  otpCode?: string; // OTP code for testing/display
}

export interface VerifyOtpRequest {
  resetToken: string;
  otp: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  otp: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

// ==========================================
// AUTHENTICATION APIs
// ==========================================

export async function sendOtp(request: SendOtpRequest): Promise<SendOtpResponse> {
  return API.post('/api/v1/auth/send-otp', request);
}

export async function verifyOtp(request: VerifyOtpRequest): Promise<VerifyOtpResponse> {
  return API.post('/api/v1/auth/verify-otp', request);
}

export async function setPassword(request: SetPasswordRequest): Promise<SetPasswordResponse> {
  return API.post('/api/v1/auth/set-password', request);
}

export async function setPasscode(request: SetPasscodeRequest): Promise<SetPasscodeResponse> {
  return API.post('/api/v1/auth/set-passcode', request);
}

export async function loginWithPassword(request: LoginPasswordRequest): Promise<LoginResponse> {
  return API.post('/api/v1/auth/login/password', request);
}

export async function verifyLoginOtp(request: VerifyLoginOtpRequest): Promise<LoginResponse> {
  return API.post('/api/v1/auth/login/verify-otp', request);
}

export interface CallbackStatusResponse {
  status: 'pending' | 'completed' | 'failed' | 'expired';
  message: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
}

export interface CallbackCompleteResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userId?: string;
}

/**
 * Check callback verification status
 */
export async function checkCallbackStatus(callbackId: string): Promise<CallbackStatusResponse> {
  return API.get(`/api/v1/auth/callback-status/${callbackId}`);
}

/**
 * Complete callback verification (for testing/development)
 */
export async function completeCallback(callbackId: string): Promise<CallbackCompleteResponse> {
  // Create device info object like mobile app does
  const deviceInfo = {
    platform: 'web',
    userAgent: navigator.userAgent,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    ipAddress: undefined // Not available in browser
  };

  console.log('📡 Calling callback complete endpoint:', `/api/v1/auth/callback-complete/${callbackId}`);
  console.log('📦 Request payload:', JSON.stringify(deviceInfo, null, 2));

  const result = await API.post(`/api/v1/auth/callback-complete/${callbackId}`, deviceInfo);
  console.log('📦 Response data:', JSON.stringify(result, null, 2));
  return result;
}

export async function checkPhoneUniqueness(request: PhoneUniquenessRequest): Promise<PhoneUniquenessResponse> {
  return API.post('/api/v1/auth/check-phone-uniqueness', request);
}

export async function forgotPassword(request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
  return API.post('/api/v1/auth/forgot-password', request);
}

export async function resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  return API.post('/api/v1/auth/reset-password', request);
}

// ==========================================
// VERIFICATION APIs
// ==========================================

export async function validateCrNumber(request: ValidateCrRequest): Promise<ValidateCrResponse> {
  return API.post('/api/v1/verification/validate-cr', request);
}

export async function validateFreelancerLicense(request: ValidateFreelancerRequest): Promise<ValidateFreelancerResponse> {
  return API.post('/api/v1/verification/validate-freelancer-license', request);
}

export async function validateIdNumber(request: ValidateIdRequest): Promise<ValidateIdResponse> {
  return API.post('/api/v1/verification/validate-id', request);
}

// ==========================================
// NAFATH APIs
// ==========================================

export async function initiateNafath(request: NafathInitiateRequest): Promise<NafathInitiateResponse> {
  return API.post('/api/v1/nafath/initiate', request);
}

export async function getNafathStatus(sessionId: string): Promise<NafathStatusResponse> {
  return API.get(`/api/v1/nafath/status/${sessionId}`);
}

// ==========================================
// ONBOARDING APIs
// ==========================================

export async function createProfile(request: CreateProfileRequest): Promise<CreateProfileResponse> {
  return API.post('/api/v1/onboarding/profile', request);
}


// ==========================================
// KYB APIs
// ==========================================

export async function getKybOptions(category: string, locale: string = 'en'): Promise<KybOptionsResponse> {
  return API.get(`/api/v1/kyb/options?category=${category}&locale=${locale}`);
}

// ==========================================
// PROFILE APIs
// ==========================================

export async function getCurrentUser(): Promise<MeResponse> {
  return API.get('/api/v1/auth/me');
}

/**
 * Logout - Clear session and revoke tokens on backend
 */
export async function logout(): Promise<void> {
  try {
    // Call logout API to invalidate session on backend
    await API.post('/api/v1/auth/logout', {});
    console.log('✅ Logout API called successfully');
  } catch (error: any) {
    // Even if API call fails, we still want to clear local storage
    console.warn('⚠️ Logout API call failed, but clearing local storage anyway:', error.response?.data || error.message);
  } finally {
    // Always clear local storage regardless of API call result
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('callbackId');
    localStorage.removeItem('deviceId');
    console.log('✅ Local storage cleared');
  }
}
