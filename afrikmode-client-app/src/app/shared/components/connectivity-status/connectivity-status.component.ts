// src/app/shared/components/connectivity-status/connectivity-status.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ConnectivityService } from '../../../core/services/connectivity.service';

@Component({
  selector: 'app-connectivity-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="connectivity-status" [ngClass]="statusClass" (click)="toggleDetails()">
      <div class="status-indicator">
        <div class="indicator-dot" [ngClass]="indicatorClass"></div>
        <span class="status-text">{{ statusText }}</span>
      </div>
      
      @if (showDetails) {
        <div class="status-details">
          <div class="detail-item">
            <strong>Backend:</strong> {{ backendStatus }}
          </div>
          @if (lastCheck) {
            <div class="detail-item">
              <strong>Dernière vérification:</strong> {{ lastCheck | date:'short' }}
            </div>
          }
        </div>
      }
    </div>
  `,
  styleUrls: ['./connectivity-status.component.scss']
})
export class ConnectivityStatusComponent implements OnInit, OnDestroy {
  isConnected = false;
  showDetails = false;
  lastCheck?: Date;
  private subscription?: Subscription;

  constructor(private connectivityService: ConnectivityService) {}

  ngOnInit(): void {
    this.subscription = this.connectivityService.isConnected$.subscribe(
      connected => {
        this.isConnected = connected;
        this.lastCheck = new Date();
      }
    );

    // Test initial
    this.testConnection();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  get statusClass(): string {
    return this.isConnected ? 'connected' : 'disconnected';
  }

  get indicatorClass(): string {
    return this.isConnected ? 'online' : 'offline';
  }

  get statusText(): string {
    return this.isConnected ? 'En ligne' : 'Hors ligne';
  }

  get backendStatus(): string {
    return this.isConnected ? 'Connecté' : 'Non accessible';
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  testConnection(): void {
    this.connectivityService.checkHealth().subscribe({
      next: (response) => {
        console.log('Test de connexion réussi:', response);
      },
      error: (error) => {
        console.error('Test de connexion échoué:', error);
      }
    });
  }
}