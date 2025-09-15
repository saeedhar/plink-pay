export type PublicKybOption = { 
  id: string; 
  label: string; 
  code?: string; 
  order: number; 
};

export type KybCategory = 'purpose_of_account' | 'business_activity' | 'annual_revenue';

/**
 * Public service for fetching KYB options from the API
 * Used by customer-facing KYB forms
 */
export async function fetchKybOptions(
  category: KybCategory, 
  locale = 'en'
): Promise<PublicKybOption[]> {
  const res = await fetch(`/api/kyb/options?category=${category}&locale=${locale}`);
  
  if (!res.ok) {
    throw new Error(`Failed to fetch KYB options: ${res.status}`);
  }
  
  const data = await res.json() as { items: PublicKybOption[] };
  return data.items;
}

/**
 * Fetch all KYB options for all categories
 */
export async function fetchAllKybOptions(locale = 'en'): Promise<{
  purposeOfAccount: PublicKybOption[];
  businessActivity: PublicKybOption[];
  annualRevenue: PublicKybOption[];
}> {
  const [purposeOfAccount, businessActivity, annualRevenue] = await Promise.all([
    fetchKybOptions('purpose_of_account', locale),
    fetchKybOptions('business_activity', locale),
    fetchKybOptions('annual_revenue', locale)
  ]);

  return {
    purposeOfAccount,
    businessActivity,
    annualRevenue
  };
}
