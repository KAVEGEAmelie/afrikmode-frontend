// src/app/features/admin/shared/components/stats-card/stats-card.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StatCardColor = 'primary' | 'accent' | 'warn' | 'success' | 'warning' | 'danger' | 'info';

export interface CardGrowth {
  value: number;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-card.component.html',
  styleUrls: ['./stats-card.component.scss']
})
export class StatsCardComponent {
  @Input() title: string = '';
  @Input() value: string | number = 0;
  @Input() icon: string = 'analytics';
  @Input() color: StatCardColor = 'primary';
  @Input() growth?: CardGrowth;
  @Input() subtitle?: string;
  @Input() loading: boolean = false;
  @Input() clickable: boolean = false;

  get cardColorClass(): string {
    return `card-${this.color}`;
  }

  get iconColorClass(): string {
    return `icon-${this.color}`;
  }

  getGrowthIcon(): string {
    if (!this.growth) return '';
    
    switch (this.growth.trend) {
      case 'up': return 'trending_up';
      case 'down': return 'trending_down';
      default: return 'trending_flat';
    }
  }

  getGrowthClass(): string {
    if (!this.growth) return '';
    
    switch (this.growth.trend) {
      case 'up': return 'growth-positive';
      case 'down': return 'growth-negative';
      default: return 'growth-stable';
    }
  }

  getFormattedGrowthPercentage(): string {
    if (!this.growth) return '';
    const sign = this.growth.percentage > 0 ? '+' : '';
    return `${sign}${this.growth.percentage}%`;
  }

  getFormattedGrowthValue(): string {
    if (!this.growth) return '';
    const sign = this.growth.value > 0 ? '+' : '';
    return `${sign}${this.growth.value}`;
  }
}