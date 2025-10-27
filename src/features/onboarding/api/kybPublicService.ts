import { apiUrl } from '../../../lib/api';

export type PublicKybOption = { 
  id: string; 
  label: string; 
  code?: string; 
  order: number; 
};

export type KybCategory = 'purpose_of_account' | 'business_activity' | 'annual_revenue' | 'source_of_funds';

/**
 * Public service for fetching KYB options from the API
 * Used by customer-facing KYB forms
 */
export async function fetchKybOptions(
  category: KybCategory, 
  locale = 'en'
): Promise<PublicKybOption[]> {
  const res = await fetch(apiUrl(`/api/v1/kyb/options?category=${category}&locale=${locale}`));
  
  if (!res.ok) {
    throw new Error(`Failed to fetch KYB options: ${res.status}`);
  }
  
  const data = await res.json() as { items: any[] };
  
  // Filter to only return active options, sorted by order
  return data.items
    .filter(item => item.active !== false)
    .map(item => ({
      id: item.id,
      label: item.label,
      code: item.code,
      order: item.order
    }))
    .sort((a, b) => a.order - b.order);
}

/**
 * Fetch all KYB options for all categories
 */
export async function fetchAllKybOptions(locale = 'en'): Promise<{
  sourceOfFunds: PublicKybOption[];
  purposeOfAccount: PublicKybOption[];
  businessActivity: PublicKybOption[];
  annualRevenue: PublicKybOption[];
}> {
  const [sourceOfFunds, purposeOfAccount, businessActivity, annualRevenue] = await Promise.all([
    fetchKybOptions('source_of_funds', locale),
    fetchKybOptions('purpose_of_account', locale),
    fetchKybOptions('business_activity', locale),
    fetchKybOptions('annual_revenue', locale)
  ]);

  return {
    sourceOfFunds,
    purposeOfAccount,
    businessActivity,
    annualRevenue
  };
}
