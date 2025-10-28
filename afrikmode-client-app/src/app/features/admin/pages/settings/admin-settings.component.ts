import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-settings-page">
      <h1>Paramètres Admin</h1>
      <p>Page de paramètres admin en cours de développement...</p>
    </div>
  `,
  styles: [`
    .admin-settings-page {
      padding: 20px;
    }
  `]
})
export class AdminSettingsComponent {
  constructor() {}
}

