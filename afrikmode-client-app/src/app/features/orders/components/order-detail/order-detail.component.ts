// src/app/features/orders/components/order-detail/order-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../../core/services/order.service';
import { Order } from '../../../../core/models/order.model';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit {
  
  order: Order | null = null;
  isLoading = true;
  error: string | null = null;
  showCancelModal = false;
  showReturnModal = false;
  cancelReason = '';
  isCancelling = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const orderId = params['id'];
      if (orderId) {
        this.loadOrder(orderId);
      }
    });
  }

  loadOrder(orderId: string): void {
    this.isLoading = true;
    this.error = null;

    this.orderService.getOrder(orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading order:', err);
        this.error = 'Erreur lors du chargement de la commande';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/orders']);
  }

  trackOrder(): void {
    if (this.order) {
      this.router.navigate(['/orders', this.order.id, 'tracking']);
    }
  }

  openCancelModal(): void {
    this.showCancelModal = true;
    this.cancelReason = '';
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.cancelReason = '';
  }

  confirmCancel(): void {
    if (!this.order || !this.cancelReason.trim()) {
      alert('Veuillez indiquer une raison pour l\'annulation');
      return;
    }

    this.isCancelling = true;

    this.orderService.cancelOrder(this.order.id, this.cancelReason).subscribe({
      next: (updatedOrder) => {
        this.order = updatedOrder;
        this.isCancelling = false;
        this.closeCancelModal();
        alert('Commande annulée avec succès');
      },
      error: (err) => {
        console.error('Error cancelling order:', err);
        this.isCancelling = false;
        alert('Erreur lors de l\'annulation de la commande');
      }
    });
  }

  openReturnModal(): void {
    this.showReturnModal = true;
  }

  closeReturnModal(): void {
    this.showReturnModal = false;
  }

  confirmDelivery(): void {
    if (!this.order) return;

    if (confirm('Confirmez-vous la réception de cette commande ?')) {
      this.orderService.confirmDelivery(this.order.id).subscribe({
        next: (updatedOrder) => {
          this.order = updatedOrder;
          alert('Livraison confirmée avec succès');
        },
        error: (err) => {
          console.error('Error confirming delivery:', err);
          alert('Erreur lors de la confirmation');
        }
      });
    }
  }

  downloadInvoice(): void {
    if (!this.order) return;

    this.orderService.downloadInvoice(this.order.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `facture-${this.order!.order_number}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Error downloading invoice:', err);
        alert('Erreur lors du téléchargement de la facture');
      }
    });
  }

  reorder(): void {
    if (!this.order) return;

    if (confirm('Voulez-vous vraiment recommander ces articles ?')) {
      this.orderService.reorder(this.order.id).subscribe({
        next: () => {
          alert('Articles ajoutés au panier !');
          this.router.navigate(['/cart']);
        },
        error: (err) => {
          console.error('Error reordering:', err);
          alert('Erreur lors de la recommande');
        }
      });
    }
  }

  getStatusLabel(status: string | undefined): string {
    if (!status) return 'Inconnu';
    const labels: any = {
      'pending': 'En attente',
      'processing': 'En préparation',
      'shipped': 'Expédiée',
      'delivered': 'Livrée',
      'cancelled': 'Annulée',
      'returned': 'Retournée'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string | undefined): string {
    if (!status) return '#6c757d';
    const colors: any = {
      'pending': '#ffc107',
      'processing': '#17a2b8',
      'shipped': '#007bff',
      'delivered': '#28a745',
      'cancelled': '#dc3545',
      'returned': '#6c757d'
    };
    return colors[status] || '#6c757d';
  }

  getPaymentStatusLabel(status: string | undefined): string {
    if (!status) return 'Inconnu';
    const labels: any = {
      'pending': 'En attente',
      'paid': 'Payé',
      'failed': 'Échoué',
      'refunded': 'Remboursé',
      'partially_refunded': 'Partiellement remboursé'
    };
    return labels[status] || status;
  }

  canCancel(): boolean {
    if (!this.order) return false;
    return this.order.status === 'pending' || this.order.status === 'processing';
  }

  canReturn(): boolean {
    if (!this.order) return false;
    return this.order.status === 'delivered';
  }

  canConfirmDelivery(): boolean {
    if (!this.order) return false;
    return this.order.status === 'shipped';
  }

  canTrack(): boolean {
    if (!this.order) return false;
    return this.order.status === 'shipped' || this.order.status === 'delivered';
  }

  formatAddress(address: any): string {
    if (!address) return '';
    const parts = [
      address.address_line_1,
      address.address_line_2,
      address.city,
      address.postal_code,
      address.country
    ].filter(Boolean);
    return parts.join(', ');
  }
}