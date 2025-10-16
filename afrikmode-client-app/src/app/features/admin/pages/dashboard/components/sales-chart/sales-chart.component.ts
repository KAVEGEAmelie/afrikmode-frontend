// src/app/features/admin/pages/dashboard/components/sales-chart/sales-chart.component.ts

import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SalesData {
  label: string;
  value: number;
}

@Component({
  selector: 'app-sales-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-chart.component.html',
  styleUrls: ['./sales-chart.component.scss']
})
export class SalesChartComponent implements OnInit, AfterViewInit {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  
  salesData: SalesData[] = [];
  loading = true;
  maxValue = 0;

  ngOnInit(): void {
    this.loadSalesData();
  }

  ngAfterViewInit(): void {
    if (!this.loading) {
      this.drawChart();
    }
  }

  loadSalesData(): void {
    // Simulation de données - À remplacer par un vrai service
    setTimeout(() => {
      this.salesData = [
        { label: 'Jan', value: 45000 },
        { label: 'Fév', value: 52000 },
        { label: 'Mar', value: 48000 },
        { label: 'Avr', value: 61000 },
        { label: 'Mai', value: 55000 },
        { label: 'Jun', value: 67000 },
        { label: 'Jul', value: 72000 },
        { label: 'Aoû', value: 68000 },
        { label: 'Sep', value: 75000 },
        { label: 'Oct', value: 82000 },
        { label: 'Nov', value: 78000 },
        { label: 'Déc', value: 85000 }
      ];
      this.maxValue = Math.max(...this.salesData.map(d => d.value));
      this.loading = false;
      
      setTimeout(() => this.drawChart(), 100);
    }, 500);
  }

  drawChart(): void {
    const canvas = this.chartCanvas?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw grid lines
    ctx.strokeStyle = '#F0F0F0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Draw bars
    const barWidth = chartWidth / this.salesData.length - 10;
    const barSpacing = 10;

    this.salesData.forEach((data, index) => {
      const barHeight = (data.value / this.maxValue) * chartHeight;
      const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
      const y = height - padding - barHeight;

      // Gradient
      const gradient = ctx.createLinearGradient(0, y, 0, height - padding);
      gradient.addColorStop(0, '#8B2E2E');
      gradient.addColorStop(1, '#B33939');

      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Label
      ctx.fillStyle = '#757575';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(data.label, x + barWidth / 2, height - padding + 20);
    });
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(value);
  }

  get totalSales(): number {
    return this.salesData.reduce((sum, d) => sum + d.value, 0);
  }

  get averageSales(): number {
    if (this.salesData.length === 0) return 0;
    return this.totalSales / this.salesData.length;
  }
}