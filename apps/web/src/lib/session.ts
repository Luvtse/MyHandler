import { logger } from './logger';
import { errorHandler } from './error-handler';

export interface SessionConfig {
  timeoutDuration: number; // in milliseconds
  warningDuration: number; // in milliseconds before timeout
  storagePrefix: string;
  persistUserPreferences: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    reduceMotion: boolean;
  };
}

type SessionEventType = 'timeout' | 'warning' | 'keepAlive' | 'end';
type SessionEventListener = (event: SessionEventType) => void;

class SessionManager {
  private static instance: SessionManager;
  private config: SessionConfig;
  private lastActivity: number;
  private timeoutId: number | null;
  private warningId: number | null;
  private listeners: Set<SessionEventListener>;
  private preferences: UserPreferences;

  private constructor() {
    this.config = {
      timeoutDuration: 30 * 60 * 1000, // 30 minutes
      warningDuration: 5 * 60 * 1000, // 5 minutes
      storagePrefix: 'app_session_',
      persistUserPreferences: true,
    };

    this.lastActivity = Date.now();
    this.timeoutId = null;
    this.warningId = null;
    this.listeners = new Set();
    this.preferences = this.loadPreferences();

    this.setupActivityListeners();
    this.startTimer();
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  private setupActivityListeners(): void {
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => {
      window.addEventListener(event, () => this.handleActivity());
    });
  }

  private handleActivity(): void {
    this.lastActivity = Date.now();
    this.resetTimer();
  }

  private startTimer(): void {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    if (this.warningId) clearTimeout(this.warningId);

    const timeUntilWarning = this.config.timeoutDuration - this.config.warningDuration;

    this.warningId = window.setTimeout(() => {
      this.emit('warning');
      logger.warn('Session timeout warning', 'session');
    }, timeUntilWarning);

    this.timeoutId = window.setTimeout(() => {
      this.handleTimeout();
    }, this.config.timeoutDuration);
  }

  private resetTimer(): void {
    this.startTimer();
  }

  private async handleTimeout(): Promise<void> {
    try {
      this.emit('timeout');
      logger.info('Session timeout', 'session');
      await this.endSession();
    } catch (error) {
      errorHandler.handleError(error);
    }
  }

  public async endSession(): Promise<void> {
    try {
      if (this.config.persistUserPreferences) {
        this.savePreferences();
      }

      // Clear session storage but keep preferences
      const prefsKey = `${this.config.storagePrefix}preferences`;
      const prefs = localStorage.getItem(prefsKey);

      localStorage.clear();

      if (this.config.persistUserPreferences && prefs) {
        localStorage.setItem(prefsKey, prefs);
      }

      this.emit('end');
      logger.info('Session ended', 'session');

      // Redirect to login page
      window.location.href = '/login';
    } catch (error) {
      errorHandler.handleError(error);
    }
  }

  private emit(event: SessionEventType): void {
    this.listeners.forEach(listener => listener(event));
  }

  public addEventListener(listener: SessionEventListener): void {
    this.listeners.add(listener);
  }

  public removeEventListener(listener: SessionEventListener): void {
    this.listeners.delete(listener);
  }

  public setConfig(config: Partial<SessionConfig>): void {
    this.config = { ...this.config, ...config };
    this.resetTimer();
  }

  public getTimeUntilTimeout(): number {
    return Math.max(
      0,
      this.config.timeoutDuration - (Date.now() - this.lastActivity)
    );
  }

  public keepAlive(): void {
    this.handleActivity();
    this.emit('keepAlive');
    logger.debug('Session keep-alive', 'session');
  }

  // User preferences management
  private loadPreferences(): UserPreferences {
    const defaultPreferences: UserPreferences = {
      theme: 'system',
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      dateFormat: 'YYYY-MM-DD',
      timeFormat: 'HH:mm:ss',
      notifications: {
        email: true,
        push: true,
        sms: false,
      },
      accessibility: {
        highContrast: false,
        largeText: false,
        reduceMotion: false,
      },
    };

    try {
      const stored = localStorage.getItem(`${this.config.storagePrefix}preferences`);
      return stored ? { ...defaultPreferences, ...JSON.parse(stored) } : defaultPreferences;
    } catch (error) {
      errorHandler.handleError(error);
      return defaultPreferences;
    }
  }

  private savePreferences(): void {
    try {
      localStorage.setItem(
        `${this.config.storagePrefix}preferences`,
        JSON.stringify(this.preferences)
      );
    } catch (error) {
      errorHandler.handleError(error);
    }
  }

  public getPreferences(): UserPreferences {
    return { ...this.preferences };
  }

  public updatePreferences(preferences: Partial<UserPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
    if (this.config.persistUserPreferences) {
      this.savePreferences();
    }
    logger.info('User preferences updated', 'preferences', preferences);
  }

  public clearPreferences(): void {
    localStorage.removeItem(`${this.config.storagePrefix}preferences`);
    this.preferences = this.loadPreferences();
    logger.info('User preferences cleared', 'preferences');
  }
}

export const sessionManager = SessionManager.getInstance();