// src/app/features/admin/shared/components/admin-chart/admin-chart.component.ts

import { Component, Input, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
}

export interface ChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  plugins?: any;
  scales?: any;
  animation?: any;
}

@Component({
  standalone: true,
  selector: 'app-admin-chart',
  templateUrl: './admin-chart.component.html',
  styleUrls: ['./admin-chart.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    FormsModule
  ]
})
export class AdminChartComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;

  @Input() title: string = '';
  @Input() chartData: ChartData | null = null;
  @Input() chartType: 'line' | 'bar' | 'doughnut' | 'pie' | 'area' = 'line';
  @Input() height: number = 300;
  @Input() loading: boolean = false;
  @Input() options: ChartOptions = {};
  @Input() showTypeSelector: boolean = false;
  @Input() showRefreshButton: boolean = false;
  @Input() colors: string[] = [
    '#8B2E2E', '#D9744F', '#F5E4D7', '#2E7D8B', '#4FD994',
    '#E48B2E', '#8B2E7D', '#2E8B57', '#8B452E', '#2E2E8B'
  ];

  private chart: any = null;
  private resizeObserver?: ResizeObserver;

  availableTypes = [
    { value: 'line', label: 'Ligne', icon: 'show_chart' },
    { value: 'bar', label: 'Barres', icon: 'bar_chart' },
    { value: 'doughnut', label: 'Anneau', icon: 'donut_small' },
    { value: 'pie', label: 'Camembert', icon: 'pie_chart' },
    { value: 'area', label: 'Aire', icon: 'area_chart' }
  ];

  ngOnInit() {
    // Initialisation des options par défaut
    this.setDefaultOptions();
  }

  ngAfterViewInit() {
    this.initializeChart();
    this.setupResizeObserver();
  }

  ngOnDestroy() {
    this.destroyChart();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  ngOnChanges() {
    if (this.chart && this.chartData) {
      this.updateChart();
    }
  }

  private setDefaultOptions() {
    const defaultOptions: ChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        }
      },
      scales: this.chartType === 'line' || this.chartType === 'bar' ? {
        x: {
          display: true,
          grid: {
            color: 'rgba(0,0,0,0.1)'
          }
        },
        y: {
          display: true,
          grid: {
            color: 'rgba(0,0,0,0.1)'
          },
          beginAtZero: true
        }
      } : undefined,
      animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
      }
    };

    this.options = { ...defaultOptions, ...this.options };
  }

  private async initializeChart() {
    if (!this.chartCanvas || !this.chartData) return;

    try {
      // Pour le moment, on utilise un canvas simple
      // Chart.js sera ajouté plus tard via npm install
      const ctx = this.chartCanvas.nativeElement.getContext('2d');
      if (!ctx) return;

      this.destroyChart();
      
      // Dessiner un graphique simple pour la démonstration
      this.drawSimpleChart(ctx);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du graphique:', error);
    }
  }

  private drawSimpleChart(ctx: CanvasRenderingContext2D) {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    
    // Nettoyer le canvas
    ctx.clearRect(0, 0, width, height);
    
    // Dessiner un graphique simple basé sur le type
    ctx.fillStyle = this.colors[0];
    ctx.strokeStyle = this.colors[0];
    ctx.lineWidth = 2;
    
    if (this.chartType === 'bar') {
      this.drawSimpleBars(ctx, width, height);
    } else {
      this.drawSimpleLine(ctx, width, height);
    }
  }

  private drawSimpleBars(ctx: CanvasRenderingContext2D, width: number, height: number) {
    if (!this.chartData) return;
    
    const barWidth = width / this.chartData.labels.length * 0.6;
    const maxValue = Math.max(...this.chartData.datasets[0].data);
    
    this.chartData.datasets[0].data.forEach((value, index) => {
      const x = (width / this.chartData!.labels.length) * index + (width / this.chartData!.labels.length - barWidth) / 2;
      const barHeight = (value / maxValue) * (height * 0.8);
      const y = height - barHeight - 20;
      
      ctx.fillRect(x, y, barWidth, barHeight);
    });
  }

  private drawSimpleLine(ctx: CanvasRenderingContext2D, width: number, height: number) {
    if (!this.chartData) return;
    
    const points = this.chartData.datasets[0].data;
    const maxValue = Math.max(...points);
    
    ctx.beginPath();
    points.forEach((value, index) => {
      const x = (width / (points.length - 1)) * index;
      const y = height - (value / maxValue) * (height * 0.8) - 20;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
  }

  private processChartData(): ChartData {
    if (!this.chartData) return { labels: [], datasets: [] };

    const processedData = { ...this.chartData };
    
    // Appliquer les couleurs automatiquement si elles ne sont pas définies
    processedData.datasets = processedData.datasets.map((dataset, index) => ({
      ...dataset,
      backgroundColor: dataset.backgroundColor || this.getColor(index, 0.7),
      borderColor: dataset.borderColor || this.getColor(index, 1),
      borderWidth: dataset.borderWidth || 2,
      fill: this.chartType === 'area' ? true : (dataset.fill || false)
    }));

    return processedData;
  }

  private getColor(index: number, opacity: number = 1): string {
    const color = this.colors[index % this.colors.length];
    
    // Convertir hex vers rgba si nécessaire
    if (color.startsWith('#')) {
      const hex = color.substring(1);
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    return color;
  }

  private updateChart() {
    if (!this.chart || !this.chartData) return;

    this.chart.data = this.processChartData();
    this.chart.options = this.options;
    this.chart.update('active');
  }

  private destroyChart() {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  private setupResizeObserver() {
    if (typeof ResizeObserver !== 'undefined' && this.chartCanvas) {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.chart) {
          this.chart.resize();
        }
      });

      this.resizeObserver.observe(this.chartCanvas.nativeElement.parentElement || this.chartCanvas.nativeElement);
    }
  }

  onChartTypeChange() {
    this.setDefaultOptions();
    this.initializeChart();
  }

  onRefresh() {
    if (this.chart) {
      this.loading = true;
      
      // Simuler un rechargement
      setTimeout(() => {
        this.updateChart();
        this.loading = false;
      }, 1000);
    }
  }

  exportChart(format: 'png' | 'jpg' = 'png') {
    if (!this.chart) return;

    const link = document.createElement('a');
    link.download = `chart-${Date.now()}.${format}`;
    link.href = this.chart.toBase64Image();
    link.click();
  }

  // Méthodes utilitaires pour créer des données de test
  static createSampleLineData(): ChartData {
    return {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
      datasets: [{
        label: 'Ventes',
        data: [65, 59, 80, 81, 56, 55],
      }]
    };
  }

  static createSampleBarData(): ChartData {
    return {
      labels: ['Prod A', 'Prod B', 'Prod C', 'Prod D'],
      datasets: [{
        label: 'Quantité vendue',
        data: [12, 19, 3, 5],
      }]
    };
  }
}
