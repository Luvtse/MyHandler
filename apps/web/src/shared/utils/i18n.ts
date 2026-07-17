import { logger } from './logger';
import { errorHandler } from './error-handler';

export interface LocaleConfig {
  language: string;
  fallbackLanguage: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: {
    decimal: string;
    thousand: string;
    precision: number;
  };
  currencyFormat: {
    symbol: string;
    position: 'before' | 'after';
    space: boolean;
  };
}

export interface TranslationEntry {
  [key: string]: string | TranslationEntry;
}

type TranslationMap = Map<string, TranslationEntry>;

class I18nService {
  private static instance: I18nService;
  private translations: TranslationMap;
  private config: LocaleConfig;
  private loadedLanguages: Set<string>;

  private constructor() {
    this.translations = new Map();
    this.loadedLanguages = new Set();
    this.config = {
      language: 'en',
      fallbackLanguage: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      dateFormat: 'YYYY-MM-DD',
      timeFormat: 'HH:mm:ss',
      numberFormat: {
        decimal: '.',
        thousand: ',',
        precision: 2,
      },
      currencyFormat: {
        symbol: '$',
        position: 'before',
        space: false,
      },
    };

    this.setupLanguageDetection();
  }

  public static getInstance(): I18nService {
    if (!I18nService.instance) {
      I18nService.instance = new I18nService();
    }
    return I18nService.instance;
  }

  private setupLanguageDetection(): void {
    const storedLanguage = localStorage.getItem('app_language');
    if (storedLanguage) {
      this.setLanguage(storedLanguage);
    } else {
      const browserLanguage = navigator.language.split('-')[0];
      this.setLanguage(browserLanguage);
    }
  }

  public async loadTranslations(language: string): Promise<void> {
    if (this.loadedLanguages.has(language)) return;

    try {
      // Attempt to load translations; gracefully fallback when unavailable
      const response = await fetch(`/api/translations/${language}`);
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !/application\/json/i.test(contentType)) {
        // Use empty translations rather than throwing to avoid breaking app in dev
        this.translations.set(language, {});
        this.loadedLanguages.add(language);
        logger.warn('Translations unavailable, using empty map', 'i18n', { language, status: response.status });
        return;
      }

      const translations = await response.json();
      this.translations.set(language, translations || {});
      this.loadedLanguages.add(language);
      logger.info('Translations loaded', 'i18n', { language });
    } catch (error) {
      // Fall back to empty translations instead of throwing
      errorHandler.handleError(error);
      this.translations.set(language, {});
      this.loadedLanguages.add(language);
      logger.warn('Translation load failed; using empty translations', 'i18n', { language });
    }
  }

  public async setLanguage(language: string): Promise<void> {
    try {
      await this.loadTranslations(language);
    } catch (error) {
      // Do not throw; continue with defaults
      errorHandler.handleError(error);
    }

    this.config.language = language;
    localStorage.setItem('app_language', language);
    document.documentElement.setAttribute('lang', language);

    // Update RTL/LTR
    const isRTL = ['ar', 'he', 'fa'].includes(language);
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');

    logger.info('Language changed', 'i18n', { language });
  }

  public translate(key: string, params?: Record<string, string | number>): string {
    const keys = key.split('.');
    let translation: any = this.translations.get(this.config.language) || {};

    for (const k of keys) {
      translation = translation[k];
      if (!translation) {
        // Fallback to default language
        translation = this.getFallbackTranslation(key);
        break;
      }
    }

    if (typeof translation !== 'string') {
      logger.warn('Translation not found', 'i18n', { key });
      return key;
    }

    return this.interpolate(translation, params);
  }

  private getFallbackTranslation(key: string): string {
    const keys = key.split('.');
    let translation: any = this.translations.get(this.config.fallbackLanguage) || {};

    for (const k of keys) {
      translation = translation[k];
      if (!translation) return key;
    }

    return translation;
  }

  private interpolate(text: string, params?: Record<string, string | number>): string {
    if (!params) return text;

    return text.replace(/\{(\w+)\}/g, (_, key) => {
      return params[key]?.toString() || `{${key}}`;
    });
  }

  public formatDate(date: Date | string | number, format?: string): string {
    const dateObj = new Date(date);
    const formatter = new Intl.DateTimeFormat(this.config.language, {
      timeZone: this.config.timezone,
      ...(format ? this.parseDateFormat(format) : {}),
    });

    return formatter.format(dateObj);
  }

  private parseDateFormat(format: string): Intl.DateTimeFormatOptions {
    const options: Intl.DateTimeFormatOptions = {};

    if (format.includes('YYYY')) options.year = 'numeric';
    if (format.includes('MM')) options.month = '2-digit';
    if (format.includes('DD')) options.day = '2-digit';
    if (format.includes('HH')) options.hour = '2-digit';
    if (format.includes('mm')) options.minute = '2-digit';
    if (format.includes('ss')) options.second = '2-digit';

    return options;
  }

  public formatNumber(number: number, precision?: number): string {
    return new Intl.NumberFormat(this.config.language, {
      minimumFractionDigits: precision ?? this.config.numberFormat.precision,
      maximumFractionDigits: precision ?? this.config.numberFormat.precision,
    }).format(number);
  }

  public formatCurrency(amount: number): string {
    const formatted = this.formatNumber(amount);
    const { symbol, position, space } = this.config.currencyFormat;
    const spacer = space ? ' ' : '';

    return position === 'before'
      ? `${symbol}${spacer}${formatted}`
      : `${formatted}${spacer}${symbol}`;
  }

  public setConfig(config: Partial<LocaleConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): LocaleConfig {
    return { ...this.config };
  }

  public getSupportedLanguages(): string[] {
    return Array.from(this.loadedLanguages);
  }

  public getCurrentLanguage(): string {
    return this.config.language;
  }

  public isRTL(): boolean {
    return ['ar', 'he', 'fa'].includes(this.config.language);
  }
}

export const i18n = I18nService.getInstance();
