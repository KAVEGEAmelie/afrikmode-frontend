// src/app/features/orders/orders.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Components (commenting out non-existing components)
// import { OrdersListComponent } from './components/orders-list/orders-list.component';
// OrderDetailComponent is now standalone
// import { OrderTrackingComponent } from './components/order-tracking/order-tracking.component';
// import { OrderItemCardComponent } from './components/order-item-card/order-item-card.component';
// import { OrderTimelineComponent } from './components/order-timeline/order-timeline.component';
// import { OrderActionsComponent } from './components/order-actions/order-actions.component';
// import { ReturnRequestModalComponent } from './components/return-request-modal/return-request-modal.component';

// Routing - commenting out for now since routes may not exist
// import { OrdersRoutingModule } from './orders-routing.module';

@NgModule({
  declarations: [
    // Only include components that actually exist and are NOT standalone
    // OrderDetailComponent is now standalone, so we don't declare it here
  ],
  imports: [
    CommonModule,        // Fournit *ngIf, *ngFor, DatePipe, DecimalPipe, etc.
    FormsModule,         // Fournit ngModel
    ReactiveFormsModule,
    RouterModule
    // OrdersRoutingModule - commented out since it doesn't exist yet
  ]
})
export class OrdersModule {
  constructor() {
    console.log('✅ Orders Module loaded - AfrikMode');
  }
}