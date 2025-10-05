/**
 * Simple toast notification system
 * A lightweight toast implementation until we add a full UI library
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

class ToastManager {
  private toasts: Toast[] = [];
  private listeners: Array<(toasts: Toast[]) => void> = [];

  subscribe(listener: (toasts: Toast[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.toasts]));
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  show(type: ToastType, message: string, duration: number = 5000): string {
    const id = this.generateId();
    const toast: Toast = { id, type, message, duration };
    
    this.toasts.push(toast);
    this.notify();

    if (duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, duration);
    }

    return id;
  }

  success(message: string, duration?: number): string {
    return this.show('success', message, duration);
  }

  error(message: string, duration?: number): string {
    return this.show('error', message, duration);
  }

  warning(message: string, duration?: number): string {
    return this.show('warning', message, duration);
  }

  info(message: string, duration?: number): string {
    return this.show('info', message, duration);
  }

  dismiss(id: string): void {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.notify();
  }

  clear(): void {
    this.toasts = [];
    this.notify();
  }
}

export const toastManager = new ToastManager();