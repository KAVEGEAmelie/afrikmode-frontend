import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { AdminApiService, DashboardStats } from './admin-api.service';

export interface AdminState {
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface UsersState extends AdminState {
  users: any[];
  totalUsers: number;
  currentPage: number;
  pageSize: number;
  filters: any;
}

export interface StoresState extends AdminState {
  stores: any[];
  totalStores: number;
  currentPage: number;
  pageSize: number;
  filters: any;
}

export interface ProductsState extends AdminState {
  products: any[];
  totalProducts: number;
  currentPage: number;
  pageSize: number;
  filters: any;
}

export interface OrdersState extends AdminState {
  orders: any[];
  totalOrders: number;
  currentPage: number;
  pageSize: number;
  filters: any;
}

export interface SupportState extends AdminState {
  tickets: any[];
  totalTickets: number;
  currentPage: number;
  pageSize: number;
  filters: any;
}

export interface CouponsState extends AdminState {
  coupons: any[];
  totalCoupons: number;
  currentPage: number;
  pageSize: number;
  filters: any;
}

@Injectable({
  providedIn: 'root'
})
export class AdminStateService {
  // Dashboard state
  private dashboardStatsSubject = new BehaviorSubject<DashboardStats | null>(null);
  private dashboardLoadingSubject = new BehaviorSubject<boolean>(false);
  private dashboardErrorSubject = new BehaviorSubject<string | null>(null);

  // Users state
  private usersSubject = new BehaviorSubject<UsersState>({
    loading: false,
    error: null,
    lastUpdated: null,
    users: [],
    totalUsers: 0,
    currentPage: 0,
    pageSize: 25,
    filters: {}
  });

  // Stores state
  private storesSubject = new BehaviorSubject<StoresState>({
    loading: false,
    error: null,
    lastUpdated: null,
    stores: [],
    totalStores: 0,
    currentPage: 0,
    pageSize: 25,
    filters: {}
  });

  // Products state
  private productsSubject = new BehaviorSubject<ProductsState>({
    loading: false,
    error: null,
    lastUpdated: null,
    products: [],
    totalProducts: 0,
    currentPage: 0,
    pageSize: 25,
    filters: {}
  });

  // Orders state
  private ordersSubject = new BehaviorSubject<OrdersState>({
    loading: false,
    error: null,
    lastUpdated: null,
    orders: [],
    totalOrders: 0,
    currentPage: 0,
    pageSize: 25,
    filters: {}
  });

  // Support state
  private supportSubject = new BehaviorSubject<SupportState>({
    loading: false,
    error: null,
    lastUpdated: null,
    tickets: [],
    totalTickets: 0,
    currentPage: 0,
    pageSize: 25,
    filters: {}
  });

  // Coupons state
  private couponsSubject = new BehaviorSubject<CouponsState>({
    loading: false,
    error: null,
    lastUpdated: null,
    coupons: [],
    totalCoupons: 0,
    currentPage: 0,
    pageSize: 25,
    filters: {}
  });

  // Observables publics
  public dashboardStats$ = this.dashboardStatsSubject.asObservable();
  public dashboardLoading$ = this.dashboardLoadingSubject.asObservable();
  public dashboardError$ = this.dashboardErrorSubject.asObservable();

  public usersState$ = this.usersSubject.asObservable();
  public storesState$ = this.storesSubject.asObservable();
  public productsState$ = this.productsSubject.asObservable();
  public ordersState$ = this.ordersSubject.asObservable();
  public supportState$ = this.supportSubject.asObservable();
  public couponsState$ = this.couponsSubject.asObservable();

  // Computed observables
  public users$ = this.usersState$.pipe(map(state => state.users));
  public stores$ = this.storesState$.pipe(map(state => state.stores));
  public products$ = this.productsState$.pipe(map(state => state.products));
  public orders$ = this.ordersState$.pipe(map(state => state.orders));
  public tickets$ = this.supportState$.pipe(map(state => state.tickets));
  public coupons$ = this.couponsState$.pipe(map(state => state.coupons));

  // Loading states
  public usersLoading$ = this.usersState$.pipe(map(state => state.loading));
  public storesLoading$ = this.storesState$.pipe(map(state => state.loading));
  public productsLoading$ = this.productsState$.pipe(map(state => state.loading));
  public ordersLoading$ = this.ordersState$.pipe(map(state => state.loading));
  public supportLoading$ = this.supportState$.pipe(map(state => state.loading));
  public couponsLoading$ = this.couponsState$.pipe(map(state => state.loading));

