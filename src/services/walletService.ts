import { API } from '../lib/api';

// Types for wallet data
export interface WalletBalance {
  balance: number;
  currency: string;
  formattedBalance: string;
}

export interface WalletStatus {
  isActive: boolean;
  status: 'active' | 'inactive' | 'suspended';
  activatedAt?: string;
  deactivatedAt?: string;
}

export interface WalletLimits {
  dailyLimit: number;
  monthlyLimit: number;
  transactionLimit: number;
  currency: string;
}

export interface SubWalletData {
  subWalletId: string;
  subWalletName: string;
  balance: number;
  onHoldBalance: number;
  availableBalance: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export interface CreateSubWalletRequest {
  subWalletName: string;
}

export interface CreateSubWalletResponse {
  subWalletId: string;
  subWalletName: string;
  balance: number;
  onHoldBalance: number;
  availableBalance: number;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  createdAt: string;
}

export interface WalletActivationRequest {
  otp: string;
}

export interface WalletOTPRequest {
  action: 'activate' | 'deactivate';
}

export interface SubWalletOTPRequest {
  action: 'create';
  walletName?: string;
}

export interface WalletOTPResponse {
  success: boolean;
  message: string;
  otpCode?: string; // OTP code for testing/display
  sessionId?: string; // Session ID for OTP verification (for email update endpoint)
}

export interface WalletActivationResponse {
  success: boolean;
  message: string;
  walletStatus: WalletStatus;
}

/**
 * Wallet Service - Handles all wallet-related API calls
 */
export class WalletService {
  /**
   * Get wallet balance
   * @param subWalletId Optional sub-wallet ID. If provided, returns balance for that sub-wallet
   */
  static async getBalance(subWalletId?: string): Promise<WalletBalance> {
    try {
      console.log('🔍 Fetching wallet balance...', subWalletId ? `(sub-wallet: ${subWalletId})` : '(main wallet)');
      const url = subWalletId 
        ? `/api/v1/wallet/balance?subWalletId=${subWalletId}`
        : '/api/v1/wallet/balance';
      const data = await API.get(url);
      console.log('✅ Wallet balance data received:', data);
      return {
        balance: data.availableBalance || data.balance || 0,
        currency: data.currency || 'SAR',
        formattedBalance: data.formattedBalance || `${(data.availableBalance || data.balance || 0).toFixed(2)} ${data.currency || 'SAR'}`
      };
    } catch (error) {
      console.error('❌ Error fetching wallet balance:', error);
      throw error;
    }
  }

  /**
   * Get wallet status
   * @param subWalletId Optional sub-wallet ID. If provided, returns status for that sub-wallet
   */
  static async getStatus(subWalletId?: string): Promise<WalletStatus> {
    try {
      const url = subWalletId 
        ? `/api/v1/wallet/status?subWalletId=${subWalletId}`
        : '/api/v1/wallet/status';
      const data = await API.get(url);
      console.log('🔍 Wallet status response:', data);
      
      // Handle both boolean isActive and string status from backend
      const isActive = data.isActive || data.active || (data.status === 'ACTIVE');
      const status = data.status?.toLowerCase() || (isActive ? 'active' : 'inactive');
      
      return {
        isActive: isActive,
        status: status,
        activatedAt: data.activatedAt,
        deactivatedAt: data.deactivatedAt
      };
    } catch (error) {
      console.error('Error fetching wallet status:', error);
      throw error;
    }
  }

