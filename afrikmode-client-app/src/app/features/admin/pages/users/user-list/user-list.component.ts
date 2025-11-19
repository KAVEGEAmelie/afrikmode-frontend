// src/app/features/admin/pages/users/user-list/user-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminDataTableComponent, TableColumn, TableAction } from '../../../shared/components/admin-data-table/admin-data-table.component';
import { AdminUsersService } from '../../../core/services/admin-users.service';
import { AdminUser, UserListResponse } from '../../../core/models/admin-user.model';
import { UserDetailsDialogComponent } from '../user-details-dialog/user-details-dialog.component';
import { UserEditDialogComponent } from '../user-edit-dialog/user-edit-dialog.component';
import { UserSuspendDialogComponent } from '../user-suspend-dialog/user-suspend-dialog.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  standalone: true,
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    AdminDataTableComponent
  ]
})
export class UserListComponent implements OnInit {
  users: AdminUser[] = [];
  loading = false;

  columns: TableColumn[] = [
    {
      key: 'avatar',
      label: 'Photo',
      type: 'text',
      sortable: false,
      width: '60px',
      align: 'center'
    },
    {
      key: 'first_name',
      label: 'Nom Complet',
      sortable: true,
      format: (value: any) => 'Nom défini dans template'
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true
    },
    {
      key: 'role',
      label: 'Rôle',
      type: 'badge',
      sortable: true,
      format: (value) => value || 'user'
    },
    {
      key: 'status',
      label: 'Statut',
      type: 'badge',
      sortable: true
    },
    {
      key: 'created_at',
      label: 'Date Création',
      type: 'date',
      sortable: true
    },
    {
      key: 'last_login_at',
      label: 'Dernière Connexion',
      type: 'date',
      sortable: true
    }
  ];

  actions: TableAction[] = [
    {
      label: 'Voir',
      icon: 'visibility',
      color: 'primary',
      action: (user) => this.viewUser(user)
    },
    {
      label: 'Modifier',
      icon: 'edit',
      color: 'accent',
      action: (user) => this.editUser(user)
    },
    {
      label: 'Suspendre',
      icon: 'block',
      color: 'accent',
      action: (user) => this.suspendUser(user),
      visible: (user) => user.status === 'active' && user.role !== 'admin'
    },
    {
      label: 'Réactiver',
      icon: 'check_circle',
      color: 'primary',
      action: (user) => this.activateUser(user),
      visible: (user) => user.status === 'suspended' || user.status === 'banned'
    },
    {
      label: 'Supprimer',
      icon: 'delete',
      color: 'warn',
      action: (user) => this.deleteUser(user),
      visible: (user) => user.role !== 'admin'
    }
  ];

  constructor(
    private usersService: AdminUsersService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.usersService.getUsers().subscribe({
      next: (response) => {
        this.users = response.users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        this.loading = false;
      }
    });
  }

  onSelectionChange(selectedUsers: AdminUser[]) {
    console.log('Utilisateurs sélectionnés:', selectedUsers);
  }

  onSortChange(sort: {column: string, direction: 'asc' | 'desc'}) {
    console.log('Tri changé:', sort);
  }

  viewUser(user: AdminUser) {
    const dialogRef = this.dialog.open(UserDetailsDialogComponent, {
      width: '700px',
      maxWidth: '90vw',
      data: { user },
      panelClass: 'custom-dialog-container',
      autoFocus: true,
      restoreFocus: true,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'edit') {
        this.editUser(result.user);
      }
    });
  }

  editUser(user: AdminUser) {
    const dialogRef = this.dialog.open(UserEditDialogComponent, {
      width: '750px',
      maxWidth: '90vw',
      data: { user },
      panelClass: 'custom-dialog-container',
      autoFocus: true,
      restoreFocus: true,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.usersService.updateUser(user.id, result).subscribe({
          next: () => {
            this.snackBar.open('Utilisateur modifié avec succès', 'Fermer', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
            this.loadUsers();
          },
          error: (error) => {
            console.error('Erreur lors de la modification:', error);
            this.snackBar.open('Erreur lors de la modification', 'Fermer', {
              duration: 5000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
            this.loading = false;
          }
        });
      }
    });
  }

  suspendUser(user: AdminUser) {
    const dialogRef = this.dialog.open(UserSuspendDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { user, action: 'suspend' },
      panelClass: 'custom-dialog-container',
      autoFocus: true,
      restoreFocus: true,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.usersService.suspendUser(user.id, result.reason).subscribe({
          next: () => {
            this.snackBar.open('Utilisateur suspendu avec succès', 'Fermer', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
            this.loadUsers();
          },
          error: (error) => {
            console.error('Erreur lors de la suspension:', error);
            this.snackBar.open('Erreur lors de la suspension', 'Fermer', {
              duration: 5000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
            this.loading = false;
          }
        });
      }
    });
  }

  activateUser(user: AdminUser) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      maxWidth: '90vw',
      data: {
        title: 'Réactiver l\'utilisateur',
        message: `Voulez-vous réactiver ${user.first_name} ${user.last_name} (${user.email}) ?`,
        confirmText: 'Réactiver',
        cancelText: 'Annuler',
        type: 'info',
        icon: 'check_circle'
      },
      panelClass: 'custom-dialog-container',
      autoFocus: true,
      restoreFocus: true
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.loading = true;
        this.usersService.activateUser(user.id).subscribe({
          next: () => {
            this.snackBar.open('Utilisateur réactivé avec succès', 'Fermer', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
            this.loadUsers();
          },
          error: (error) => {
            console.error('Erreur lors de la réactivation:', error);
            this.snackBar.open('Erreur lors de la réactivation', 'Fermer', {
              duration: 5000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
            this.loading = false;
          }
        });
      }
    });
  }

  deleteUser(user: AdminUser) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '450px',
      maxWidth: '90vw',
      data: {
        title: 'Supprimer l\'utilisateur',
        message: `Êtes-vous sûr de vouloir supprimer définitivement ${user.first_name} ${user.last_name} (${user.email}) ? Cette action est irréversible.`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        type: 'danger',
        icon: 'delete_forever'
      },
      panelClass: 'custom-dialog-container',
      autoFocus: true,
      restoreFocus: true
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.loading = true;
        this.usersService.deleteUser(user.id).subscribe({
          next: () => {
            this.snackBar.open('Utilisateur supprimé avec succès', 'Fermer', {
              duration: 3000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
            this.loadUsers();
          },
          error: (error) => {
            console.error('Erreur lors de la suppression:', error);
            this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
              duration: 5000,
              horizontalPosition: 'end',
              verticalPosition: 'top'
            });
            this.loading = false;
          }
        });
      }
    });
  }

  exportUsers() {
    // Implémentation de l'export
    console.log('Export des utilisateurs');
  }

  getRoleColor(role: string): string {
    const colors: {[key: string]: string} = {
      'super_admin': 'rgb(244, 67, 54)',
      'admin': 'rgb(255, 152, 0)',
      'moderator': 'rgb(76, 175, 80)',
      'user': 'rgb(96, 125, 139)'
    };
    return colors[role] || colors['user'];
  }

  getStatusColor(status: string): string {
    const colors: {[key: string]: string} = {
      'active': 'rgb(76, 175, 80)',
      'inactive': 'rgb(255, 152, 0)',
      'suspended': 'rgb(244, 67, 54)',
      'pending': 'rgb(96, 125, 139)'
    };
    return colors[status] || colors['pending'];
  }

  trackByUserId(index: number, user: AdminUser): string {
    return user.id;
  }
}