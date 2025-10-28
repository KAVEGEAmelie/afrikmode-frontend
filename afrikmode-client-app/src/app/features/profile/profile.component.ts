import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-page">
      <h1>Profil</h1>
      <p>Page de profil en cours de développement...</p>
    </div>
  `,
  styles: [`
    .profile-page {
      padding: 20px;
    }
  `]
})
export class ProfileComponent {
  constructor() {}
}

