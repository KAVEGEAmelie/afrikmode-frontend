import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../../../core/services/order.service';
import { Order } from '../../../../core/models/order.model';

interface OrderItemDisplay {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface OrderDataDisplay {
  orderId: string;
  orderNumber: string;
  items: OrderItemDisplay[];
  total: number;
  currency: string;
  shippingAddress: any;
  paymentMethod: string;
  estimatedDelivery: string;
  trackingNumber?: string;
  status: string;
  paymentStatus: string;
}

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule, NgIf, NgFor],
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.scss']
})
export class OrderConfirmationComponent implements OnInit {
  
  orderId: string | null = null;
  order: Order | null = null;
  currentOrder: OrderDataDisplay | null = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID de commande depuis les query params ou route params
    this.route.queryParams.subscribe(params => {
      this.orderId = params['orderId'] || params['id'];
      if (this.orderId) {
        this.loadOrder(this.orderId);
      } else {
        this.route.params.subscribe(routeParams => {
          this.orderId = routeParams['id'];
          if (this.orderId) {
            this.loadOrder(this.orderId);
          } else {
            this.error = 'Numéro de commande manquant';
            this.isLoading = false;
          }
        });
      }
    });
  }

  loadOrder(orderId: string): void {
    this.isLoading = true;
    this.error = null;

    this.orderService.getOrder(orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.mapOrderToDisplay(order);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement commande:', err);
        this.error = 'Erreur lors du chargement de la commande';
        this.isLoading = false;
      }
    });
  }

  mapOrderToDisplay(order: Order): void {
    const shippingAddr = typeof order.shipping_address === 'string' 
      ? JSON.parse(order.shipping_address) 
      : order.shipping_address;

    this.currentOrder = {
      orderId: order.id,
      orderNumber: order.order_number,
      items: order.items.map(item => ({
        id: parseInt(item.id),
        name: item.product.name,
        price: item.unit_price,
        quantity: item.quantity,
        image: item.product.image_url || (item.product.images && item.product.images.length > 0 
          ? item.product.images[0].url 
          : '/assets/images/products/default.jpg')
      })),
      total: order.total,
      currency: order.currency || 'FCFA',
      shippingAddress: shippingAddr || {},
      paymentMethod: order.payment_method || 'Non spécifié',
      estimatedDelivery: this.calculateEstimatedDelivery(),
      trackingNumber: order.tracking_info?.tracking_number,
      status: order.status,
      paymentStatus: order.payment_status
    };
  }

  calculateEstimatedDelivery(): string {
    // Calculer la date de livraison estimée (3-5 jours à partir d'aujourd'hui)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 5);
    return deliveryDate.toISOString().split('T')[0];
  }

  getOrderSubtotal(): number {
    if (!this.currentOrder) return 0;
    return this.currentOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getShippingCost(): number {
    if (!this.currentOrder) return 0;
    return this.currentOrder.total - this.getOrderSubtotal();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  downloadInvoice(): void {
    if (!this.orderId) return;

    this.orderService.downloadInvoice(this.orderId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `facture-${this.currentOrder?.orderNumber || this.orderId}.pdf`;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        console.error('Erreur téléchargement facture:', err);
        alert('Erreur lors du téléchargement de la facture');
      }
    });
  }

  trackOrder(): void {
    if (this.orderId) {
      this.router.navigate(['/orders', this.orderId, 'tracking']);
    }
  }

  continueShopping(): void {
    this.router.navigate(['/shop']);
  }

  goToOrders(): void {
    this.router.navigate(['/orders']);
  }
}











































