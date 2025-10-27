import { apiUrl } from '../lib/api';

export interface TransactionFilter {
  id: string;
  label: string;
  code: string;
  order: number;
  active: boolean;
}

export interface TransactionFiltersResponse {
  items: TransactionFilter[];
}

/**
 * Fetch all active transaction filters from the backend
 */
export async function fetchTransactionFilters(): Promise<TransactionFilter[]> {
  try {
    const response = await fetch(apiUrl('/api/v1/filters/transaction-types'));
    
    if (!response.ok) {
      throw new Error(`Failed to fetch transaction filters: ${response.status}`);
    }
    
    const data: TransactionFiltersResponse = await response.json();
    
    // Filter to only return active filters, sorted by order
    return data.items
      .filter(filter => filter.active)
      .sort((a, b) => a.order - b.order);
  } catch (error) {
    console.error('Error fetching transaction filters:', error);
    throw error;
  }
}

