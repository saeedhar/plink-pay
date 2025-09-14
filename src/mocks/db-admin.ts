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

// In-memory database for KYB options
export const kybOptions: KybOption[] = [
  // Purpose of Account options
  {
    id: 'p1',
    category: 'purpose_of_account',
    label: 'Receiving payments',
    code: 'RECEIVE_PAYMENTS',
    order: 1,
    active: true,
    locale: 'en'
  },
  {
    id: 'p2',
    category: 'purpose_of_account',
    label: 'Paying suppliers',
    code: 'PAY_SUPPLIERS',
    order: 2,
    active: true,
    locale: 'en'
  },
  {
    id: 'p3',
    category: 'purpose_of_account',
    label: 'International transfers',
    code: 'INTL_TRANSFERS',
    order: 3,
    active: true,
    locale: 'en'
  },
  {
    id: 'p4',
    category: 'purpose_of_account',
    label: 'Employee payroll',
    code: 'PAYROLL',
    order: 4,
    active: true,
    locale: 'en'
  },

  // Business Activity options
  {
    id: 'b1',
    category: 'business_activity',
    label: 'Retail trade',
    code: 'RETAIL',
    order: 1,
    active: true,
    locale: 'en'
  },
  {
    id: 'b2',
    category: 'business_activity',
    label: 'E-commerce',
    code: 'ECOMMERCE',
    order: 2,
    active: true,
    locale: 'en'
  },
  {
    id: 'b3',
    category: 'business_activity',
    label: 'Professional services',
    code: 'PROFESSIONAL',
    order: 3,
    active: true,
    locale: 'en'
  },
  {
    id: 'b4',
    category: 'business_activity',
    label: 'Manufacturing',
    code: 'MANUFACTURING',
    order: 4,
    active: true,
    locale: 'en'
  },
  {
    id: 'b5',
    category: 'business_activity',
    label: 'Technology services',
    code: 'TECH_SERVICES',
    order: 5,
    active: true,
    locale: 'en'
  },

  // Annual Revenue options
  {
    id: 'a1',
    category: 'annual_revenue',
    label: 'Less than $100K',
    code: 'UNDER_100K',
    order: 1,
    active: true,
    locale: 'en'
  },
  {
    id: 'a2',
    category: 'annual_revenue',
    label: '$100K - $500K',
    code: '100K_500K',
    order: 2,
    active: true,
    locale: 'en'
  },
  {
    id: 'a3',
    category: 'annual_revenue',
    label: '$500K - $1M',
    code: '500K_1M',
    order: 3,
    active: true,
    locale: 'en'
  },
  {
    id: 'a4',
    category: 'annual_revenue',
    label: '$1M - $5M',
    code: '1M_5M',
    order: 4,
    active: true,
    locale: 'en'
  },
  {
    id: 'a5',
    category: 'annual_revenue',
    label: 'Over $5M',
    code: 'OVER_5M',
    order: 5,
    active: true,
    locale: 'en'
  }
];

// Helper functions for managing the in-memory DB
export function getKybOptionsByCategory(category: KybCategory, locale: 'en' | 'ar' = 'en'): KybOption[] {
  return kybOptions
    .filter(option => option.category === category && option.locale === locale)
    .sort((a, b) => a.order - b.order);
}

export function createKybOption(data: Omit<KybOption, 'id'>): KybOption {
  const id = `${data.category.charAt(0)}${Date.now()}`;
  const newOption: KybOption = {
    id,
    ...data
  };
  kybOptions.push(newOption);
  return newOption;
}

export function getNextOrderForCategory(category: KybCategory, locale: 'en' | 'ar' = 'en'): number {
  const categoryOptions = getKybOptionsByCategory(category, locale);
  return categoryOptions.length > 0 
    ? Math.max(...categoryOptions.map(opt => opt.order)) + 1 
    : 1;
}
