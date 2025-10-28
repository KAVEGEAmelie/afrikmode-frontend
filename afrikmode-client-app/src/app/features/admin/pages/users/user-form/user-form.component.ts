// src/app/features/admin/pages/users/user-form/user-form.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminUsersService } from '../../../core/services/admin-users.service';
import { AdminUser, UserRoleType, UserStatus } from '../../../core/models/admin-user.model';

@Component({
  standalone: true,
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatCheckboxModule,
    MatSnackBarModule
  ]
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  isEditMode = false;
  userId: string | null = null;
  loading = false;
  
  roles: {value: UserRoleType, label: string}[] = [
    { value: 'customer', label: 'Client' },
    { value: 'vendor', label: 'Vendeur' },
    { value: 'admin', label: 'Administrateur' }
  ];

  statuses: {value: UserStatus, label: string}[] = [
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif' },
    { value: 'suspended', label: 'Suspendu' },
    { value: 'banned', label: 'Banni' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private usersService: AdminUsersService,
    private snackBar: MatSnackBar
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.userId;

    if (this.isEditMode) {
      this.loadUser();
    }
  }

  initializeForm() {
    this.userForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[0-9+\-\s()]+$/)]],
      role: ['customer', Validators.required],
      status: ['active', Validators.required],
      is_verified: [false],
      two_factor_enabled: [false],
      admin_notes: ['']
    });
  }

  loadUser() {
    if (!this.userId) return;

    this.loading = true;
    this.usersService.getUserById(this.userId).subscribe({
      next: (user) => {
        this.userForm.patchValue(user);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'utilisateur:', error);
        this.snackBar.open('Erreur lors du chargement', 'Fermer', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.loading = true;
      const userData = this.userForm.value;

      const operation = this.isEditMode
        ? this.usersService.updateUser(this.userId!, userData)
        : this.usersService.createUser(userData);

      operation.subscribe({
        next: (result) => {
          const message = this.isEditMode 
            ? 'Utilisateur mis à jour avec succès'
            : 'Utilisateur créé avec succès';
          
          this.snackBar.open(message, 'Fermer', { duration: 3000 });
          this.router.navigate(['/admin/users']);
        },
        error: (error) => {
          console.error('Erreur lors de la sauvegarde:', error);
          this.snackBar.open('Erreur lors de la sauvegarde', 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel() {
    this.router.navigate(['/admin/users']);
  }

  markFormGroupTouched() {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.userForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Ce champ est requis';
    }
    if (control?.hasError('email')) {
      return 'Email invalide';
    }
    if (control?.hasError('minlength')) {
      return 'Minimum 2 caractères requis';
    }
    if (control?.hasError('pattern')) {
      return 'Format invalide';
    }
    return '';
  }
}
