import { API } from '../lib/api';

// Types for limits data
export interface CurrentLimits {
  dailyLimit: number;
  monthlyLimit: number;
  transactionLimit: number;
  currency: string;
  remainingDaily: number;
  remainingMonthly: number;
}

export interface LimitItem {
  id: string;
  limitType: 'DAILY' | 'MONTHLY';
  transactionType: string | null;
  limitAmount: number;
  currentUsage: number;
  resetDate: string;
  createdAt: string;
  updatedAt: string;
  overallLimit: boolean;
  transactionSpecificLimit: boolean;
  remainingLimit: number;
  limitExceeded: boolean;
}

export interface LimitsResponse {
  walletId: string;
  limits: LimitItem[];
}

export interface OverallLimits {
  maxDailyLimit: number;
  maxMonthlyLimit: number;
  maxTransactionLimit: number;
  currency: string;
}

export interface TransactionLimits {
  transactionType: string;
  limit: number;
  currency: string;
  isActive: boolean;
}

export interface TransactionType {
  id: string;
  name: string;
  code: string;
  limit: number;
  currency: string;
  isActive: boolean;
}

export interface UpdateLimitsRequest {
  dailyLimit?: number;
  monthlyLimit?: number;
  transactionLimit?: number;
}

export interface LimitsOTPRequest {
  action: 'update_limits';
  dailyLimit?: number;
  monthlyLimit?: number;
  transactionType?: string;
  transactionLimit?: number;
}

export interface UpdateOverallLimitsRequest {
  dailyLimit?: number;
  monthlyLimit?: number;
  otp: string; // OTP for web, passcode for mobile
}

export interface UpdateTransactionLimitsRequest {
  limitType: 'DAILY' | 'MONTHLY';
  transactionType: string;
  limitAmount: number;
  otp: string; // OTP for web, passcode for mobile
}

export interface UpdateLimitsResult {
  success: boolean;
  message: string;
}

export interface LimitsOTPResponse {
  success: boolean;
  message: string;
  otpCode?: string; // OTP code for testing/display
  sessionId?: string; // Session ID for OTP verification
}

/**
 * Limits Service - Handles all limits-related API calls
 */
export class LimitsService {
  /**
   * Get current limits
   */
  static async getCurrentLimits(): Promise<CurrentLimits> {
    try {
      const data = await API.get('/api/v1/limits/current');
      return {
        dailyLimit: data.dailyLimit || 0,
        monthlyLimit: data.monthlyLimit || 0,
        transactionLimit: data.transactionLimit || 0,
        currency: data.currency || 'SAR',
        remainingDaily: data.remainingDaily || 0,
        remainingMonthly: data.remainingMonthly || 0
      };
    } catch (error) {
      console.error('Error fetching current limits:', error);
      throw error;
    }
  }

  /**
   * Get raw limits data from backend
   * @param subWalletId Optional sub-wallet ID. If provided, returns limits for that sub-wallet (inherits from main wallet)
   */
  static async getLimitsData(subWalletId?: string): Promise<LimitsResponse> {
    try {
      console.log('🔍 Fetching limits data from backend...', subWalletId ? `(sub-wallet: ${subWalletId})` : '(main wallet)');
      const url = subWalletId 
        ? `/api/v1/wallet/limits?subWalletId=${subWalletId}`
        : '/api/v1/wallet/limits';
      const data = await API.get(url);
      console.log('✅ Limits data received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching limits data:', error);
      throw error;
    }
  }

