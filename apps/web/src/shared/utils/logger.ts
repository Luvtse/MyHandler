import { APP_CONFIG } from '@/config/constants';

export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  category: string;
  data?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
  context?: {
    url?: string;
    userAgent?: string;
    screen?: string;
  };
}

class Logger {
  private static instance: Logger;
  private logQueue: LogEntry[] = [];
  private readonly maxQueueSize = 100;
  private readonly flushInterval = 10000; // 10 seconds

  private constructor() {
    this.setupPeriodicFlush();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private getContext() {
    return {
      url: window.location.href,
      userAgent: navigator.userAgent,
      screen: `${window.innerWidth}x${window.innerHeight}`,
    };
  }

  private createLogEntry(
    level: LogEntry['level'],
    message: string,
    category: string,
    data?: Record<string, unknown>
  ): LogEntry {
    return {
      level,
      message,
      category,
      data,
      timestamp: new Date().toISOString(),
      userId: localStorage.getItem('userId') || undefined,
      sessionId: localStorage.getItem('sessionId') || undefined,
      context: this.getContext(),
    };
  }

  private setupPeriodicFlush(): void {
    setInterval(() => {
      this.flushLogs();
    }, this.flushInterval);
  }

  private async flushLogs(): Promise<void> {
    if (this.logQueue.length === 0) return;

    try {
      // In development, just log to console and clear queue
      if (import.meta.env.DEV) {
        console.log('Logs that would be sent to server:', this.logQueue);
        this.logQueue = [];
        return;
      }
      
      // Only in production try to send logs to server
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.logQueue),
      });
      this.logQueue = [];
    } catch (error) {
      console.error('Failed to flush logs:', error);
      // Clear queue even if there's an error to prevent buildup
      this.logQueue = [];
    }
  }

  private addToQueue(entry: LogEntry): void {
    this.logQueue.push(entry);

    // Log to console in development
    if (import.meta.env.DEV) {
      const consoleMethod = entry.level === 'error' ? 'error' : 
                           entry.level === 'warn' ? 'warn' : 
                           entry.level === 'debug' ? 'debug' : 'log';
      console[consoleMethod](`[${entry.category}] ${entry.message}`, entry.data || '');
    }

    if (this.logQueue.length >= this.maxQueueSize) {
      this.flushLogs();
    }
  }

  // Public logging methods
  public info(message: string, category: string, data?: Record<string, unknown>): void {
    this.addToQueue(this.createLogEntry('info', message, category, data));
  }

  public warn(message: string, category: string, data?: Record<string, unknown>): void {
    this.addToQueue(this.createLogEntry('warn', message, category, data));
  }

  public error(message: string, category: string, data?: Record<string, unknown>): void {
    this.addToQueue(this.createLogEntry('error', message, category, data));
  }

  public debug(message: string, category: string, data?: Record<string, unknown>): void {
    if (import.meta.env.DEV) {
      this.addToQueue(this.createLogEntry('debug', message, category, data));
    }
  }

  // Specialized logging methods
  public logUserAction(action: string, data?: Record<string, unknown>): void {
    this.info(action, 'user-action', data);
  }

  public logNavigation(from: string, to: string): void {
    this.info('Navigation', 'routing', { from, to });
  }

  public logApiRequest(method: string, url: string, data?: Record<string, unknown>): void {
    this.debug(`API ${method} ${url}`, 'api-request', data);
  }

  public logApiResponse(method: string, url: string, status: number, data?: Record<string, unknown>): void {
    this.debug(`API ${method} ${url} (${status})`, 'api-response', data);
  }

  public logPerformance(metric: string, value: number, data?: Record<string, unknown>): void {
    this.info(`Performance: ${metric}`, 'performance', { ...data, value });
  }
}

export const logger = Logger.getInstance();