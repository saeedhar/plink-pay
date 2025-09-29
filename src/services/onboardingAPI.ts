/**
 * Onboarding API service layer with typed responses
 * Implements BRD-specified endpoints with caching and error handling
 */

import { globalCache, verificationCache } from './cacheService';
import { globalScreeningService, complianceService } from './complianceService';
import { http } from './http';

// ==========================================
// TYPE DEFINITIONS
// ==========================================

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export interface OTPSendResponse {
  requestId: string;
  expiresAt: string;
  attemptsRemaining: number;
}

export interface OTPVerifyResponse {
  verified: boolean;
  token: string;
}

export interface CRVerificationResponse {
  valid: boolean;
  companyName?: string;
  registrationDate?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

export interface IDVerificationResponse {
  valid: boolean;
  matchesPhone: boolean;
  idType: 'saudi' | 'iqama';
  expiryDate?: string;
}

export interface NafathInitiateResponse {
  requestId: string;
  expiresAt: string;
  nafathUrl: string;
}

export type NafathStatus = 'SENT' | 'UNDER_REVIEW' | 'FAILED' | 'REJECTED' | 'RECEIVED';

export interface NafathStatusResponse {
  status: NafathStatus;
  requestId: string;
  completedAt?: string;
  failureReason?: string;
}

export interface KYBSubmitResponse {
  riskRating: 'low' | 'medium' | 'high';
  nextStep: 'approved' | 'review' | 'rejected';
  referenceId: string;
}

export interface ComplianceDecisionResponse {
  status: 'approved' | 'pending' | 'rejected';
  riskScore: number;
  requiresManualReview: boolean;
}

// ==========================================
// ERROR TYPES
// ==========================================

export class APIError extends Error {
  constructor(
    message: string,
    public code: string,
    public status?: number
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class ValidationError extends APIError {
  constructor(message: string, code: string = 'VALIDATION_ERROR') {
    super(message, code, 400);
    this.name = 'ValidationError';
  }
}

export class DuplicatePhoneError extends APIError {
  constructor() {
    super('This phone number is already registered', 'PHONE_DUPLICATE', 409);
    this.name = 'DuplicatePhoneError';
  }
}

export class CRVerificationError extends APIError {
  constructor(reason: string = 'CR verification failed') {
    super(reason, 'CR_VERIFICATION_FAILED', 422);
    this.name = 'CRVerificationError';
  }
}

export class IDMismatchError extends APIError {
  constructor() {
    super('Mobile number doesn\'t match ID', 'ID_PHONE_MISMATCH', 422);
    this.name = 'IDMismatchError';
  }
}

export class IDVerificationError extends APIError {
  constructor(reason: string = 'ID verification failed') {
    super(reason, 'ID_VERIFICATION_FAILED', 422);
    this.name = 'IDVerificationError';
  }
}

// ==========================================
// API CLIENT CONFIGURATION
// ==========================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8084/api/v1';
const API_TIMEOUT = 30000; // 30 seconds

async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      throw new APIError(
        data.error || 'Request failed',
        data.code || 'UNKNOWN_ERROR',
        response.status
      );
    }

    return { success: true, data };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof APIError) {
      throw error;
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new APIError('Request timeout', 'TIMEOUT');
    }
    
    throw new APIError('Network error', 'NETWORK_ERROR');
  }
}

// ==========================================
// OTP SERVICES
// ==========================================

export async function sendOTP(phoneNumber: string, businessType: 'freelancer' | 'b2b' = 'freelancer'): Promise<OTPSendResponse> {
  try {
    const response = await apiRequest<{ success: boolean; message: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ 
        phoneNumber: phoneNumber,
        businessType: businessType
      })
    });
    
    return {
      requestId: `otp_${Date.now()}`,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
      attemptsRemaining: businessType === 'freelancer' ? 3 : 5
    };
  } catch (error: any) {
    if (error.status === 409) {
      throw new DuplicatePhoneError();
    }
    throw new APIError('Failed to send OTP', 'OTP_SEND_FAILED');
  }
}

export async function verifyOTP(
  phoneNumber: string, 
  code: string
): Promise<OTPVerifyResponse> {
  try {
    // Clean phone number by removing spaces, same as in sendOTP
    const cleanPhone = phoneNumber.replace(/\s/g, '');
    
    const response = await apiRequest<{ 
      success: boolean; 
      userId: string; 
      nextStep: string; 
      hasPassword: boolean; 
      hasPasscode: boolean 
    }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ 
        phoneNumber: cleanPhone,
        otp: code
      })
    });
    
    return {
      verified: response.success,
      token: response.userId // Using userId as token for now
    };
  } catch (error: any) {
    if (error.status === 400) {
      throw new ValidationError('Invalid verification code');
    }
    throw new APIError('Failed to verify OTP', 'OTP_VERIFY_FAILED');
  }
}

