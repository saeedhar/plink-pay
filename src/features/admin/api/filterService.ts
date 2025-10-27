import { adminHttp } from './adminHttp';

export interface TransactionFilter {
  id: string;
  label: string;
  code?: string;
  order: number;
  active: boolean;
}

export interface FiltersListResponse {
  items: TransactionFilter[];
}

export interface CreateFilterRequest {
  label: string;
  code?: string;
  order?: number;
  active?: boolean;
}

/**
 * Transaction Filters management service
 */
export class FilterService {
  /**
   * Get all transaction type filters
   */
  async listFilters(): Promise<FiltersListResponse> {
    const response = await fetch('/api/v1/filters/transaction-types');
    if (!response.ok) {
      throw new Error(`Failed to fetch filters: ${response.status}`);
    }
    return await response.json();
  }

  /**
   * Create a new filter
   */
  async createFilter(payload: CreateFilterRequest): Promise<TransactionFilter> {
    return adminHttp<TransactionFilter>('/api/admin/filters', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Toggle filter active status
   */
  async toggleFilterStatus(filterId: string, active: boolean): Promise<TransactionFilter> {
    return adminHttp<TransactionFilter>(`/api/admin/filters/${filterId}`, {
      method: 'PATCH',
      body: JSON.stringify({ active })
    });
  }

  /**
   * Delete a filter
   */
  async deleteFilter(filterId: string): Promise<void> {
    return adminHttp<void>(`/api/admin/filters/${filterId}`, {
      method: 'DELETE'
    });
  }
}

// Export singleton instance
export const filterService = new FilterService();

