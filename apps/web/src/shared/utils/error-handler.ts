import { AxiosError } from 'axios';
import { toast } from 'sonner';

export interface ErrorDetails {
  code: string;
  message: string;
  timestamp: string;
  path?: string;
  stack?: string;
  context?: Record<string, unknown>;
}

export interface ErrorLogEntry extends ErrorDetails {
  userId?: string;
  sessionId?: string;
  browserInfo?: string;
  severity: 'error' | 'warning' | 'info';
}

class ErrorHandler {
  private static instance: ErrorHandler;
  private logQueue: ErrorLogEntry[] = [];
  private readonly maxQueueSize = 50;
  private readonly flushInterval = 5000; // 5 seconds

  private constructor() {
    this.setupPeriodicFlush();
    this.setupWindowErrorListener();
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  private getBrowserInfo(): string {
    return `${navigator.userAgent} | ${window.innerWidth}x${window.innerHeight}`;
  }

  private setupWindowErrorListener(): void {
    window.addEventListener('error', (event) => {
      this.handleError(event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason);
    });
  }

  private setupPeriodicFlush(): void {
    setInterval(() => {
      this.flushLogs();
    }, this.flushInterval);
  }

  private async flushLogs(): Promise<void> {
    if (this.logQueue.length === 0) return;

    try {
      const endpoint = import.meta.env.VITE_LOGS_ENDPOINT as string | undefined;
      if (!endpoint) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('VITE_LOGS_ENDPOINT is not configured. Skipping log flush.');
        }
        return;
      }

      const payload = JSON.stringify(this.logQueue);

      const maxAttempts = 3;
      let attempt = 0;
      let lastError: unknown = null;
      while (attempt < maxAttempts) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
          });
          if (!res.ok) throw new Error(`Log flush failed: ${res.status}`);
          this.logQueue = [];
          break;
        } catch (err) {
          lastError = err;
          attempt++;
          const backoff = Math.min(1000 * 2 ** attempt, 5000);
          await new Promise((r) => setTimeout(r, backoff));
        }
      }
      if (attempt === maxAttempts) throw lastError;
    } catch (error) {
      console.error('Failed to flush error logs:', error);
    }
  }

  public handleError(error: unknown, context?: Record<string, unknown>): void {
    const errorDetails = this.normalizeError(error, context);
    this.logError(errorDetails);
    this.showErrorNotification(errorDetails);
  }

  private normalizeError(error: unknown, context?: Record<string, unknown>): ErrorDetails {
    if (error instanceof AxiosError) {
      return {
        code: error.code || 'NETWORK_ERROR',
        message: error.response?.data?.message || error.message,
        timestamp: new Date().toISOString(),
        path: error.config?.url,
        stack: error.stack,
        context,
      };
    }

    if (error instanceof Error) {
      return {
        code: 'APP_ERROR',
        message: error.message,
        timestamp: new Date().toISOString(),
        stack: error.stack,
        context,
      };
    }

    return {
      code: 'UNKNOWN_ERROR',
      message: String(error),
      timestamp: new Date().toISOString(),
      context,
    };
  }

  private logError(errorDetails: ErrorDetails): void {
    const sanitizedContext = this.sanitizeContext(errorDetails.context);
    const logEntry: ErrorLogEntry = {
      ...errorDetails,
      context: sanitizedContext,
      userId: localStorage.getItem('userId') || undefined,
      sessionId: localStorage.getItem('sessionId') || undefined,
      browserInfo: this.getBrowserInfo(),
      severity: 'error',
    };

    this.logQueue.push(logEntry);

    if (this.logQueue.length >= this.maxQueueSize) {
      this.flushLogs();
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', logEntry);
    }
  }

  private sanitizeContext(context?: Record<string, unknown>): Record<string, unknown> | undefined {
    if (!context) return context;

    const sensitiveKeys = ['password', 'token', 'authorization', 'auth', 'ssn'];

    const redact = (value: unknown): unknown => {
      if (value === null || value === undefined) return value;
      if (typeof value === 'string') {
        if (value.length > 5000) return value.slice(0, 5000);
        return value;
      }
      if (Array.isArray(value)) return value.map(redact);
      if (typeof value === 'object') {
        const obj = value as Record<string, unknown>;
        const result: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(obj)) {
          if (sensitiveKeys.includes(k.toLowerCase())) {
            result[k] = '[REDACTED]';
          } else {
            result[k] = redact(v);
          }
        }
        return result;
      }
      return value;
    };

    return redact(context) as Record<string, unknown>;
  }

  private showErrorNotification(errorDetails: ErrorDetails): void {
    const message = this.getDisplayMessage(errorDetails);
    toast.error(message, {
      description: errorDetails.code,
      duration: 5000,
    });
  }

  private getDisplayMessage(errorDetails: ErrorDetails): string {
    // Customize error messages based on error codes or types
    switch (errorDetails.code) {
      case 'NETWORK_ERROR':
        return 'Unable to connect to the server. Please check your internet connection.';
      case 'UNAUTHORIZED':
        return 'Your session has expired. Please log in again.';
      case 'FORBIDDEN':
        return 'You do not have permission to perform this action.';
      case 'NOT_FOUND':
        return 'The requested resource was not found.';
      default:
        return errorDetails.message || 'An unexpected error occurred.';
    }
  }
}

export const errorHandler = ErrorHandler.getInstance();