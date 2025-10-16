import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-test-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div style="padding: 20px; background: #f5f5f5; min-height: 100vh;">
      <h1>🔧 Test Admin - Diagnostic</h1>
      <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2>✅ Admin Routing Test</h2>
        <p>Si vous voyez cette page, le routing admin fonctionne !</p>
        
        <h3>Routes de test :</h3>
        <ul>
          <li><a routerLink="/admin-test">/admin-test</a> - Dashboard direct</li>
          <li><a routerLink="/admin/login">/admin/login</a> - Connexion admin</li>
          <li><a routerLink="/admin/test/dashboard">/admin/test/dashboard</a> - Dashboard via module</li>
          <li><a routerLink="/admin/test/users">/admin/test/users</a> - Utilisateurs via module</li>
        </ul>
        
        <h3>Diagnostic :</h3>
        <p>URL actuelle : <code>{{ currentUrl }}</code></p>
        <p>Timestamp : {{ timestamp }}</p>
      </div>
    </div>
  `,
  styles: [`
    h1 { color: #2c3e50; }
    h2 { color: #27ae60; }
    h3 { color: #3498db; }
    a { color: #e74c3c; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code { background: #ecf0f1; padding: 2px 6px; border-radius: 4px; }
  `]
})
export class TestAdminComponent {
  currentUrl = window.location.href;
  timestamp = new Date().toLocaleString();
}













