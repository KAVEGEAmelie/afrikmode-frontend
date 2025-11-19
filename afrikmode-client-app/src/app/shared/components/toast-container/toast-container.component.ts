import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toasts$ | async"
           class="toast toast-{{toast.type}}">
        <div class="toast-icon">{{toast.icon}}</div>
        <div class="toast-message">{{toast.message}}</div>
        <button class="toast-close" (click)="close(toast.id)">&times;</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 80px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      border-radius: 12px;
      background: white;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      border-left: 4px solid;
      animation: slideInRight 0.3s ease-out;
      min-width: 300px;
      max-width: 400px;
    }

    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast-success {
      border-left-color: #10b981;
      background: linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%);
    }

    .toast-success .toast-icon {
      color: #10b981;
      font-size: 24px;
      font-weight: bold;
    }

    .toast-error {
      border-left-color: #ef4444;
      background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
    }

    .toast-error .toast-icon {
      color: #ef4444;
      font-size: 24px;
      font-weight: bold;
    }

    .toast-warning {
      border-left-color: #f59e0b;
      background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
    }

    .toast-warning .toast-icon {
      color: #f59e0b;
      font-size: 24px;
      font-weight: bold;
    }

    .toast-info {
      border-left-color: #3b82f6;
      background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
    }

    .toast-info .toast-icon {
      color: #3b82f6;
      font-size: 24px;
      font-weight: bold;
    }

    .toast-message {
      flex: 1;
      color: #374151;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.5;
    }

    .toast-close {
      background: none;
      border: none;
      color: #9ca3af;
      font-size: 24px;
      cursor: pointer;
      padding: 0;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
    }

    .toast-close:hover {
      color: #374151;
    }

    @media (max-width: 640px) {
      .toast-container {
        right: 10px;
        left: 10px;
        max-width: none;
      }

      .toast {
        min-width: auto;
        max-width: none;
      }
    }
  `]
})
export class ToastContainerComponent {
  toasts$: Observable<Toast[]>;

  constructor(private toastService: ToastService) {
    this.toasts$ = this.toastService.toasts$;
  }

  close(id: string): void {
    this.toastService.remove(id);
  }
}
