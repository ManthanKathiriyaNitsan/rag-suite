/**
 * Notification Service
 * Centralized notification management
 */

interface NotificationConfig {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  duration?: number;
  maxNotifications?: number;
  enableSounds?: boolean;
}

interface Notification {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
  timestamp: number;
}

class NotificationService {
  private config: NotificationConfig;
  private notifications: Notification[] = [];
  private listeners: Array<(notifications: Notification[]) => void> = [];

  constructor(config: NotificationConfig = {}) {
    this.config = {
      position: 'top-right',
      duration: 5000,
      maxNotifications: 5,
      enableSounds: true,
      ...config
    };
  }

  // Core Methods
  show(notification: Omit<Notification, 'id' | 'timestamp'>): string {
    const id = this.generateId();
    const fullNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now()
    };

    this.addNotification(fullNotification);
    this.playSound(notification.type);
    this.notifyListeners();

    // Auto-remove after duration
    if (notification.duration !== 0) {
      const duration = notification.duration || this.config.duration || 5000;
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return id;
  }

  // Convenience Methods
  success(title: string, message?: string, options?: Partial<Notification>): string {
    return this.show({
      title,
      message,
      type: 'success',
      ...options
    });
  }

  error(title: string, message?: string, options?: Partial<Notification>): string {
    return this.show({
      title,
      message,
      type: 'error',
      duration: 0, // Errors don't auto-dismiss
      ...options
    });
  }

  warning(title: string, message?: string, options?: Partial<Notification>): string {
    return this.show({
      title,
      message,
      type: 'warning',
      ...options
    });
  }

  info(title: string, message?: string, options?: Partial<Notification>): string {
    return this.show({
      title,
      message,
      type: 'info',
      ...options
    });
  }

  // Management Methods
  remove(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  clear(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  clearByType(type: Notification['type']): void {
    this.notifications = this.notifications.filter(n => n.type !== type);
    this.notifyListeners();
  }

  // Getters
  getAll(): Notification[] {
    return [...this.notifications];
  }

  getByType(type: Notification['type']): Notification[] {
    return this.notifications.filter(n => n.type === type);
  }

  getCount(): number {
    return this.notifications.length;
  }

  getCountByType(type: Notification['type']): number {
    return this.notifications.filter(n => n.type === type).length;
  }

  // Event Listeners
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Configuration
  setConfig(config: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Private Methods
  private addNotification(notification: Notification): void {
    this.notifications.unshift(notification); // Add to beginning

    // Limit notifications
    if (this.notifications.length > (this.config.maxNotifications || 5)) {
      this.notifications = this.notifications.slice(0, this.config.maxNotifications || 5);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private playSound(type: Notification['type']): void {
    if (!this.config.enableSounds) return;

    try {
      // Create audio context for notification sounds
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Different frequencies for different types
      const frequencies = {
        success: 800,
        error: 400,
        warning: 600,
        info: 500
      };

      oscillator.frequency.setValueAtTime(frequencies[type], audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }
}

export const notificationService = new NotificationService();