  /**
   * Update overall limits
   * @param request Update request
   * @param subWalletId Optional sub-wallet ID. If provided, updates limits for that sub-wallet (inherits from main wallet)
   */
  static async updateOverallLimits(request: UpdateOverallLimitsRequest, subWalletId?: string): Promise<UpdateLimitsResult> {
    try {
      console.log('🔍 Updating overall limits:', request, subWalletId ? `(sub-wallet: ${subWalletId})` : '(main wallet)');
      const url = subWalletId 
        ? `/api/v1/limits/overall?subWalletId=${subWalletId}`
        : '/api/v1/limits/overall';
      
      // Remove undefined/null fields to avoid sending null values
      // But ensure at least one field is present
      const cleanRequest: any = {
        otp: request.otp // Always include OTP
      };
      if (request.dailyLimit !== undefined && request.dailyLimit !== null && !isNaN(request.dailyLimit)) {
        cleanRequest.dailyLimit = request.dailyLimit;
      }
      if (request.monthlyLimit !== undefined && request.monthlyLimit !== null && !isNaN(request.monthlyLimit)) {
        cleanRequest.monthlyLimit = request.monthlyLimit;
      }
      
      // Validate that at least one limit is provided
      if (Object.keys(cleanRequest).length === 1) { // Only OTP, no limits
        throw new Error('At least one of dailyLimit or monthlyLimit must be provided');
      }
      
      console.log('📤 Sending overall limits request:', cleanRequest);
      const data = await API.put(url, cleanRequest);
      console.log('✅ Overall limits updated:', data);
      return data;
    } catch (error) {
      console.error('Error updating overall limits:', error);
      throw error;
    }
  }

  /**
   * Update transaction-specific limits
   * @param request Update request
   * @param subWalletId Optional sub-wallet ID. If provided, updates limits for that sub-wallet (inherits from main wallet)
   */
  static async updateTransactionLimits(request: UpdateTransactionLimitsRequest, subWalletId?: string): Promise<UpdateLimitsResult> {
    try {
      console.log('🔍 Updating transaction limits:', request, subWalletId ? `(sub-wallet: ${subWalletId})` : '(main wallet)');
      const url = subWalletId 
        ? `/api/v1/limits/transaction?subWalletId=${subWalletId}`
        : '/api/v1/limits/transaction';
      // Request already includes OTP from frontend
      const data = await API.put(url, request);
      console.log('✅ Transaction limits updated:', data);
      return data;
    } catch (error) {
      console.error('Error updating transaction limits:', error);
      throw error;
    }
  }

  /**
   * Get overall limits (maximum allowed limits)
   */
  static async getOverallLimits(): Promise<OverallLimits> {
    try {
      const data = await API.get('/api/v1/limits/overall');
      return {
        maxDailyLimit: data.maxDailyLimit || 0,
        maxMonthlyLimit: data.maxMonthlyLimit || 0,
        maxTransactionLimit: data.maxTransactionLimit || 0,
        currency: data.currency || 'SAR'
      };
    } catch (error) {
      console.error('Error fetching overall limits:', error);
      throw error;
    }
  }

  /**
   * Get transaction limits
   */
  static async getTransactionLimits(): Promise<TransactionLimits[]> {
    try {
      const data = await API.get('/api/v1/limits/transaction');
      return data.items || data || [];
    } catch (error) {
      console.error('Error fetching transaction limits:', error);
      throw error;
    }
  }

  /**
   * Get available transaction types for limits
   */
  static async getTransactionTypes(): Promise<TransactionType[]> {
    try {
      const data = await API.get('/api/v1/limits/transaction-types');
      return data.items || data || [];
    } catch (error) {
      console.error('Error fetching transaction types:', error);
      throw error;
    }
  }



  /**
   * Request OTP for limits operations
   * Uses dedicated wallet OTP endpoint
   */
  static async requestOTP(request: LimitsOTPRequest): Promise<LimitsOTPResponse> {
    try {
      console.log('🔍 Requesting OTP for limits operation:', request.action);
      
      // Use dedicated wallet OTP endpoint with limits business type
      const data = await API.post('/api/v1/wallet/otp/send', {
        businessType: 'limits_update'
      });
      
      console.log('✅ OTP requested successfully via wallet OTP endpoint:', data);
      return {
        success: data.success || true,
        message: data.message || 'OTP sent successfully',
        otpCode: data.otpCode,
        sessionId: undefined // Wallet OTP doesn't use session ID - OTP is verified directly
      };
    } catch (error: any) {
      console.error('Error requesting limits OTP:', error);
      throw error;
    }
  }
}

export default LimitsService;