  /**
   * Request OTP for wallet operations
   * Uses authenticated email update endpoint to send OTP to current user's phone
   * This is a workaround since there's no wallet-specific OTP endpoint
   */
  static async requestOTP(request: WalletOTPRequest): Promise<WalletOTPResponse> {
    try {
      console.log('🔍 Requesting OTP for wallet operation:', request.action);
      
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
      const tempEmail = user.email ? `temp-${Date.now()}@${user.email.split('@')[1]}` : `wallet-${Date.now()}@temp.com`;
      
      try {
        const data = await API.post('/api/v1/users/me/email/update', {
          email: tempEmail
      });
      
        console.log('✅ OTP requested successfully via email update endpoint:', data);
      return {
        success: data.success || true,
        message: data.message || 'OTP sent successfully',
          otpCode: data.otpCode,
          sessionId: data.sessionId // Store session ID for consistency
      };
      } catch (emailError: any) {
        // Check if OTP was sent despite the error (some validation errors still send OTP)
        if (emailError.response?.data?.otpCode) {
          console.log('✅ OTP received despite validation error:', emailError.response.data);
          return {
            success: true,
            message: 'OTP sent successfully',
            otpCode: emailError.response.data.otpCode,
            sessionId: emailError.response.data.sessionId // Store session ID if available
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
      console.error('Error requesting wallet OTP:', error);
      throw error;
    }
  }

  /**
   * Request OTP for sub-wallet operations
   */
  static async requestSubWalletOTP(request: SubWalletOTPRequest): Promise<WalletOTPResponse> {
    try {
      console.log('🔍 Requesting OTP for sub-wallet operation:', request.action);
      
      // Use the same workaround as wallet activate/deactivate
      // Use the email update endpoint to send OTP to the current user's phone
      const { getCurrentUser } = await import('./realBackendAPI');
      const { UpdateEmailRequest, UpdateEmailResponse } = await import('./userManagementService');
      
      let phoneNumber = localStorage.getItem('phoneNumber');

      if (!phoneNumber) {
        try {
          const user = await getCurrentUser();
          phoneNumber = user.phoneE164 || undefined;
        } catch (err) {
          console.warn('Could not fetch user profile for phone number:', err);
        }
      }

      if (!phoneNumber) {
        throw new Error('Phone number not found. Please ensure you are logged in.');
      }

      // Use the email update endpoint as a workaround to send OTP to the current user's phone
      const emailUpdateRequest: UpdateEmailRequest = {
        email: 'temp@example.com' // Dummy email, as we only need the OTP side effect
      };
      const data = await API.post<UpdateEmailResponse>('/api/v1/users/me/email/update', emailUpdateRequest);
      
      console.log('✅ OTP requested successfully via email update endpoint:', data);
      return {
        success: data.success || true,
        message: data.message || 'OTP sent successfully',
        otpCode: data.otpCode, // Assuming the response includes otpCode for testing
        sessionId: data.sessionId // Store session ID for OTP verification
      };
    } catch (error) {
      console.error('Error requesting sub-wallet OTP:', error);
      throw error;
    }
  }

  /**
   * Activate wallet
   * @param request Activation request with OTP
   * @param subWalletId Optional sub-wallet ID. If provided, activates that sub-wallet
   */
  static async activateWallet(request: WalletActivationRequest, subWalletId?: string): Promise<WalletActivationResponse> {
    try {
      const url = subWalletId 
        ? `/api/v1/wallet/activate?subWalletId=${subWalletId}`
        : '/api/v1/wallet/activate';
      const data = await API.post(url, request);
      console.log('🔍 Wallet activation response:', data);
      
      // Handle backend response format
      const isActive = data.isActive || data.active || (data.status === 'ACTIVE');
      const status = data.status?.toLowerCase() || (isActive ? 'active' : 'inactive');
      
      return {
        success: data.success || true,
        message: data.message || 'Wallet activated successfully',
        walletStatus: {
          isActive: isActive,
          status: status,
          activatedAt: data.activatedAt,
          deactivatedAt: data.deactivatedAt
        }
      };
    } catch (error) {
      console.error('Error activating wallet:', error);
      throw error;
    }
  }

  /**
   * Deactivate wallet
   * @param request Deactivation request with OTP
   * @param subWalletId Optional sub-wallet ID. If provided, deactivates that sub-wallet
   */
  static async deactivateWallet(request: WalletActivationRequest, subWalletId?: string): Promise<WalletActivationResponse> {
    try {
      const url = subWalletId 
        ? `/api/v1/wallet/deactivate?subWalletId=${subWalletId}`
        : '/api/v1/wallet/deactivate';
      const data = await API.post(url, request);
      console.log('🔍 Wallet deactivation response:', data);
      
      // Handle backend response format
      const isActive = data.isActive || data.active || (data.status === 'ACTIVE');
      const status = data.status?.toLowerCase() || (isActive ? 'active' : 'inactive');
      
      return {
        success: data.success || true,
        message: data.message || 'Wallet deactivated successfully',
        walletStatus: {
          isActive: isActive,
          status: status,
          activatedAt: data.activatedAt,
          deactivatedAt: data.deactivatedAt
        }
      };
    } catch (error) {
      console.error('Error deactivating wallet:', error);
      throw error;
    }
  }

  /**
   * Get wallet limits
   * @param subWalletId Optional sub-wallet ID. If provided, returns limits for that sub-wallet (inherits from main wallet)
   */
  static async getLimits(subWalletId?: string): Promise<WalletLimits> {
    try {
      const url = subWalletId 
        ? `/api/v1/wallet/limits?subWalletId=${subWalletId}`
        : '/api/v1/wallet/limits';
      const data = await API.get(url);
      // Backend returns limits array, extract daily and monthly
      const limits = data.limits || [];
      const dailyLimit = limits.find((l: any) => l.limitType === 'DAILY' && !l.transactionType)?.limitAmount || 0;
      const monthlyLimit = limits.find((l: any) => l.limitType === 'MONTHLY' && !l.transactionType)?.limitAmount || 0;
      const transactionLimit = limits.find((l: any) => l.limitType === 'TRANSACTION_SPECIFIC')?.limitAmount || 0;
      
      return {
        dailyLimit: dailyLimit,
        monthlyLimit: monthlyLimit,
        transactionLimit: transactionLimit,
        currency: data.currency || 'SAR'
      };
    } catch (error) {
      console.error('Error fetching wallet limits:', error);
      throw error;
    }
  }

  /**
   * Get all sub-wallets
   */
  static async getSubWallets(): Promise<SubWalletData[]> {
    try {
      const data = await API.get('/api/v1/sub-wallets');
      return data.items || data || [];
    } catch (error) {
      console.error('Error fetching sub-wallets:', error);
      throw error;
    }
  }

  /**
   * Create a new sub-wallet
   */
  static async createSubWallet(request: CreateSubWalletRequest): Promise<CreateSubWalletResponse> {
    try {
      const data = await API.post('/api/v1/sub-wallets', request);
      return {
        subWalletId: data.subWalletId,
        subWalletName: data.subWalletName,
        balance: data.balance || 0,
        onHoldBalance: data.onHoldBalance || 0,
        availableBalance: data.availableBalance || 0,
        status: data.status || 'ACTIVE',
        createdAt: data.createdAt
      };
    } catch (error) {
      console.error('Error creating sub-wallet:', error);
      throw error;
    }
  }

  /**
   * Get sub-wallet details by ID
   */
  static async getSubWalletDetails(subWalletId: string): Promise<SubWalletData> {
    try {
      const data = await API.get(`/api/v1/sub-wallets/${subWalletId}`);
      return {
        subWalletId: data.subWalletId,
        subWalletName: data.subWalletName,
        balance: data.balance || 0,
        onHoldBalance: data.onHoldBalance || 0,
        availableBalance: data.availableBalance || 0,
        status: data.status || 'ACTIVE',
        createdAt: data.createdAt
      };
    } catch (error) {
      console.error('Error fetching sub-wallet details:', error);
      throw error;
    }
  }

  /**
   * Update sub-wallet
   */
  static async updateSubWallet(subWalletId: string, updates: Partial<CreateSubWalletRequest>): Promise<SubWalletData> {
    try {
      const data = await API.put(`/api/v1/sub-wallets/${subWalletId}`, updates);
      return {
        subWalletId: data.subWalletId,
        subWalletName: data.subWalletName,
        balance: data.balance || 0,
        onHoldBalance: data.onHoldBalance || 0,
        availableBalance: data.availableBalance || 0,
        status: data.status || 'ACTIVE',
        createdAt: data.createdAt
      };
    } catch (error) {
      console.error('Error updating sub-wallet:', error);
      throw error;
    }
  }

  /**
   * Delete sub-wallet
   */
  static async deleteSubWallet(subWalletId: string): Promise<void> {
    try {
      await API.del(`/api/v1/sub-wallets/${subWalletId}`);
    } catch (error) {
      console.error('Error deleting sub-wallet:', error);
      throw error;
    }
  }
}

export default WalletService;
