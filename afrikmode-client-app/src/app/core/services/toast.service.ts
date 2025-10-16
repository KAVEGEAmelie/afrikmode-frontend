import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  private defaultDuration = 3000; // 3 secondes

  success(message: string, duration?: number): void {
    this.show({
      type: 'success',
      message,
      duration,
      icon: '✓'
    });
  }

  error(message: string, duration?: number): void {
    this.show({
      type: 'error',
      message,
      duration: duration || 5000, // 5 secondes pour les erreurs
      icon: '✕'
    });
  }

  warning(message: string, duration?: number): void {
    this.show({
      type: 'warning',
      message,
      duration,
      icon: '⚠'
    });
  }

  info(message: string, duration?: number): void {
    this.show({
      type: 'info',
      message,
      duration,
      icon: 'ℹ'
    });
  }

  private show(toast: Omit<Toast, 'id'>): void {
    const id = this.generateId();
    const newToast: Toast = {
      id,
      ...toast,
      duration: toast.duration || this.defaultDuration
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, newToast]);

    // Auto-remove après la durée spécifiée
    setTimeout(() => {
      this.remove(id);
    }, newToast.duration);
  }

  remove(id: string): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(t => t.id !== id));
  }

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
