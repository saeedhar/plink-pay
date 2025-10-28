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

export interface UpdateTransactionLimitsRequest {
  transactionType: string;
  limit: number;
}

export interface LimitsOTPRequest {
  action: 'update_limits';
  dailyLimit?: number;
  monthlyLimit?: number;
  transactionType?: string;
  transactionLimit?: number;
}

export interface UpdateOverallLimitsRequest {
  dailyLimit: number;
  monthlyLimit: number;
}

export interface UpdateTransactionLimitsRequest {
  limitType: 'DAILY' | 'MONTHLY';
  transactionType: string;
  limitAmount: number;
}

export interface UpdateLimitsResult {
  success: boolean;
  message: string;
}

export interface LimitsOTPResponse {
  success: boolean;
  message: string;
  otpCode?: string; // OTP code for testing/display
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
   */
  static async getLimitsData(): Promise<LimitsResponse> {
    try {
      console.log('🔍 Fetching limits data from backend...');
      const data = await API.get('/api/v1/wallet/limits');
      console.log('✅ Limits data received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching limits data:', error);
      throw error;
    }
  }

  /**
   * Update overall limits
   */
  static async updateOverallLimits(request: UpdateOverallLimitsRequest): Promise<UpdateLimitsResult> {
    try {
      console.log('🔍 Updating overall limits:', request);
      const data = await API.put('/api/v1/limits/overall', request);
      console.log('✅ Overall limits updated:', data);
      return data;
    } catch (error) {
      console.error('Error updating overall limits:', error);
      throw error;
    }
  }

  /**
   * Update transaction-specific limits
   */
  static async updateTransactionLimits(request: UpdateTransactionLimitsRequest): Promise<UpdateLimitsResult> {
    try {
      console.log('🔍 Updating transaction limits:', request);
      const data = await API.put('/api/v1/limits/transaction', request);
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
   */
  static async requestOTP(request: LimitsOTPRequest): Promise<LimitsOTPResponse> {
    try {
      console.log('🔍 Requesting OTP for limits operation:', request.action);
      
      // Get user's phone number from localStorage
      const phoneNumber = localStorage.getItem('phoneNumber') || '+966501234567';
      
      // Use the existing auth OTP API
      const data = await API.post('/api/v1/auth/send-otp', {
        phoneNumber: phoneNumber,
        provider: 'freelancer' // Default provider for limits operations
      });
      
      console.log('✅ Limits OTP requested successfully:', data);
      return {
        success: data.success || true,
        message: data.message || 'OTP sent successfully',
        otpCode: data.otpCode
      };
    } catch (error) {
      console.error('Error requesting limits OTP:', error);
      throw error;
    }
  }
}

export default LimitsService;
