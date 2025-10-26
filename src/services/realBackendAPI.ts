// Real Backend API Integration for Plink
// This replaces the mock services with actual backend API calls

import { apiUrl } from '../lib/api';

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
  const response = await fetch(apiUrl('/api/v1/auth/send-otp'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to send OTP: ${response.status}`);
  }

  return await response.json();
}

export async function verifyOtp(request: VerifyOtpRequest): Promise<VerifyOtpResponse> {
  const response = await fetch(apiUrl('/api/v1/auth/verify-otp'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to verify OTP: ${response.status}`);
  }

  return await response.json();
}

export async function setPassword(request: SetPasswordRequest): Promise<SetPasswordResponse> {
  const response = await fetch(apiUrl('/api/v1/auth/set-password'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to set password: ${response.status}`);
  }

  return await response.json();
}

export async function setPasscode(request: SetPasscodeRequest): Promise<SetPasscodeResponse> {
  const response = await fetch(apiUrl('/api/v1/auth/set-passcode'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to set passcode: ${response.status}`);
  }

  return await response.json();
}

export async function loginWithPassword(request: LoginPasswordRequest): Promise<LoginResponse> {
  const response = await fetch(apiUrl('/api/v1/auth/login/password'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to login: ${response.status}`);
  }

  return await response.json();
}

export async function verifyLoginOtp(request: VerifyLoginOtpRequest): Promise<LoginResponse> {
  const response = await fetch(apiUrl('/api/v1/auth/login/verify-otp'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to verify login OTP: ${response.status}`);
  }

  return await response.json();
}

export async function checkPhoneUniqueness(request: PhoneUniquenessRequest): Promise<PhoneUniquenessResponse> {
  const response = await fetch(apiUrl('/api/v1/auth/check-phone-uniqueness'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to check phone uniqueness: ${response.status}`);
  }

  return await response.json();
}

export async function forgotPassword(request: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
  const response = await fetch(apiUrl('/api/v1/auth/forgot-password'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to request password reset: ${response.status}`);
  }

  return await response.json();
}

export async function resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
  const response = await fetch(apiUrl('/api/v1/auth/reset-password'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to reset password: ${response.status}`);
  }

  return await response.json();
}

// ==========================================
// VERIFICATION APIs
// ==========================================

export async function validateCrNumber(request: ValidateCrRequest): Promise<ValidateCrResponse> {
  const response = await fetch(apiUrl('/api/v1/verification/validate-cr'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to validate CR number: ${response.status}`);
  }

  return await response.json();
}

export async function validateFreelancerLicense(request: ValidateFreelancerRequest): Promise<ValidateFreelancerResponse> {
  const response = await fetch(apiUrl('/api/v1/verification/validate-freelancer-license'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to validate freelancer license: ${response.status}`);
  }

  return await response.json();
}

export async function validateIdNumber(request: ValidateIdRequest): Promise<ValidateIdResponse> {
  const response = await fetch(apiUrl('/api/v1/verification/validate-id'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to validate ID number: ${response.status}`);
  }

  return await response.json();
}

// ==========================================
// NAFATH APIs
// ==========================================

export async function initiateNafath(request: NafathInitiateRequest): Promise<NafathInitiateResponse> {
  const response = await fetch(apiUrl('/api/v1/nafath/initiate'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to initiate Nafath: ${response.status}`);
  }

  return await response.json();
}

export async function getNafathStatus(sessionId: string): Promise<NafathStatusResponse> {
  const response = await fetch(apiUrl(`/api/v1/nafath/status/${sessionId}`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get Nafath status: ${response.status}`);
  }

  return await response.json();
}

// ==========================================
// ONBOARDING APIs
// ==========================================

export async function createProfile(request: CreateProfileRequest): Promise<CreateProfileResponse> {
  const response = await fetch(apiUrl('/api/v1/onboarding/profile'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to create profile: ${response.status}`);
  }

  return await response.json();
}


// ==========================================
// KYB APIs
// ==========================================

export async function getKybOptions(category: string, locale: string = 'en'): Promise<KybOptionsResponse> {
  const response = await fetch(apiUrl(`/api/v1/kyb/options?category=${category}&locale=${locale}`), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get KYB options: ${response.status}`);
  }

  return await response.json();
}
