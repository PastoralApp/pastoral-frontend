import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private messages = signal<ToastMessage[]>([]);
  public readonly toasts = this.messages.asReadonly();

  show(type: ToastType, message: string, duration: number = 5000): void {
    const toast: ToastMessage = {
      id: this.generateId(),
      type,
      message,
      duration
    };

    this.messages.update(messages => [...messages, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(toast.id), duration);
    }
  }

  success(message: string, duration?: number): void {
    this.show('success', message, duration);
  }

  error(message: string, duration?: number): void {
    this.show('error', message, duration || 8000); // Erros ficam mais tempo
  }

  warning(message: string, duration?: number): void {
    this.show('warning', message, duration);
  }

  info(message: string, duration?: number): void {
    this.show('info', message, duration);
  }

  remove(id: string): void {
    this.messages.update(messages => messages.filter(m => m.id !== id));
  }

  clear(): void {
    this.messages.set([]);
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}