import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

export interface KPIData {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: {
    value: number;
    percentage: number;
    direction: 'up' | 'down' | 'stable';
  };
  subtitle?: string;
}

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatCardModule],
  template: `
    <mat-card class="kpi-card" [style.border-left-color]="data.color">
      <div class="kpi-content">
        <div class="kpi-icon" [style.background-color]="data.color + '20'">
          <mat-icon [style.color]="data.color">{{ data.icon }}</mat-icon>
        </div>
        <div class="kpi-info">
          <div class="kpi-title">{{ data.title }}</div>
          <div class="kpi-value">{{ data.value }}</div>
          @if (data.trend) {
            <div class="kpi-trend" [ngClass]="'trend-' + data.trend.direction">
              <mat-icon>{{ getTrendIcon(data.trend.direction) }}</mat-icon>
              <span>{{ data.trend.percentage }}%</span>
            </div>
          }
          @if (data.subtitle) {
            <div class="kpi-subtitle">{{ data.subtitle }}</div>
          }
        </div>
      </div>
    </mat-card>
  `,
  styleUrls: ['./kpi-card.component.scss']
})
export class KPICardComponent {
  @Input() data!: KPIData;

  getTrendIcon(direction: string): string {
    switch (direction) {
      case 'up': return 'trending_up';
      case 'down': return 'trending_down';
      default: return 'trending_flat';
    }
  }
}
