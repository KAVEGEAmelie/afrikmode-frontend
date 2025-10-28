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
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: any) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
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

  logoutSession(session: any): void {
    if (confirm(`Déconnecter la session "${session.device}" ?`)) {
      // Logique pour déconnecter une session spécifique
      const index = this.loginHistory.indexOf(session);
      if (index > -1) {
        this.loginHistory.splice(index, 1);
      }
      alert('Session déconnectée avec succès');
    }
  }

  logoutAllDevices(): void {
    if (confirm('Déconnecter tous les appareils sauf celui-ci ? Cette action vous déconnectera de tous les autres appareils.')) {
      // Logique pour déconnecter tous les appareils
      this.loginHistory = this.loginHistory.filter(session => session.current);
      alert('Tous les autres appareils ont été déconnectés');
    }
  }
}