import { API } from '../lib/api';

export interface TransactionSummary {
  id: string;
  transactionType: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  referenceNumber: string;
  createdAt: string;
}

export interface TransactionHistoryResponse {
  transactions: TransactionSummary[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface WalletBalanceResponse {
  walletId: string;
  availableBalance: number;
  onHoldBalance: number;
  totalBalance: number;
  currency: string;
  status: string;
}

export class TransactionService {
  /**
   * Get transaction history
   */
  static async getTransactionHistory(
    page: number = 0,
    size: number = 20,
    startDate?: string,
    endDate?: string,
    transactionType?: string,
    status?: string
  ): Promise<TransactionHistoryResponse> {
    try {
      console.log('🔍 Fetching transaction history...');
      
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString()
      });
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (transactionType) params.append('transactionType', transactionType);
      if (status) params.append('status', status);
      
      const data = await API.get(`/api/v1/transactions?${params.toString()}`);
      console.log('✅ Transaction history received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  }

  /**
   * Get wallet balance
   */
  static async getWalletBalance(): Promise<WalletBalanceResponse> {
    try {
      console.log('🔍 Fetching wallet balance...');
      const data = await API.get('/api/v1/wallet/balance');
      console.log('✅ Wallet balance received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw error;
    }
  }

  /**
   * Format currency amount
   */
  static formatCurrency(amount: number, currency: string = 'SAR'): string {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Format transaction type for display
   */
  static formatTransactionType(type: string): string {
    return type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Format transaction status for display
   */
  static formatTransactionStatus(status: string): string {
    return status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Format date for display
   */
  static formatDate(dateString: string): { date: string; time: string } {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    return { date: dateStr, time: timeStr };
  }
}
