// src/app/features/profile/profile-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileLayoutComponent } from './components/profile-layout/profile-layout.component';
import { ProfileOverviewComponent } from './components/profile-overview/profile-overview.component';
import { PersonalInfoComponent } from './components/personal-info/personal-info.component';
import { AddressesComponent } from './components/addresses/addresses.component';
import { SecurityComponent } from './components/security/security.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { OrderHistoryComponent } from './components/order-history/order-history.component';
import { WishlistComponent } from './components/wishlist/wishlist.component';
import { ReviewsComponent } from './components/reviews/reviews.component';
import { DeleteAccountComponent } from './components/delete-account/delete-account.component';

const routes: Routes = [
  {
    path: '',
    component: ProfileLayoutComponent,
    children: [
      {
        path: '',
        component: ProfileOverviewComponent,
        data: { title: 'Mon Profil - AfrikMode' }
      },
      {
        path: 'personal-info',
        component: PersonalInfoComponent,
        data: { title: 'Informations Personnelles - AfrikMode' }
      },
      {
        path: 'addresses',
        component: AddressesComponent,
        data: { title: 'Mes Adresses - AfrikMode' }
      },
      {
        path: 'security',
        component: SecurityComponent,
        data: { title: 'Sécurité - AfrikMode' }
      },
      {
        path: 'notifications',
        component: NotificationsComponent,
        data: { title: 'Notifications - AfrikMode' }
      },
      {
        path: 'order-history',
        component: OrderHistoryComponent,
        data: { title: 'Historique des Commandes - AfrikMode' }
      },
      {
        path: 'wishlist',
        component: WishlistComponent,
        data: { title: 'Ma Liste de Souhaits - AfrikMode' }
      },
      {
        path: 'reviews',
        component: ReviewsComponent,
        data: { title: 'Mes Avis - AfrikMode' }
      },
      {
        path: 'delete-account',
        component: DeleteAccountComponent,
        data: { title: 'Supprimer mon Compte - AfrikMode' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }