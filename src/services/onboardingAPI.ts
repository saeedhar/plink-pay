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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
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

export async function sendOTP(phoneNumber: string): Promise<OTPSendResponse> {
  try {
    const response = await http<{ sessionId: string; expiresAt: number }>('/otp/send', {
      method: 'POST',
      body: JSON.stringify({ phone: phoneNumber })
    });
    
    return {
      requestId: response.sessionId,
      expiresAt: new Date(response.expiresAt).toISOString(),
      attemptsRemaining: 3
    };
  } catch (error: any) {
    if (error.message === '409') {
      throw new DuplicatePhoneError();
    }
    throw new APIError('Failed to send OTP', 'OTP_SEND_FAILED');
  }
}

export async function verifyOTP(
  requestId: string, 
  code: string
): Promise<OTPVerifyResponse> {
  try {
    const response = await http<{ ok: boolean }>('/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ code })
    });
    
    return {
      verified: response.ok,
      token: `token_${Date.now()}`
    };
  } catch (error: any) {
    if (error.message === '400') {
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulate some phone numbers being duplicates
    const duplicates = ['0501234567', '0509876543'];
    return {
      isDuplicate: duplicates.includes(phoneNumber.replace(/\s/g, ''))
    };
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
      const response = await http<{ valid: boolean; companyType: string; activityAllowed: boolean }>(`/wathiq/cr/verify?cr=${encodeURIComponent(crNumber)}`);
      
      if (!response.valid) {
        throw new CRVerificationError('CR Number not found in commercial registry');
      }
      
      return {
        valid: response.valid,
        companyName: 'Demo Company Ltd.',
        registrationDate: '2020-01-15',
        status: 'active' as const
      };
    } catch (error: any) {
      if (error.message === '400') {
        throw new CRVerificationError('CR Number not found in commercial registry');
      }
      throw new CRVerificationError('CR verification failed');
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
    const response = await http<{ valid: boolean }>(`/id/verify?id=${encodeURIComponent(cleanId)}`);
    
    if (!response.valid) {
      throw new IDVerificationError('ID Number not found in national database');
    }
    
    // Check phone-ID match via Tahaquq
    const tahaquqResponse = await http<{ match: boolean }>('/tahaquq/check', {
      method: 'POST',
      body: JSON.stringify({ phone: cleanPhone, id: cleanId })
    });
    
    if (!tahaquqResponse.match) {
      throw new IDMismatchError();
    }
    
    return {
      valid: response.valid,
      matchesPhone: tahaquqResponse.match,
      idType: cleanId.startsWith('1') ? 'saudi' : 'iqama',
      expiryDate: '2030-12-31'
    };
  } catch (error: any) {
    if (error instanceof IDMismatchError) {
      throw error;
    }
    if (error.message === '400') {
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

export async function initiateNafath(idNumber: string): Promise<NafathInitiateResponse> {
  const response = await http<{ requestId: string; deepLink: string; expiresAt: number }>('/nafath/initiate', {
    method: 'POST',
    body: JSON.stringify({ id: idNumber })
  });
  
  return {
    requestId: response.requestId,
    expiresAt: new Date(response.expiresAt).toISOString(),
    nafathUrl: response.deepLink
  };
}

export async function getNafathStatus(requestId: string): Promise<NafathStatusResponse> {
  const response = await http<{ status: NafathStatus; requestId: string }>(`/nafath/status?requestId=${encodeURIComponent(requestId)}`);
  
  return {
    status: response.status,
    requestId: response.requestId,
    completedAt: response.status === 'RECEIVED' ? new Date().toISOString() : undefined,
    failureReason: response.status === 'FAILED' || response.status === 'REJECTED' ? 'Request timeout or user declined' : undefined
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

export async function setPassword(password: string): Promise<{ success: boolean }> {
  const response = await http<{ ok: boolean }>('/password/set', {
    method: 'POST',
    body: JSON.stringify({ password })
  });
  
  return { success: response.ok };
}
