import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subscription } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { VendorSidebarComponent } from './shared/components/vendor-sidebar/vendor-sidebar.component';
import { VendorTopbarComponent } from './shared/components/vendor-topbar/vendor-topbar.component';

@Component({
  selector: 'app-vendor',
  templateUrl: './vendor.component.html',
  styleUrls: ['./vendor.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    VendorSidebarComponent,
    VendorTopbarComponent
  ]
})
export class VendorComponent implements OnInit, OnDestroy {
  @ViewChild('drawer') drawer!: MatSidenav;
  
  isMobile$: Observable<boolean>;
  collapsed: boolean = false;
  private breakpointSubscription: Subscription = new Subscription();

  constructor(private breakpointObserver: BreakpointObserver) {
    this.isMobile$ = this.breakpointObserver.observe(Breakpoints.Handset)
      .pipe(
        map(result => result.matches),
        shareReplay()
      );
  }

  ngOnInit(): void {
    this.breakpointSubscription = this.isMobile$.subscribe(isMobile => {
      if (isMobile) {
        this.collapsed = false; // Always show sidebar on mobile initially
      }
    });
  }

  ngOnDestroy(): void {
    this.breakpointSubscription.unsubscribe();
  }

  toggleCollapsed(): void {
    this.collapsed = !this.collapsed;
  }

  closeSidebar(): void {
    this.isMobile$.subscribe(isMobile => {
      if (isMobile && this.drawer) {
        this.drawer.close();
      }
    }).unsubscribe();
  }
}
