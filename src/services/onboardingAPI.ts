/**
 * Onboarding API service layer with typed responses
 * Implements BRD-specified endpoints with caching and error handling
 */

import { globalCache, verificationCache } from './cacheService';
import { globalScreeningService, complianceService } from './complianceService';

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
  // Check for duplicate phone first
  const duplicateCheck = await checkPhoneDuplicate(phoneNumber);
  if (duplicateCheck.isDuplicate) {
    throw new DuplicatePhoneError();
  }

  // For demo purposes, simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    requestId: `otp_${Date.now()}`,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes
    attemptsRemaining: 3
  };
}

export async function verifyOTP(
  requestId: string, 
  code: string
): Promise<OTPVerifyResponse> {
  // For demo purposes, simulate API call
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Accept any 4-digit code for demo
  if (code.length === 4 && /^\d+$/.test(code)) {
    return {
      verified: true,
      token: `token_${Date.now()}`
    };
  }
  
  throw new ValidationError('Invalid verification code');
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate some CR numbers failing verification
    const invalidCRs = ['1234567890', '0000000000'];
    
    if (invalidCRs.includes(crNumber.replace(/\D/g, ''))) {
      throw new CRVerificationError('CR Number not found in commercial registry');
    }
    
    return {
      valid: true,
      companyName: 'Demo Company Ltd.',
      registrationDate: '2020-01-15',
      status: 'active' as const
    };
  }, 10 * 60 * 1000);
}

// ==========================================
// ID VERIFICATION SERVICES  
// ==========================================

export async function verifyID(
  idNumber: string, 
  phoneNumber: string
): Promise<IDVerificationResponse> {
  // For demo purposes, simulate API call
  await new Promise(resolve => setTimeout(resolve, 2500));
  
  const cleanId = idNumber.replace(/\s/g, '');
  const cleanPhone = phoneNumber.replace(/\s/g, '');
  
  // Simulate ID verification failures
  const invalidIds = ['1234567890', '2000000000'];
  if (invalidIds.includes(cleanId)) {
    throw new IDVerificationError('ID Number not found in national database');
  }
  
  // Simulate phone mismatch
  const mismatchPairs = [
    { id: '1111111111', phone: '0501234567' },
    { id: '2222222222', phone: '0509876543' }
  ];
  
  const hasMismatch = mismatchPairs.some(
    pair => pair.id === cleanId && pair.phone !== cleanPhone
  );
  
  if (hasMismatch) {
    throw new IDMismatchError();
  }
  
  return {
    valid: true,
    matchesPhone: true,
    idType: cleanId.startsWith('1') ? 'saudi' : 'iqama',
    expiryDate: '2030-12-31'
  };
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate some IDs hitting local screening
    const hitIDs = ['9999999999', '8888888888'];
    const cleanId = idNumber.replace(/\D/g, '');
    
    if (hitIDs.includes(cleanId)) {
      return {
        status: 'HIT',
        riskScore: 85,
        reason: 'ID flagged in local screening database'
      };
    }
    
    return {
      status: 'CLEAR',
      riskScore: 10
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
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Simulate some combinations hitting global screening
    const hitCombinations = [
      { id: '9999999999', phone: '0501234567', cr: '1234567890' },
      { id: '8888888888', phone: '0509876543', cr: '0987654321' }
    ];
    
    const hasHit = hitCombinations.some(
      hit => hit.id === data.idNumber.replace(/\D/g, '') ||
             hit.phone === data.phoneNumber.replace(/\D/g, '') ||
             hit.cr === data.crNumber.replace(/\D/g, '')
    );
    
    if (hasHit) {
      return {
        status: 'HIT',
        riskScore: 75,
        reason: 'Information flagged in global screening database',
        requiresManualReview: true
      };
    }
    
    return {
      status: 'CLEAR',
      riskScore: 15,
      requiresManualReview: false
    };
  }, 60 * 60 * 1000); // 1 hour cache
}

// ==========================================
// NAFATH SERVICES
// ==========================================

export async function initiateNafath(idNumber: string): Promise<NafathInitiateResponse> {
  // For demo purposes, simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const requestId = `nafath_${Date.now()}`;
  
  return {
    requestId,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
    nafathUrl: `https://nafath.sa/verify?requestId=${requestId}`
  };
}

export async function getNafathStatus(requestId: string): Promise<NafathStatusResponse> {
  // For demo purposes, simulate API call and status progression
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate status progression based on time
  const created = parseInt(requestId.split('_')[1]);
  const elapsed = Date.now() - created;
  
  if (elapsed < 30000) { // First 30 seconds
    return { status: 'SENT', requestId };
  } else if (elapsed < 120000) { // Next 90 seconds
    return { status: 'UNDER_REVIEW', requestId };
  } else if (elapsed < 180000) { // Next 60 seconds
    return { status: 'RECEIVED', requestId, completedAt: new Date().toISOString() };
  } else {
    // Simulate occasional failures
    return { 
      status: 'FAILED', 
      requestId, 
      failureReason: 'Request timeout or user declined' 
    };
  }
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
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Enhanced risk rating with Mozon integration simulation
  let riskRating: 'low' | 'medium' | 'high' = 'low';
  
  // High risk activities
  const highRiskActivities = ['financial', 'crypto', 'money-exchange'];
  const highRiskPurposes = ['international-payments', 'other'];
  
  if (kybData.annualRevenue === 'above-10m') {
    riskRating = 'high';
  } else if (
    highRiskActivities.includes(kybData.businessActivity) ||
    kybData.purposeOfAccount.some(purpose => highRiskPurposes.includes(purpose))
  ) {
    riskRating = 'medium';
  }

  // Simulate Mozon risk assessment integration
  const mozonRiskScore = Math.random() * 100;
  if (mozonRiskScore > 80) {
    riskRating = 'high';
  } else if (mozonRiskScore > 50) {
    riskRating = 'medium';
  }
  
  return {
    riskRating,
    nextStep: riskRating === 'high' ? 'review' : 'approved',
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
  const decision = await complianceService.getComplianceDecision(submissionId);
  
  return {
    status: decision.status.toLowerCase() as any,
    riskScore: decision.riskScore,
    requiresManualReview: decision.requiresManualReview
  };
}

// ==========================================
// PASSWORD SERVICES
// ==========================================

export async function setPassword(password: string): Promise<{ success: boolean }> {
  // For demo purposes, simulate password setting
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return { success: true };
}
