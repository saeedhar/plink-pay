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
   * Uses authenticated email update endpoint to send OTP to current user's phone
   * This is a workaround since there's no limits-specific OTP endpoint
   */
  static async requestOTP(request: LimitsOTPRequest): Promise<LimitsOTPResponse> {
    try {
      console.log('🔍 Requesting OTP for limits operation:', request.action);
      
      // Get current user to ensure we're authenticated and get their current email
      const { getCurrentUser } = await import('./realBackendAPI');
      const user = await getCurrentUser();
      
      if (!user.phoneE164) {
        throw new Error('Phone number not found in user profile. Please contact support.');
      }
      
      // Use email update endpoint as a workaround to send OTP to current user's phone
      // This is an authenticated endpoint that works for existing users
      // We'll use the current email (if exists) or a temp email to trigger OTP sending
      // The OTP will be sent to the user's current phone number
      const tempEmail = user.email ? `temp-${Date.now()}@${user.email.split('@')[1]}` : `limits-${Date.now()}@temp.com`;
      
      try {
        const data = await API.post('/api/v1/users/me/email/update', {
          email: tempEmail
      });
      
        console.log('✅ OTP requested successfully via email update endpoint:', data);
      return {
        success: data.success || true,
        message: data.message || 'OTP sent successfully',
          otpCode: data.otpCode,
          sessionId: data.sessionId // Return session ID for OTP verification
      };
      } catch (emailError: any) {
        // Check if OTP was sent despite the error (some validation errors still send OTP)
        if (emailError.response?.data?.otpCode) {
          console.log('✅ OTP received despite validation error:', emailError.response.data);
          return {
            success: true,
            message: 'OTP sent successfully',
            otpCode: emailError.response.data.otpCode
          };
        }
        
        // If it's a phone-related error, rethrow with clearer message
        if (emailError.message?.includes('phone') || emailError.message?.includes('Phone')) {
          throw new Error('Failed to send OTP to your phone. Please contact support.');
        }
        
        // For other errors, check if it's the "already exists" error from auth endpoint
        if (emailError.message?.includes('already registered') || 
            emailError.message?.includes('already exists')) {
          throw new Error('Unable to send OTP. Please ensure you are logged in correctly.');
        }
        
        throw new Error(emailError.message || 'Failed to request OTP. Please try again.');
      }
    } catch (error: any) {
      console.error('Error requesting limits OTP:', error);
      throw error;
    }
  }
}

export default LimitsService;