// ==========================================
// PHONE SERVICES
// ==========================================

export async function checkPhoneDuplicate(phoneNumber: string): Promise<{ isDuplicate: boolean }> {
  const cacheKey = `phone_duplicate:${phoneNumber}`;
  
  // Check cache first (valid for 5 minutes)
  return await globalCache.getOrSet(cacheKey, async () => {
    try {
      const response = await apiRequest<{ 
        phoneE164: string; 
        unique: boolean; 
        message: string 
      }>('/auth/phone-uniqueness', {
        method: 'POST',
        body: JSON.stringify({ phoneE164: phoneNumber })
      });
      
      return {
        isDuplicate: !response.unique
      };
    } catch (error: any) {
      // If API fails, assume it's available (fallback)
      console.warn('Phone uniqueness check failed, assuming available:', error);
      return { isDuplicate: false };
    }
  }, 5 * 60 * 1000);
}

// ==========================================
// CR VERIFICATION SERVICES
// ==========================================

export async function verifyCR(crNumber: string): Promise<CRVerificationResponse> {
  const cacheKey = `cr_verification:${crNumber}`;
  
  // Check cache first (valid for 10 minutes)
  return await verificationCache.getOrSet(cacheKey, async () => {
    try {
      console.log('🔍 Verifying CR:', crNumber);
      const response = await apiRequest<{ 
        valid: boolean; 
        companyName?: string; 
        companyNameArabic?: string; 
        issueDate?: string; 
        expiryDate?: string; 
        status?: string; 
        error?: string 
      }>('/verification/validate-cr', {
        method: 'POST',
        body: JSON.stringify({ crNumber })
      });
      
      console.log('📋 CR Response:', response);
      
      // apiRequest returns { success: true, data: ... }, so we need to access response.data
      const data = response.data;
      
      if (!data.valid) {
        console.log('❌ CR Invalid:', data.error);
        throw new CRVerificationError(data.error || 'CR Number not found in commercial registry');
      }
      
      console.log('✅ CR Valid:', data.companyName);
      return {
        valid: data.valid,
        companyName: data.companyName || 'Company Name',
        registrationDate: data.issueDate || data.expiryDate || '2020-01-15',
        status: (data.status as 'active' | 'inactive' | 'suspended') || 'active'
      };
    } catch (error: any) {
      console.log('🚨 CR Verification Error:', error);
      if (error.status === 400) {
        throw new CRVerificationError('CR Number not found in commercial registry');
      }
      throw new CRVerificationError(`CR verification failed: ${error.message || error}`);
    }
  }, 10 * 60 * 1000);
}

// ==========================================
// ID VERIFICATION SERVICES  
// ==========================================

export async function verifyID(
  idNumber: string, 
  phoneNumber: string
): Promise<IDVerificationResponse> {
  const cleanId = idNumber.replace(/\s/g, '');
  const cleanPhone = phoneNumber.replace(/\s/g, '');
  
  try {
    const response = await apiRequest<{ 
      valid: boolean; 
      match?: boolean; 
      confidence?: number; 
      riskScore?: number; 
      decision?: string; 
      error?: string 
    }>('/verification/validate-id', {
      method: 'POST',
      body: JSON.stringify({ 
        nationalId: cleanId,
        phoneE164: cleanPhone
      })
    });
    
    // apiRequest returns { success: true, data: ... }, so we need to access response.data
    const data = response.data;
    
    if (!data.valid) {
      throw new IDVerificationError(data.error || 'ID Number not found in national database');
    }
    
    if (data.match === false) {
      throw new IDMismatchError();
    }
    
    return {
      valid: data.valid,
      matchesPhone: data.match || false,
      idType: cleanId.startsWith('1') ? 'saudi' : 'iqama',
      expiryDate: '2030-12-31'
    };
  } catch (error: any) {
    if (error instanceof IDMismatchError) {
      throw error;
    }
    if (error.status === 400) {
      throw new IDVerificationError('ID Number not found in national database');
    }
    throw new IDVerificationError('ID verification failed');
  }
}

// ==========================================
// LOCAL SCREENING SERVICES
// ==========================================

export interface LocalScreeningResponse {
  status: 'CLEAR' | 'HIT';
  riskScore?: number;
  reason?: string;
}

