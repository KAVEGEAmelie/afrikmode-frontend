// src/app/features/profile/components/security/security.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgIf, NgFor],
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss']
})
export class SecurityComponent implements OnInit {
  
  passwordForm: FormGroup;
  isChangingPassword = false;
  twoFactorEnabled = false;

  loginHistory = [
    { date: '2025-09-30 10:30', device: 'Chrome sur Windows', location: 'Lomé, Togo', current: true },
    { date: '2025-09-29 15:20', device: 'Safari sur iPhone', location: 'Lomé, Togo', current: false },
    { date: '2025-09-28 09:15', device: 'Chrome sur Windows', location: 'Lomé, Togo', current: false }
  ];

  constructor(private fb: FormBuilder) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {}

  changePassword(): void {
    if (this.passwordForm.valid) {
      const { newPassword, confirmPassword } = this.passwordForm.value;
      
      if (newPassword !== confirmPassword) {
        alert('Les mots de passe ne correspondent pas');
        return;
      }

      this.isChangingPassword = true;
      
      setTimeout(() => {
        this.isChangingPassword = false;
        this.passwordForm.reset();
        alert('Mot de passe changé avec succès !');
      }, 1500);
    }
  }

  toggleTwoFactor(): void {
    this.twoFactorEnabled = !this.twoFactorEnabled;
    const message = this.twoFactorEnabled ? 'activée' : 'désactivée';
    alert(`Authentification à deux facteurs ${message}`);
  }

  logoutAllDevices(): void {
    if (confirm('Déconnecter tous les appareils sauf celui-ci ?')) {
      alert('Tous les appareils ont été déconnectés');
    }
  }
}