// src/app/features/admin/shared/directives/has-permission.directive.ts

import { Directive, Input, TemplateRef, ViewContainerRef, OnDestroy } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { PermissionsService } from '../../core/services/permissions.service';
import { ModuleType, ActionType } from '../../core/models/permissions.model';

@Directive({
  selector: '[hasPermission]',
  standalone: true
})
export class HasPermissionDirective implements OnDestroy {
  private destroy$ = new Subject<void>();
  private hasView = false;

  @Input() set hasPermission(permission: { module: ModuleType; action: ActionType }) {
    this.updateView(permission);
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionsService: PermissionsService
  ) {
    // Écouter les changements de permissions
    this.permissionsService.getCurrentPermissions$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Re-évaluer la permission quand les permissions changent
        const currentInput = this.hasPermission;
        if (currentInput) {
          this.updateView(currentInput);
        }
      });
  }

  private updateView(permission: { module: ModuleType; action: ActionType }): void {
    if (!permission.module || !permission.action) {
      this.hideView();
      return;
    }

    const hasPermission = this.permissionsService.hasPermission(
      permission.module, 
      permission.action
    );

    if (hasPermission && !this.hasView) {
      this.showView();
    } else if (!hasPermission && this.hasView) {
      this.hideView();
    }
  }

  private showView(): void {
    this.viewContainer.createEmbeddedView(this.templateRef);
    this.hasView = true;
  }

  private hideView(): void {
    this.viewContainer.clear();
    this.hasView = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

@Directive({
  selector: '[hasModule]',
  standalone: true
})
export class HasModuleDirective implements OnDestroy {
  private destroy$ = new Subject<void>();
  private hasView = false;

  @Input() set hasModule(module: ModuleType) {
    this.updateView(module);
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionsService: PermissionsService
  ) {
    this.permissionsService.getCurrentPermissions$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const currentInput = this.hasModule;
        if (currentInput) {
          this.updateView(currentInput);
        }
      });
  }

  private updateView(module: ModuleType): void {
    if (!module) {
      this.hideView();
      return;
    }

    const canAccess = this.permissionsService.canAccessModule(module);

    if (canAccess && !this.hasView) {
      this.showView();
    } else if (!canAccess && this.hasView) {
      this.hideView();
    }
  }

  private showView(): void {
    this.viewContainer.createEmbeddedView(this.templateRef);
    this.hasView = true;
  }

  private hideView(): void {
    this.viewContainer.clear();
    this.hasView = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

@Directive({
  selector: '[hasRole]',
  standalone: true
})
export class HasRoleDirective implements OnDestroy {
  private destroy$ = new Subject<void>();
  private hasView = false;

  @Input() set hasRole(roles: string | string[]) {
    this.updateView(roles);
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private permissionsService: PermissionsService
  ) {
    this.permissionsService.getCurrentRole$()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const currentInput = this.hasRole;
        if (currentInput) {
          this.updateView(currentInput);
        }
      });
  }

  private updateView(roles: string | string[]): void {
    const currentRole = this.permissionsService.getCurrentRole();
    
    if (!currentRole) {
      this.hideView();
      return;
    }

    const roleArray = Array.isArray(roles) ? roles : [roles];
    const hasRole = roleArray.includes(currentRole);

    if (hasRole && !this.hasView) {
      this.showView();
    } else if (!hasRole && this.hasView) {
      this.hideView();
    }
  }

  private showView(): void {
    this.viewContainer.createEmbeddedView(this.templateRef);
    this.hasView = true;
  }

  private hideView(): void {
    this.viewContainer.clear();
    this.hasView = false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}