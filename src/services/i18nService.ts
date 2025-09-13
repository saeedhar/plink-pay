/**
 * Internationalization Service
 * Implements BRD requirements for RTL readiness and Arabic number conversion
 */

export type Locale = 'en' | 'ar' | 'en-SA';
export type Direction = 'ltr' | 'rtl';

export interface I18nConfig {
  defaultLocale: Locale;
  supportedLocales: Locale[];
  enableRTL: boolean;
  enableArabicNumerals: boolean;
  fallbackLocale: Locale;
}

export interface LocaleData {
  locale: Locale;
  direction: Direction;
  name: string;
  nativeName: string;
  dateFormat: string;
  numberFormat: Intl.NumberFormatOptions;
}

export class I18nService {
  private config: I18nConfig;
  private currentLocale: Locale;
  private translations: Map<string, Record<string, string>> = new Map();
  private localeData: Map<Locale, LocaleData> = new Map();

  constructor(config: Partial<I18nConfig> = {}) {
    this.config = {
      defaultLocale: 'en',
      supportedLocales: ['en', 'ar', 'en-SA'],
      enableRTL: true,
      enableArabicNumerals: true,
      fallbackLocale: 'en',
      ...config
    };

    this.currentLocale = this.config.defaultLocale;
    this.initializeLocaleData();
    this.detectUserLocale();
  }

  /**
   * Initialize locale data
   */
  private initializeLocaleData(): void {
    this.localeData.set('en', {
      locale: 'en',
      direction: 'ltr',
      name: 'English',
      nativeName: 'English',
      dateFormat: 'MM/dd/yyyy',
      numberFormat: { locale: 'en-US' }
    });

    this.localeData.set('ar', {
      locale: 'ar',
      direction: 'rtl',
      name: 'Arabic',
      nativeName: 'العربية',
      dateFormat: 'dd/MM/yyyy',
      numberFormat: { locale: 'ar-SA' }
    });

    this.localeData.set('en-SA', {
      locale: 'en-SA',
      direction: 'ltr',
      name: 'English (Saudi Arabia)',
      nativeName: 'English (Saudi Arabia)',
      dateFormat: 'dd/MM/yyyy',
      numberFormat: { locale: 'en-SA' }
    });
  }

  /**
   * Detect user's preferred locale
   */
  private detectUserLocale(): void {
    if (typeof navigator === 'undefined') return;

    const browserLocale = navigator.language.toLowerCase();
    const supportedLocale = this.config.supportedLocales.find(locale => 
      browserLocale.startsWith(locale.toLowerCase())
    );

    if (supportedLocale) {
      this.setLocale(supportedLocale);
    }
  }

  /**
   * Set current locale
   */
  setLocale(locale: Locale): void {
    if (!this.config.supportedLocales.includes(locale)) {
      console.warn(`Locale ${locale} is not supported. Using fallback.`);
      locale = this.config.fallbackLocale;
    }

    this.currentLocale = locale;
    this.applyLocaleSettings();
  }

  /**
   * Get current locale
   */
  getCurrentLocale(): Locale {
    return this.currentLocale;
  }

  /**
   * Get locale data
   */
  getLocaleData(locale?: Locale): LocaleData | undefined {
    return this.localeData.get(locale || this.currentLocale);
  }

  /**
   * Check if current locale is RTL
   */
  isRTL(locale?: Locale): boolean {
    const data = this.getLocaleData(locale);
    return data?.direction === 'rtl' && this.config.enableRTL;
  }

  /**
   * Apply locale settings to DOM
   */
  private applyLocaleSettings(): void {
    if (typeof document === 'undefined') return;

    const html = document.documentElement;
    const data = this.getLocaleData();

    if (data) {
      html.lang = data.locale;
      html.dir = this.config.enableRTL ? data.direction : 'ltr';
      
      // Add locale class for CSS targeting
      html.className = html.className.replace(/\blocale-\w+/g, '');
      html.classList.add(`locale-${data.locale}`);
      
      if (this.isRTL()) {
        html.classList.add('rtl');
      } else {
        html.classList.remove('rtl');
      }
    }
  }

  /**
   * Convert English numerals to Arabic numerals
   */
  toArabicNumerals(input: string): string {
    if (!this.config.enableArabicNumerals) return input;

    const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    
    return input.replace(/[0-9]/g, (digit) => {
      return arabicNumerals[parseInt(digit, 10)];
    });
  }

  /**
   * Convert Arabic numerals to English numerals
   */
  toEnglishNumerals(input: string): string {
    const arabicToEnglish: Record<string, string> = {
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
      '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
    };

    return input.replace(/[٠-٩]/g, (digit) => {
      return arabicToEnglish[digit] || digit;
    });
  }