export async function localScreen(idNumber: string): Promise<LocalScreeningResponse> {
  const cacheKey = `local_screening:${idNumber}`;
  
  return await verificationCache.getOrSet(cacheKey, async () => {
    const response = await http<{ status: 'CLEAR' | 'HIT' }>('/stitch/local-screen');
    
    return {
      status: response.status,
      riskScore: response.status === 'HIT' ? 85 : 10,
      reason: response.status === 'HIT' ? 'ID flagged in local screening database' : undefined
    };
  }, 30 * 60 * 1000); // 30 minutes cache
}

// ==========================================
// TAHAQUQ SERVICES (Phone-ID Match)
// ==========================================

export interface TahaquqResponse {
  match: boolean;
  confidence?: number;
  source?: string;
}

export async function tahaquq(phoneNumber: string, idNumber: string): Promise<TahaquqResponse> {
  const cacheKey = `tahaquq:${phoneNumber}:${idNumber}`;
  
  return await verificationCache.getOrSet(cacheKey, async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate some phone-ID pairs not matching
    const mismatchPairs = [
      { phone: '0501234567', id: '1111111111' },
      { phone: '0509876543', id: '2222222222' }
    ];
    
    const hasMismatch = mismatchPairs.some(
      pair => pair.phone === phoneNumber && pair.id !== idNumber.replace(/\D/g, '')
    );
    
    if (hasMismatch) {
      return {
        match: false,
        confidence: 95,
        source: 'National telecom registry'
      };
    }
    
    return {
      match: true,
      confidence: 98,
      source: 'National telecom registry'
    };
  }, 60 * 60 * 1000); // 1 hour cache
}

// ==========================================
// GLOBAL SCREENING SERVICES
// ==========================================

export interface GlobalScreeningRequest {
  idNumber: string;
  phoneNumber: string;
  crNumber: string;
  businessType: string;
}

export interface GlobalScreeningResponse {
  status: 'CLEAR' | 'HIT';
  riskScore?: number;
  reason?: string;
  requiresManualReview?: boolean;
}

