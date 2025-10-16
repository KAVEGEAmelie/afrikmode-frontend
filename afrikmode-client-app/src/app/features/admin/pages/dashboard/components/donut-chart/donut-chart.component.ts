import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DonutData {
  label: string;
  value: number;
  color: string;
  percentage?: number;
}

@Component({
  selector: 'app-donut-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="donut-chart-container">
      <div class="donut-chart-header">
        <h3 class="donut-title">{{ title }}</h3>
      </div>
      <div class="donut-chart-wrapper">
        <svg class="donut-chart" viewBox="0 0 200 200">
          <circle
            class="donut-background"
            cx="100"
            cy="100"
            r="80"
            fill="none"
            stroke="#e5e7eb"
            stroke-width="20"
          />
          @for (segment of segments; track segment.label; let i = $index) {
            <circle
              class="donut-segment"
              cx="100"
              cy="100"
              r="80"
              fill="none"
              [attr.stroke]="segment.color"
              stroke-width="20"
              [attr.stroke-dasharray]="segment.dashArray"
              [attr.stroke-dashoffset]="segment.dashOffset"
              [attr.transform]="'rotate(' + segment.rotation + ' 100 100)'"
            />
          }
        </svg>
        <div class="donut-center">
          <div class="donut-total">{{ totalValue }}</div>
          <div class="donut-label">Total</div>
        </div>
      </div>
      <div class="donut-legend">
        @for (item of data; track item.label) {
          <div class="legend-item">
            <div class="legend-color" [style.background-color]="item.color"></div>
            <span class="legend-label">{{ item.label }}</span>
            <span class="legend-value">{{ item.value }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styleUrls: ['./donut-chart.component.scss']
})
export class DonutChartComponent implements OnInit {
  @Input() title: string = '';
  @Input() data: DonutData[] = [];
  @Input() totalValue: string | number = 0;

  segments: any[] = [];

  ngOnInit() {
    this.calculateSegments();
  }

  private calculateSegments() {
    const total = this.data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;

    this.segments = this.data.map((item, index) => {
      const percentage = (item.value / total) * 100;
      const circumference = 2 * Math.PI * 80; // radius = 80
      const dashArray = `${(percentage / 100) * circumference} ${circumference}`;
      const dashOffset = -cumulativePercentage * circumference / 100;
      const rotation = cumulativePercentage * 3.6; // 360 degrees / 100%

      cumulativePercentage += percentage;

      return {
        ...item,
        percentage,
        dashArray,
        dashOffset,
        rotation
      };
    });
  }
}