  /**
   * Format number according to locale
   */
  formatNumber(number: number, options?: Intl.NumberFormatOptions): string {
    const data = this.getLocaleData();
    const formatOptions = { ...data?.numberFormat, ...options };
    
    try {
      const formatter = new Intl.NumberFormat(data?.locale || 'en', formatOptions);
      let formatted = formatter.format(number);
      
      // Apply Arabic numerals if enabled and locale is Arabic
      if (this.config.enableArabicNumerals && this.currentLocale === 'ar') {
        formatted = this.toArabicNumerals(formatted);
      }
      
      return formatted;
    } catch (error) {
      console.warn('Number formatting failed:', error);
      return number.toString();
    }
  }

  /**
   * Format date according to locale
   */
  formatDate(date: Date, options?: Intl.DateTimeFormatOptions): string {
    const data = this.getLocaleData();
    
    try {
      const formatter = new Intl.DateTimeFormat(data?.locale || 'en', options);
      let formatted = formatter.format(date);
      
      // Apply Arabic numerals if enabled and locale is Arabic
      if (this.config.enableArabicNumerals && this.currentLocale === 'ar') {
        formatted = this.toArabicNumerals(formatted);
      }
      
      return formatted;
    } catch (error) {
      console.warn('Date formatting failed:', error);
      return date.toLocaleDateString();
    }
  }

  /**
   * Format currency according to locale
   */
  formatCurrency(amount: number, currency: string = 'SAR'): string {
    return this.formatNumber(amount, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  /**
   * Format phone number according to locale
   */
  formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Saudi phone number formatting
    if (digits.startsWith('966')) {
      // International format: +966 50 123 4567
      const formatted = `+966 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
      return this.config.enableArabicNumerals && this.currentLocale === 'ar' 
        ? this.toArabicNumerals(formatted) 
        : formatted;
    } else if (digits.startsWith('05') && digits.length === 10) {
      // Local format: 050 123 4567
      const formatted = `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
      return this.config.enableArabicNumerals && this.currentLocale === 'ar' 
        ? this.toArabicNumerals(formatted) 
        : formatted;
    }
    
    return phoneNumber;
  }

  /**
   * Get text direction for specific content
   */
  getTextDirection(text: string): Direction {
    // Simple RTL detection based on Arabic characters
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    
    if (arabicRegex.test(text)) {
      return 'rtl';
    }
    
    return this.getLocaleData()?.direction || 'ltr';
  }

  /**
   * Load translations for a locale
   */
  loadTranslations(locale: Locale, translations: Record<string, string>): void {
    this.translations.set(locale, translations);
  }

  /**
   * Get translation for a key
   */
  t(key: string, params?: Record<string, string | number>): string {
    const localeTranslations = this.translations.get(this.currentLocale);
    let translation = localeTranslations?.[key];
    
    // Fallback to default locale
    if (!translation) {
      const fallbackTranslations = this.translations.get(this.config.fallbackLocale);
      translation = fallbackTranslations?.[key];
    }
    
    // Fallback to key itself
    if (!translation) {
      translation = key;
    }
    
    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        const placeholder = `{{${param}}}`;
        translation = translation.replace(new RegExp(placeholder, 'g'), String(value));
      });
    }
    
    return translation;
  }

  /**
   * Get available locales
   */
  getAvailableLocales(): LocaleData[] {
    return this.config.supportedLocales
      .map(locale => this.getLocaleData(locale))
      .filter(Boolean) as LocaleData[];
  }

  /**
   * Generate CSS custom properties for RTL support
   */
  generateRTLProperties(): Record<string, string> {
    const isRTL = this.isRTL();
    
    return {
      '--text-align-start': isRTL ? 'right' : 'left',
      '--text-align-end': isRTL ? 'left' : 'right',
      '--margin-start': isRTL ? 'margin-right' : 'margin-left',
      '--margin-end': isRTL ? 'margin-left' : 'margin-right',
      '--padding-start': isRTL ? 'padding-right' : 'padding-left',
      '--padding-end': isRTL ? 'padding-left' : 'padding-right',
      '--border-start': isRTL ? 'border-right' : 'border-left',
      '--border-end': isRTL ? 'border-left' : 'border-right',
      '--transform-x': isRTL ? 'scaleX(-1)' : 'scaleX(1)'
    };
  }

  /**
   * Apply RTL CSS properties
   */
  applyRTLProperties(): void {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    const properties = this.generateRTLProperties();
    
    Object.entries(properties).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.translations.clear();
  }
}

// Export singleton instance
export const i18nService = new I18nService({
  defaultLocale: 'en-SA', // Saudi English as default
  enableRTL: true,
  enableArabicNumerals: true
});
