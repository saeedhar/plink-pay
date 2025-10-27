import { adminHttp } from './adminHttp';
import { apiUrl } from '../../../lib/api';

export type KybCategory = 'purpose_of_account' | 'business_activity' | 'annual_revenue' | 'source_of_funds';

export interface KybOption {
  id: string;
  category: KybCategory;
  label: string;
  code?: string;
  order: number;
  active: boolean;
  locale: 'en' | 'ar';
}

export interface KybOptionsListResponse {
  items: KybOption[];
}

export interface CreateKybOptionRequest {
  category: KybCategory;
  label: string;
  code?: string;
  order?: number;
  active?: boolean;
  locale?: 'en' | 'ar';
}

/**
 * KYB Options management service
 */
export class KybOptionsService {
  /**
   * Get KYB options by category
   */
  async listOptions(category: KybCategory, locale: 'en' | 'ar' = 'en'): Promise<KybOptionsListResponse> {
    const params = new URLSearchParams({
      category,
      locale
    });

    const response = await fetch(apiUrl(`/api/v1/kyb/options?${params}`));
    if (!response.ok) {
      throw new Error(`Failed to fetch KYB options: ${response.status}`);
    }
    return await response.json();
  }

  /**
   * Create a new KYB option
   */
  async createOption(payload: CreateKybOptionRequest): Promise<KybOption> {
    return adminHttp<KybOption>('/api/admin/kyb/options', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Toggle KYB option active status
   */
  async toggleOptionStatus(category: KybCategory, optionId: string, active: boolean, locale: 'en' | 'ar' = 'en'): Promise<KybOption> {
    return adminHttp<KybOption>(`/api/admin/kyb/options/${optionId}`, {
      method: 'PATCH',
      body: JSON.stringify({ category, active, locale })
    });
  }

  /**
   * Delete a KYB option
   */
  async deleteOption(category: KybCategory, optionId: string, locale: 'en' | 'ar' = 'en'): Promise<void> {
    return adminHttp<void>(`/api/admin/kyb/options/${optionId}?category=${category}&locale=${locale}`, {
      method: 'DELETE'
    });
  }

  /**
   * Get all categories with their display names
   */
  getCategories(): Array<{ value: KybCategory; label: string }> {
    return [
      { value: 'source_of_funds', label: 'Source of Funds' },
      { value: 'purpose_of_account', label: 'Purpose of Account' },
      { value: 'business_activity', label: 'Business Activity (Transaction Type)' },
      { value: 'annual_revenue', label: 'Annual Revenue (Monthly Volume)' }
    ];
  }

  /**
   * Get display name for a category
   */
  getCategoryDisplayName(category: KybCategory): string {
    const categories = this.getCategories();
    return categories.find(cat => cat.value === category)?.label || category;
  }
}

// Export singleton instance
export const kybOptionsService = new KybOptionsService();
