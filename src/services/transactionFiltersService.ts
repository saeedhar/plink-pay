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
    console.log('🔍 Fetching transaction filters from backend...');
    const response = await fetch(apiUrl('/api/v1/filters/transaction-types'));
    
    if (!response.ok) {
      throw new Error(`Failed to fetch transaction filters: ${response.status}`);
    }
    
    const data: TransactionFiltersResponse = await response.json();
    console.log('✅ Transaction filters received:', data);
    
    // Filter to only return active filters, sorted by order
    const activeFilters = data.items
      .filter(filter => filter.active)
      .sort((a, b) => a.order - b.order);
    
    console.log('✅ Active transaction filters:', activeFilters);
    return activeFilters;
  } catch (error) {
    console.error('Error fetching transaction filters:', error);
    throw error;
  }
}

