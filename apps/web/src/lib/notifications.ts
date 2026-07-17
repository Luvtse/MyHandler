import { toast } from 'sonner';
import { logger } from './logger';
import { errorHandler } from './error-handler';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
  category?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  sound: boolean;
  categories: Record<string, boolean>;
}

class NotificationService {
  private static instance: NotificationService;
  private notifications: Map<string, Notification>;
  private preferences: NotificationPreferences;
  private readonly maxNotifications = 100;

  private constructor() {
    this.notifications = new Map();
    this.preferences = this.loadPreferences();
    this.setupPushNotifications();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async setupPushNotifications(): Promise<void> {
    if (!('Notification' in window)) return;

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        logger.info('Push notifications enabled', 'notifications');
      }
    } catch (error) {
      errorHandler.handleError(error);
    }
  }

  private loadPreferences(): NotificationPreferences {
    const defaultPreferences: NotificationPreferences = {
      email: true,
      push: true,
      inApp: true,
      sound: true,
      categories: {
        system: true,
        shipments: true,
        account: true,
        billing: true,
      },
    };

    try {
      const stored = localStorage.getItem('notification_preferences');
      return stored ? { ...defaultPreferences, ...JSON.parse(stored) } : defaultPreferences;
    } catch (error) {
      errorHandler.handleError(error);
      return defaultPreferences;
    }
  }

  private savePreferences(): void {
    try {
      localStorage.setItem('notification_preferences', JSON.stringify(this.preferences));
    } catch (error) {
      errorHandler.handleError(error);
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private cleanupOldNotifications(): void {
    if (this.notifications.size > this.maxNotifications) {
      const sortedNotifications = Array.from(this.notifications.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp);

      const toDelete = sortedNotifications.slice(0, sortedNotifications.length - this.maxNotifications);
      toDelete.forEach(([id]) => this.notifications.delete(id));
    }
  }

  public async send({
    type = 'info',
    title,
    message,
    category = 'system',
    actionUrl,
    metadata,
  }: Omit<Notification, 'id' | 'timestamp' | 'read'>): Promise<string> {
    try {
      const id = this.generateId();
      const notification: Notification = {
        id,
        type,
        title,
        message,
        timestamp: Date.now(),
        read: false,
        category,
        actionUrl,
        metadata,
      };

      this.notifications.set(id, notification);
      this.cleanupOldNotifications();

      // Log the notification
      logger.info('Notification sent', 'notifications', {
        id,
        type,
        title,
        category,
      });

      // Show in-app notification if enabled
      if (this.preferences.inApp) {
        this.showToast(notification);
      }

      // Send push notification if enabled
      if (this.preferences.push && 'Notification' in window) {
        this.sendPushNotification(notification);
      }

      return id;
    } catch (error) {
      errorHandler.handleError(error);
      throw error;
    }
  }

  private showToast(notification: Notification): void {
    const toastFn = {
      info: toast.info,
      success: toast.success,
      warning: toast.warning,
      error: toast.error,
    }[notification.type];

    toastFn(notification.title, {
      description: notification.message,
      duration: 5000,
      action: notification.actionUrl ? {
        label: 'View',
        onClick: () => window.location.href = notification.actionUrl!,
      } : undefined,
    });
  }

  private async sendPushNotification(notification: Notification): Promise<void> {
    if (Notification.permission !== 'granted') return;

    try {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.png',
        tag: notification.id,
        data: {
          url: notification.actionUrl,
        },
      });
    } catch (error) {
      errorHandler.handleError(error);
    }
  }

  public getAll(): Notification[] {
    return Array.from(this.notifications.values())
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  public getUnread(): Notification[] {
    return this.getAll().filter(notification => !notification.read);
  }

  public getByCategory(category: string): Notification[] {
    return this.getAll().filter(notification => notification.category === category);
  }

  public markAsRead(id: string): void {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.read = true;
      this.notifications.set(id, notification);
    }
  }

  public markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
  }

  public remove(id: string): void {
    this.notifications.delete(id);
  }

  public clear(): void {
    this.notifications.clear();
  }

  public updatePreferences(preferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
    this.savePreferences();
  }

  public getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }
}

export const notificationService = NotificationService.getInstance();