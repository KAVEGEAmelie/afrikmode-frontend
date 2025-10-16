// src/app/features/orders/components/order-tracking/order-tracking.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../../core/services/order.service';
import { Order, TrackingInfo, TrackingUpdate } from '../../../../core/models/order.model';

interface TrackingStep {
  id: string;
  label: string;
  icon: string;
  status: 'completed' | 'active' | 'pending';
  date?: string;
}

@Component({
  selector: 'app-order-tracking',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor],
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.scss']
})
export class OrderTrackingComponent implements OnInit {
  
  order: Order | null = null;
  trackingInfo: TrackingInfo | null = null;
  isLoading = true;
  error: string | null = null;
  
  // Tracking steps for visual timeline
  trackingSteps: TrackingStep[] = [
    {
      id: 'order_placed',
      label: 'Commande passée',
      icon: 'fa-check-circle',
      status: 'pending'
    },
    {
      id: 'order_confirmed',
      label: 'Commande confirmée',
      icon: 'fa-clipboard-check',
      status: 'pending'
    },
    {
      id: 'preparing',
      label: 'En préparation',
      icon: 'fa-box-open',
      status: 'pending'
    },
    {
      id: 'shipped',
      label: 'Expédiée',
      icon: 'fa-shipping-fast',
      status: 'pending'
    },
    {
      id: 'in_transit',
      label: 'En transit',
      icon: 'fa-truck',
      status: 'pending'
    },
    {
      id: 'out_for_delivery',
      label: 'En cours de livraison',
      icon: 'fa-dolly',
      status: 'pending'
    },
    {
      id: 'delivered',
      label: 'Livrée',
      icon: 'fa-home',
      status: 'pending'
    }
  ];

  // Auto refresh interval
  private refreshInterval: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const orderId = params['id'];
      if (orderId) {
        this.loadOrderTracking(orderId);
        this.startAutoRefresh(orderId);
      }
    });
  }

  ngOnDestroy(): void {
    this.stopAutoRefresh();
  }

  loadOrderTracking(orderId: string): void {
    this.isLoading = true;
    this.error = null;

    // Load order details
    this.orderService.getOrder(orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.loadTrackingInfo(orderId);
      },
      error: (err) => {
        console.error('Error loading order:', err);
        this.error = 'Erreur lors du chargement de la commande';
        this.isLoading = false;
      }
    });
  }

  loadTrackingInfo(orderId: string): void {
    this.orderService.getTrackingInfo(orderId).subscribe({
      next: (trackingInfo) => {
        this.trackingInfo = trackingInfo;
        this.updateTrackingSteps();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading tracking info:', err);
        // If tracking info is not available, use order data
        if (this.order && this.order.tracking_info) {
          this.trackingInfo = this.order.tracking_info;
          this.updateTrackingSteps();
        }
        this.isLoading = false;
      }
    });
  }

  updateTrackingSteps(): void {
    if (!this.order) return;

    const status = this.order.status;
    const statusMap: { [key: string]: number } = {
      'pending': 0,
      'processing': 2,
      'shipped': 3,
      'delivered': 6,
      'cancelled': -1
    };

    const currentStepIndex = statusMap[status] || 0;

    this.trackingSteps = this.trackingSteps.map((step, index) => {
      if (index < currentStepIndex) {
        return { ...step, status: 'completed' as const };
      } else if (index === currentStepIndex) {
        return { ...step, status: 'active' as const };
      } else {
        return { ...step, status: 'pending' as const };
      }
    });

    // Add dates from tracking updates
    if (this.trackingInfo && this.trackingInfo.updates) {
      this.trackingInfo.updates.forEach(update => {
        const matchingStep = this.trackingSteps.find(step => 
          update.status.toLowerCase().includes(step.id) || 
          step.label.toLowerCase().includes(update.status.toLowerCase())
        );
        if (matchingStep && !matchingStep.date) {
          matchingStep.date = update.date;
        }
      });
    }
  }

  startAutoRefresh(orderId: string): void {
    // Refresh every 2 minutes if order is in transit
    if (this.order && (this.order.status === 'shipped' || this.order.status === 'processing')) {
      this.refreshInterval = setInterval(() => {
        this.loadTrackingInfo(orderId);
      }, 120000); // 2 minutes
    }
  }

  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  refreshTracking(): void {
    if (this.order) {
      this.loadTrackingInfo(this.order.id);
    }
  }

  goBack(): void {
    if (this.order) {
      this.router.navigate(['/orders', this.order.id]);
    } else {
      this.router.navigate(['/orders']);
    }
  }

  openTrackingUrl(): void {
    if (this.trackingInfo && this.trackingInfo.tracking_url) {
      window.open(this.trackingInfo.tracking_url, '_blank');
    }
  }

  contactSupport(): void {
    // Navigate to support page or open support modal
    window.location.href = 'mailto:support@afrikmode.com?subject=Problème de livraison - Commande ' + this.order?.order_number;
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      'pending': 'En attente',
      'processing': 'En préparation',
      'shipped': 'Expédiée',
      'delivered': 'Livrée',
      'cancelled': 'Annulée'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: any = {
      'pending': '#ffc107',
      'processing': '#17a2b8',
      'shipped': '#007bff',
      'delivered': '#28a745',
      'cancelled': '#dc3545'
    };
    return colors[status] || '#6c757d';
  }

  getEstimatedDeliveryDays(): number | null {
    if (!this.order || !this.trackingInfo || !this.trackingInfo.estimated_delivery) {
      return null;
    }

    const estimatedDate = new Date(this.trackingInfo.estimated_delivery);
    const today = new Date();
    const diffTime = estimatedDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  }

  isDeliveryDelayed(): boolean {
    const days = this.getEstimatedDeliveryDays();
    return days !== null && days < 0;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatShortDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getProgressPercentage(): number {
    const completedSteps = this.trackingSteps.filter(s => s.status === 'completed').length;
    const totalSteps = this.trackingSteps.length;
    return Math.round((completedSteps / totalSteps) * 100);
  }
}