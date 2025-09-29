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
    const API_BASE_URL = 'http://localhost:8084/api/v1';
    const params = new URLSearchParams({
      category,
      locale
    });

    const response = await fetch(`${API_BASE_URL}/kyb/options?${params}`);
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
