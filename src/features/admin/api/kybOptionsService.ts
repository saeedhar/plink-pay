import { adminHttp } from './adminHttp';

export type KybCategory = 'purpose_of_account' | 'business_activity' | 'annual_revenue';

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
  category: KybCategory;
  locale: 'en' | 'ar';
  total: number;
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

    return adminHttp<KybOptionsListResponse>(`/admin/kyb/options?${params}`);
  }

  /**
   * Create a new KYB option
   */
  async createOption(payload: CreateKybOptionRequest): Promise<KybOption> {
    return adminHttp<KybOption>('/admin/kyb/options', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }

  /**
   * Get all categories with their display names
   */
  getCategories(): Array<{ value: KybCategory; label: string }> {
    return [
      { value: 'purpose_of_account', label: 'Purpose of Account' },
      { value: 'business_activity', label: 'Business Activity' },
      { value: 'annual_revenue', label: 'Annual Revenue' }
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