  // Error states
  public usersError$ = this.usersState$.pipe(map(state => state.error));
  public storesError$ = this.storesState$.pipe(map(state => state.error));
  public productsError$ = this.productsState$.pipe(map(state => state.error));
  public ordersError$ = this.ordersState$.pipe(map(state => state.error));
  public supportError$ = this.supportState$.pipe(map(state => state.error));
  public couponsError$ = this.couponsState$.pipe(map(state => state.error));

  constructor(private adminApi: AdminApiService) {}

  // Dashboard actions
  loadDashboardStats(): Observable<DashboardStats> {
    this.dashboardLoadingSubject.next(true);
    this.dashboardErrorSubject.next(null);

    return this.adminApi.getDashboardStats().pipe(
      tap(stats => {
        this.dashboardStatsSubject.next(stats);
        this.dashboardLoadingSubject.next(false);
      }),
      catchError(error => {
        this.dashboardErrorSubject.next(error.message || 'Erreur lors du chargement des statistiques');
        this.dashboardLoadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  // Users actions
  loadUsers(filters?: any): void {
    const currentState = this.usersSubject.value;
    this.usersSubject.next({
      ...currentState,
      loading: true,
      error: null,
      filters: filters || currentState.filters
    });

    this.adminApi.getUsers({
      ...filters,
      page: currentState.currentPage + 1,
      limit: currentState.pageSize
    }).subscribe({
      next: (response) => {
        this.usersSubject.next({
          ...currentState,
          loading: false,
          users: response.data,
          totalUsers: response.pagination?.total || 0,
          lastUpdated: new Date()
        });
      },
      error: (error) => {
        this.usersSubject.next({
          ...currentState,
          loading: false,
          error: error.message || 'Erreur lors du chargement des utilisateurs'
        });
      }
    });
  }

  setUsersPage(page: number): void {
    const currentState = this.usersSubject.value;
    this.usersSubject.next({
      ...currentState,
      currentPage: page
    });
    this.loadUsers();
  }

  setUsersPageSize(pageSize: number): void {
    const currentState = this.usersSubject.value;
    this.usersSubject.next({
      ...currentState,
      pageSize,
      currentPage: 0
    });
    this.loadUsers();
  }

  updateUser(userId: string, userData: any): void {
    const currentState = this.usersSubject.value;
    this.usersSubject.next({
      ...currentState,
      loading: true,
      error: null
    });

    this.adminApi.updateUser(userId, userData).subscribe({
      next: (updatedUser) => {
        const users = currentState.users.map(user => 
          user.id === userId ? updatedUser : user
        );
        this.usersSubject.next({
          ...currentState,
          loading: false,
          users,
          lastUpdated: new Date()
        });
      },
      error: (error) => {
        this.usersSubject.next({
          ...currentState,
          loading: false,
          error: error.message || 'Erreur lors de la mise à jour de l\'utilisateur'
        });
      }
    });
  }

  deleteUser(userId: string): void {
    const currentState = this.usersSubject.value;
    this.usersSubject.next({
      ...currentState,
      loading: true,
      error: null
    });

    this.adminApi.deleteUser(userId).subscribe({
      next: () => {
        const users = currentState.users.filter(user => user.id !== userId);
        this.usersSubject.next({
          ...currentState,
          loading: false,
          users,
          totalUsers: currentState.totalUsers - 1,
          lastUpdated: new Date()
        });
      },
      error: (error) => {
        this.usersSubject.next({
          ...currentState,
          loading: false,
          error: error.message || 'Erreur lors de la suppression de l\'utilisateur'
        });
      }
    });
  }

  // Stores actions
  loadStores(filters?: any): void {
    const currentState = this.storesSubject.value;
    this.storesSubject.next({
      ...currentState,
      loading: true,
      error: null,
      filters: filters || currentState.filters
    });

    this.adminApi.getStores({
      ...filters,
      page: currentState.currentPage + 1,
      limit: currentState.pageSize
    }).subscribe({
      next: (response) => {
        this.storesSubject.next({
          ...currentState,
          loading: false,
          stores: response.data,
          totalStores: response.pagination?.total || 0,
          lastUpdated: new Date()
        });
      },
      error: (error) => {
        this.storesSubject.next({
          ...currentState,
          loading: false,
          error: error.message || 'Erreur lors du chargement des boutiques'
        });
      }
    });
  }

  setStoresPage(page: number): void {
    const currentState = this.storesSubject.value;
    this.storesSubject.next({
      ...currentState,
      currentPage: page
    });
    this.loadStores();
  }

  setStoresPageSize(pageSize: number): void {
    const currentState = this.storesSubject.value;
    this.storesSubject.next({
      ...currentState,
      pageSize,
      currentPage: 0
    });
    this.loadStores();
  }

  // Products actions
  loadProducts(filters?: any): void {
    const currentState = this.productsSubject.value;
    this.productsSubject.next({
      ...currentState,
      loading: true,
      error: null,
      filters: filters || currentState.filters
    });

    this.adminApi.getProducts({
      ...filters,
      page: currentState.currentPage + 1,
      limit: currentState.pageSize
    }).subscribe({
      next: (response) => {
        this.productsSubject.next({
          ...currentState,
          loading: false,
          products: response.data,
          totalProducts: response.pagination?.total || 0,
          lastUpdated: new Date()
        });
      },
      error: (error) => {
        this.productsSubject.next({
          ...currentState,
          loading: false,
          error: error.message || 'Erreur lors du chargement des produits'
        });
      }
    });
  }

  setProductsPage(page: number): void {
    const currentState = this.productsSubject.value;
    this.productsSubject.next({
      ...currentState,
      currentPage: page
    });
    this.loadProducts();
  }

  setProductsPageSize(pageSize: number): void {
    const currentState = this.productsSubject.value;
    this.productsSubject.next({
      ...currentState,
      pageSize,
      currentPage: 0
    });
    this.loadProducts();
  }

  // Orders actions
  loadOrders(filters?: any): void {
    const currentState = this.ordersSubject.value;
    this.ordersSubject.next({
      ...currentState,
      loading: true,
      error: null,
      filters: filters || currentState.filters
    });

    this.adminApi.getOrders({
      ...filters,
      page: currentState.currentPage + 1,
      limit: currentState.pageSize
    }).subscribe({
      next: (response) => {
        this.ordersSubject.next({
          ...currentState,
          loading: false,
          orders: response.data,
          totalOrders: response.pagination?.total || 0,
          lastUpdated: new Date()
        });
      },
      error: (error) => {
        this.ordersSubject.next({
          ...currentState,
          loading: false,
          error: error.message || 'Erreur lors du chargement des commandes'
        });
      }
    });
  }

  setOrdersPage(page: number): void {
    const currentState = this.ordersSubject.value;
    this.ordersSubject.next({
      ...currentState,
      currentPage: page
    });
    this.loadOrders();
  }

  setOrdersPageSize(pageSize: number): void {
    const currentState = this.ordersSubject.value;
    this.ordersSubject.next({
      ...currentState,
      pageSize,
      currentPage: 0
    });
    this.loadOrders();
  }

  updateOrderStatus(orderId: string, status: string): void {
    const currentState = this.ordersSubject.value;
    this.ordersSubject.next({
      ...currentState,
      loading: true,
      error: null
    });

    this.adminApi.updateOrderStatus(orderId, status).subscribe({
      next: (updatedOrder) => {
        const orders = currentState.orders.map(order => 
          order.id === orderId ? updatedOrder : order
        );
        this.ordersSubject.next({
          ...currentState,
          loading: false,
          orders,
          lastUpdated: new Date()
        });
      },
      error: (error) => {
        this.ordersSubject.next({
          ...currentState,
          loading: false,
          error: error.message || 'Erreur lors de la mise à jour du statut de la commande'
        });
      }
    });
  }

  // Support actions
  loadTickets(filters?: any): void {
    const currentState = this.supportSubject.value;
    this.supportSubject.next({
      ...currentState,
      loading: true,
      error: null,
      filters: filters || currentState.filters
    });

    this.adminApi.getTickets({
      ...filters,
      page: currentState.currentPage + 1,
      limit: currentState.pageSize
    }).subscribe({
      next: (response) => {
        this.supportSubject.next({
          ...currentState,
          loading: false,
          tickets: response.data,
          totalTickets: response.pagination?.total || 0,
          lastUpdated: new Date()
        });
      },
      error: (error) => {
        this.supportSubject.next({
          ...currentState,
          loading: false,
          error: error.message || 'Erreur lors du chargement des tickets'
        });
      }
    });
  }

  setTicketsPage(page: number): void {
    const currentState = this.supportSubject.value;
    this.supportSubject.next({
      ...currentState,
      currentPage: page
    });
    this.loadTickets();
  }

  setTicketsPageSize(pageSize: number): void {
    const currentState = this.supportSubject.value;
    this.supportSubject.next({
      ...currentState,
      pageSize,
      currentPage: 0
    });
    this.loadTickets();
  }

  updateTicketStatus(ticketId: string, status: string): void {
    const currentState = this.supportSubject.value;
    this.supportSubject.next({
      ...currentState,
      loading: true,
      error: null
    });

    this.adminApi.updateTicketStatus(ticketId, status).subscribe({
      next: (updatedTicket) => {
        const tickets = currentState.tickets.map(ticket => 
          ticket.id === ticketId ? updatedTicket : ticket
        );
        this.supportSubject.next({
          ...currentState,
          loading: false,
          tickets,
          lastUpdated: new Date()
        });
      },
      error: (error) => {
        this.supportSubject.next({
          ...currentState,
          loading: false,
          error: error.message || 'Erreur lors de la mise à jour du statut du ticket'
        });
      }
    });
  }

  // Coupons actions
  loadCoupons(filters?: any): void {
    const currentState = this.couponsSubject.value;
    this.couponsSubject.next({
      ...currentState,
      loading: true,
      error: null,
      filters: filters || currentState.filters
    });

    this.adminApi.getCoupons({
      ...filters,
      page: currentState.currentPage + 1,
      limit: currentState.pageSize
    }).subscribe({
      next: (response) => {
        this.couponsSubject.next({
          ...currentState,
          loading: false,
          coupons: response.data,
          totalCoupons: response.pagination?.total || 0,
          lastUpdated: new Date()
        });
      },
      error: (error) => {
        this.couponsSubject.next({
          ...currentState,
          loading: false,
          error: error.message || 'Erreur lors du chargement des coupons'
        });
      }
    });
  }

  setCouponsPage(page: number): void {
    const currentState = this.couponsSubject.value;
    this.couponsSubject.next({
      ...currentState,
      currentPage: page
    });
    this.loadCoupons();
  }

  setCouponsPageSize(pageSize: number): void {
    const currentState = this.couponsSubject.value;
    this.couponsSubject.next({
      ...currentState,
      pageSize,
      currentPage: 0
    });
    this.loadCoupons();
  }

  createCoupon(couponData: any): void {
    const currentState = this.couponsSubject.value;
    this.couponsSubject.next({
      ...currentState,
      loading: true,
      error: null
    });

    this.adminApi.createCoupon(couponData).subscribe({
      next: (newCoupon) => {
        this.couponsSubject.next({
          ...currentState,
          loading: false,
          coupons: [newCoupon, ...currentState.coupons],
          totalCoupons: currentState.totalCoupons + 1,
          lastUpdated: new Date()
        });
      },
      error: (error) => {
        this.couponsSubject.next({
          ...currentState,
          loading: false,
          error: error.message || 'Erreur lors de la création du coupon'
        });
      }
    });
  }

  updateCoupon(couponId: string, couponData: any): void {
    const currentState = this.couponsSubject.value;
    this.couponsSubject.next({
      ...currentState,
      loading: true,
      error: null
    });

    this.adminApi.updateCoupon(couponId, couponData).subscribe({
      next: (updatedCoupon) => {
        const coupons = currentState.coupons.map(coupon => 
          coupon.id === couponId ? updatedCoupon : coupon
        );
        this.couponsSubject.next({
          ...currentState,
          loading: false,
          coupons,
          lastUpdated: new Date()
        });
      },
      error: (error) => {
        this.couponsSubject.next({
          ...currentState,
          loading: false,
          error: error.message || 'Erreur lors de la mise à jour du coupon'
        });
      }
    });
  }

  deleteCoupon(couponId: string): void {
    const currentState = this.couponsSubject.value;
    this.couponsSubject.next({
      ...currentState,
      loading: true,
      error: null
    });

    this.adminApi.deleteCoupon(couponId).subscribe({
      next: () => {
        const coupons = currentState.coupons.filter(coupon => coupon.id !== couponId);
        this.couponsSubject.next({
          ...currentState,
          loading: false,
          coupons,
          totalCoupons: currentState.totalCoupons - 1,
          lastUpdated: new Date()
        });
      },
      error: (error) => {
        this.couponsSubject.next({
          ...currentState,
          loading: false,
          error: error.message || 'Erreur lors de la suppression du coupon'
        });
      }
    });
  }

  // Clear errors
  clearError(section: 'users' | 'stores' | 'products' | 'orders' | 'support' | 'coupons' | 'dashboard'): void {
    switch (section) {
      case 'users':
        const usersState = this.usersSubject.value;
        this.usersSubject.next({ ...usersState, error: null });
        break;
      case 'stores':
        const storesState = this.storesSubject.value;
        this.storesSubject.next({ ...storesState, error: null });
        break;
      case 'products':
        const productsState = this.productsSubject.value;
        this.productsSubject.next({ ...productsState, error: null });
        break;
      case 'orders':
        const ordersState = this.ordersSubject.value;
        this.ordersSubject.next({ ...ordersState, error: null });
        break;
      case 'support':
        const supportState = this.supportSubject.value;
        this.supportSubject.next({ ...supportState, error: null });
        break;
      case 'coupons':
        const couponsState = this.couponsSubject.value;
        this.couponsSubject.next({ ...couponsState, error: null });
        break;
      case 'dashboard':
        this.dashboardErrorSubject.next(null);
        break;
    }
  }
}