export async function globalScreening(data: GlobalScreeningRequest): Promise<GlobalScreeningResponse> {
  const cacheKey = `global_screening:${data.idNumber}:${data.phoneNumber}:${data.crNumber}`;
  
  return await verificationCache.getOrSet(cacheKey, async () => {
    const response = await http<{ status: 'CLEAR' | 'HIT' }>('/screening/global', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    
    return {
      status: response.status,
      riskScore: response.status === 'HIT' ? 75 : 15,
      reason: response.status === 'HIT' ? 'Information flagged in global screening database' : undefined,
      requiresManualReview: response.status === 'HIT'
    };
  }, 60 * 60 * 1000); // 1 hour cache
}

// ==========================================
// NAFATH SERVICES
// ==========================================

export async function initiateNafath(idNumber: string, phoneNumber: string): Promise<NafathInitiateResponse> {
  console.log('🚀 Initiating Nafath for ID:', idNumber, 'Phone:', phoneNumber);
  
  const response = await apiRequest<{ 
    sessionId: string; 
    status: string; 
    message: string; 
    redirectUrl?: string 
  }>('/nafath/initiate', {
    method: 'POST',
    body: JSON.stringify({ 
      nationalId: idNumber,
      phoneE164: phoneNumber
    })
  });
  
  console.log('📋 Nafath Initiate Response:', response);
  
  // apiRequest returns { success: true, data: ... }, so we need to access response.data
  const data = response.data;
  
  console.log('✅ Nafath Session ID:', data.sessionId);
  
  return {
    requestId: data.sessionId,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
    nafathUrl: data.redirectUrl || '#'
  };
}

export async function getNafathStatus(requestId: string): Promise<NafathStatusResponse> {
  console.log('🔍 Checking Nafath status for session:', requestId);
  
  const response = await apiRequest<{ 
    sessionId: string; 
    status: string; 
    nationalId?: string; 
    fullName?: string; 
    dateOfBirth?: string; 
    message?: string 
  }>(`/nafath/status/${requestId}`);
  
  console.log('📋 Nafath Status Response:', response);
  
  // apiRequest returns { success: true, data: ... }, so we need to access response.data
  const data = response.data;
  
  console.log('✅ Nafath Status:', data.status);
  
  // Map backend status to frontend expected status
  let mappedStatus: NafathStatus;
  if (data.status === 'approved') {
    mappedStatus = 'RECEIVED';
  } else if (data.status === 'pending') {
    mappedStatus = 'UNDER_REVIEW';
  } else if (data.status === 'rejected') {
    mappedStatus = 'REJECTED';
  } else if (data.status === 'expired') {
    mappedStatus = 'FAILED';
  } else {
    mappedStatus = data.status as NafathStatus;
  }
  
  return {
    status: mappedStatus,
    requestId: data.sessionId,
    completedAt: data.status === 'approved' ? new Date().toISOString() : undefined,
    failureReason: data.status === 'rejected' || data.status === 'expired' ? 
      (data.message || 'Request timeout or user declined') : undefined
  };
}

// ==========================================
// KYB SERVICES
// ==========================================

export async function submitKYB(kybData: {
  annualRevenue: string;
  businessActivity: string;
  purposeOfAccount: string[];
  purposeOther?: string;
  expectedVolume?: {
    payroll?: string;
    domestic?: string;
    international?: string;
    deposits?: string;
  };
}): Promise<KYBSubmitResponse> {
  const response = await http<{ riskRating: 'LOW' | 'MEDIUM' | 'HIGH'; nextStep: string }>('/kyb/submit', {
    method: 'POST',
    body: JSON.stringify(kybData)
  });
  
  return {
    riskRating: response.riskRating.toLowerCase() as 'low' | 'medium' | 'high',
    nextStep: response.nextStep as 'approved' | 'review' | 'rejected',
    referenceId: `kyb_${Date.now()}`
  };
}

// ==========================================
// PROFILE CREATION
// ==========================================

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

export async function createProfile(request: CreateProfileRequest): Promise<CreateProfileResponse> {
  console.log('🏗️ Creating profile with data:', request);
  
  try {
    const response = await apiRequest<{
      profileId: string;
      status: string;
      nextStep: string;
      message: string;
    }>('/onboarding/create-profile', {
      method: 'POST',
      body: JSON.stringify(request)
    });
    
    console.log('✅ Profile creation response:', response);
    
    // apiRequest returns { success: true, data: ... }, so we need to access response.data
    const data = response.data;
    
    return {
      profileId: data.profileId,
      status: data.status,
      nextStep: data.nextStep,
      message: data.message
    };
  } catch (error: any) {
    console.error('❌ Profile creation failed:', error);
    
    // If it's a 403 or network error, provide a more helpful message
    if (error.status === 403) {
      throw new Error('Profile creation is currently unavailable. Please try again later or contact support.');
    } else if (error.message?.includes('fetch')) {
      throw new Error('Unable to connect to the server. Please check your internet connection and try again.');
    }
    
    throw error;
  }
}

// ==========================================
// SCREENING & COMPLIANCE
// ==========================================

export async function performGlobalScreening(data: {
  firstName: string;
  lastName: string;
  idNumber: string;
  phoneNumber: string;
  dateOfBirth?: string;
  nationality?: string;
}): Promise<{ isClean: boolean; riskScore: number; riskLevel: string }> {
  const result = await globalScreeningService.performScreening({
    firstName: data.firstName,
    lastName: data.lastName,
    idNumber: data.idNumber,
    phoneNumber: data.phoneNumber,
    dateOfBirth: data.dateOfBirth,
    nationality: data.nationality
  });
  
  return {
    isClean: result.isClean,
    riskScore: result.riskScore,
    riskLevel: result.riskLevel
  };
}

export async function submitCompliance(data: {
  customerData: any;
  screeningResult: any;
  kybData: any;
  documents?: any[];
}): Promise<{ submissionId: string }> {
  const submission = {
    customerData: data.customerData,
    screeningResult: data.screeningResult,
    kybData: data.kybData,
    documents: data.documents || [],
    riskAssessment: await complianceService.performRiskAssessment(
      data.customerData,
      data.screeningResult,
      data.kybData
    ),
    submittedAt: new Date().toISOString(),
    submittedBy: 'ONBOARDING_SYSTEM'
  };
  
  return await complianceService.submitCompliance(submission);
}

export async function getComplianceDecision(
  submissionId: string
): Promise<ComplianceDecisionResponse> {
  const response = await http<{ status: 'APPROVED' | 'PENDING' | 'REJECTED' }>('/compliance/decision');
  
  return {
    status: response.status.toLowerCase() as 'approved' | 'pending' | 'rejected',
    riskScore: 50, // Mock value
    requiresManualReview: response.status === 'PENDING'
  };
}

// ==========================================
// PASSWORD SERVICES
// ==========================================

export async function setPassword(userId: string, password: string): Promise<{ success: boolean }> {
  const response = await apiRequest<{ success: boolean; message: string }>('/auth/set-password', {
    method: 'POST',
    body: JSON.stringify({ 
      userId: userId,
      password: password
    })
  });
  
  // apiRequest returns { success: true, data: ... }, so we need to access response.data
  const data = response.data;
  
  return { success: data.success };
}
