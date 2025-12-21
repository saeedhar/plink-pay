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
  otp: string; // OTP for web, passcode for mobile
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
   * Uses dedicated wallet OTP endpoint
   */
  static async requestOTP(request: WalletOTPRequest): Promise<WalletOTPResponse> {
    try {
      console.log('🔍 Requesting OTP for wallet operation:', request.action);
      
      // Map action to business type
      const businessType = request.action === 'activate' 
        ? 'wallet_activate' 
        : request.action === 'deactivate'
        ? 'wallet_deactivate'
        : 'wallet_operation';
      
      // Use dedicated wallet OTP endpoint
      const data = await API.post('/api/v1/wallet/otp/send', {
        businessType: businessType
      });
      
      console.log('✅ OTP requested successfully via wallet OTP endpoint:', data);
      return {
        success: data.success || true,
        message: data.message || 'OTP sent successfully',
        otpCode: data.otpCode,
        sessionId: undefined // Wallet OTP doesn't use session ID - OTP is verified directly
      };
    } catch (error: any) {
      console.error('Error requesting wallet OTP:', error);
      throw error;
    }
  }

  /**
   * Request OTP for sub-wallet operations
   * Uses dedicated wallet OTP endpoint
   */
  static async requestSubWalletOTP(request: SubWalletOTPRequest): Promise<WalletOTPResponse> {
    try {
      console.log('🔍 Requesting OTP for sub-wallet operation:', request.action);
      
      // Use dedicated wallet OTP endpoint with sub-wallet business type
      const data = await API.post('/api/v1/wallet/otp/send', {
        businessType: 'sub_wallet_create'
      });
      
      console.log('✅ OTP requested successfully via wallet OTP endpoint:', data);
      return {
        success: data.success || true,
        message: data.message || 'OTP sent successfully',
        otpCode: data.otpCode,
        sessionId: undefined // Wallet OTP doesn't use session ID - OTP is verified directly
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
      console.log('📤 Creating sub-wallet with request:', {
        subWalletName: request.subWalletName,
        hasOtp: !!request.otp,
        otpLength: request.otp?.length
      });
      
      const data = await API.post('/api/v1/sub-wallets', {
        subWalletName: request.subWalletName,
        otp: request.otp
      });
      
      console.log('✅ Sub-wallet created successfully:', data);
      
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
      console.error('❌ Error creating sub-wallet:', error);
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
