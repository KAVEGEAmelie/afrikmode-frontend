// src/app/features/profile/components/delete-account/delete-account.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-delete-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './delete-account.component.html',
  styleUrls: ['./delete-account.component.scss']
})
export class DeleteAccountComponent {
  
  confirmText = '';
  isDeleting = false;

  constructor(private router: Router) {}

  deleteAccount(): void {
    if (this.confirmText !== 'SUPPRIMER') {
      alert('Veuillez taper SUPPRIMER pour confirmer');
      return;
    }

    if (confirm('Êtes-vous absolument sûr ? Cette action est irréversible.')) {
      this.isDeleting = true;
      
      setTimeout(() => {
        localStorage.clear();
        this.router.navigate(['/']);
      }, 2000);
    }
  }
}