import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bar-chart-container">
      <div class="bar-chart-header">
        <h3 class="bar-chart-title">{{ title }}</h3>
      </div>
      <div class="bar-chart-content">
        <div class="bar-chart-wrapper">
          @for (item of data; track item.label; let i = $index) {
            <div class="bar-item">
              <div class="bar-container">
                <div 
                  class="bar" 
                  [style.height.%]="getBarHeight(item.value)"
                  [style.background-color]="item.color || getDefaultColor(i)">
                </div>
                <span class="bar-value">{{ formatValue(item.value) }}</span>
              </div>
              <span class="bar-label">{{ item.label }}</span>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent {
  @Input() title: string = '';
  @Input() data: BarChartData[] = [];
  @Input() maxValue?: number;
  @Input() valueFormatter?: (value: number) => string;

  private defaultColors = [
    '#5B5FED',
    '#7C3AED', 
    '#EC4899',
    '#06B6D4',
    '#F59E0B',
    '#10B981'
  ];

  getBarHeight(value: number): number {
    const max = this.maxValue || Math.max(...this.data.map(d => d.value));
    return (value / max) * 100;
  }

  getDefaultColor(index: number): string {
    return this.defaultColors[index % this.defaultColors.length];
  }

  formatValue(value: number): string {
    if (this.valueFormatter) {
      return this.valueFormatter(value);
    }
    return value.toString();
  }
}
