import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';

interface DialogData {
  template?: any;
}

@Component({
  selector: 'app-template-config-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatChipsModule,
    MatCheckboxModule,
    MatTabsModule
  ],
  template: `
    <div class="template-config-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>email</mat-icon>
          {{ data.template ? 'Modifier le template' : 'Nouveau template' }}
        </h2>
        <button mat-icon-button (click)="onCancel()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <mat-tab-group>
          <!-- Onglet: Informations -->
          <mat-tab label="Informations">
            <div class="tab-content">
              <mat-form-field appearance="outline" class="name-field">
                <mat-label>Nom du template</mat-label>
                <input 
                  matInput 
                  [(ngModel)]="templateName"
                  placeholder="Ex: Newsletter Standard">
              </mat-form-field>

              <mat-form-field appearance="outline" class="description-field">
                <mat-label>Description</mat-label>
                <textarea 
                  matInput 
                  [(ngModel)]="templateDescription"
                  placeholder="Description du template"
                  rows="3">
                </textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="category-field">
                <mat-label>Catégorie</mat-label>
                <mat-select [(ngModel)]="templateCategory">
                  @for (category of templateCategories; track category.value) {
                    <mat-option [value]="category.value">
                      <mat-icon>{{ category.icon }}</mat-icon>
                      {{ category.label }}
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-checkbox [(ngModel)]="isActive">
                Template actif
              </mat-checkbox>
            </div>
          </mat-tab>

          <!-- Onglet: Contenu HTML -->
          <mat-tab label="Contenu HTML">
            <div class="tab-content">
              <div class="html-editor">
                <h4>Code HTML du template</h4>
                <mat-form-field appearance="outline" class="html-content-field">
                  <mat-label>Contenu HTML</mat-label>
                  <textarea 
                    matInput 
                    [(ngModel)]="htmlContent"
                    placeholder="<html>...</html>"
                    rows="15">
                  </textarea>
                </mat-form-field>

                <div class="editor-actions">
                  <button mat-raised-button (click)="insertVariable()">
                    <mat-icon>add</mat-icon>
                    Insérer une variable
                  </button>
                  <button mat-raised-button (click)="formatHTML()">
                    <mat-icon>code</mat-icon>
                    Formater le HTML
                  </button>
                  <button mat-raised-button (click)="validateHTML()">
                    <mat-icon>check_circle</mat-icon>
                    Valider le HTML
                  </button>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Onglet: Aperçu -->
          <mat-tab label="Aperçu">
            <div class="tab-content">
              <div class="preview-section">
                <h4>Aperçu du template</h4>
                <div class="preview-container">
                  <div class="preview-email" [innerHTML]="htmlContent">
                  </div>
                </div>

                <div class="preview-actions">
                  <button mat-raised-button (click)="refreshPreview()">
                    <mat-icon>refresh</mat-icon>
                    Actualiser l'aperçu
                  </button>
                  <button mat-raised-button (click)="downloadPreview()">
                    <mat-icon>download</mat-icon>
                    Télécharger l'aperçu
                  </button>
                </div>
              </div>
            </div>
          </mat-tab>

          <!-- Onglet: Variables -->
          <mat-tab label="Variables">
            <div class="tab-content">
              <div class="variables-section">
                <h4>Variables disponibles</h4>
                <div class="variables-list">
                  @for (variable of availableVariables; track variable.name) {
                    <mat-card class="variable-card">
                      <mat-card-content>
                        <div class="variable-info">
                          <h5>{{ variable.name }}</h5>
                          <p>{{ variable.description }}</p>
                          <span class="variable-example">{{ variable.example }}</span>
                        </div>
                        <button mat-raised-button (click)="insertVariable(variable.name)">
                          <mat-icon>add</mat-icon>
                          Insérer
                        </button>
                      </mat-card-content>
                    </mat-card>
                  }
                </div>
              </div>
            </div>
          </mat-tab>
        </mat-tab-group>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-button (click)="onCancel()">
          Annuler
        </button>
        <button 
          mat-raised-button 
          color="primary" 
          (click)="onConfirm()"
          [disabled]="!templateName || !htmlContent">
          <mat-icon>save</mat-icon>
          {{ data.template ? 'Modifier' : 'Créer' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .template-config-dialog {
      max-width: 1000px;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .dialog-header h2 {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
      color: #8B2E2E;
    }

    .tab-content {
      padding: 1rem 0;
    }

    .name-field,
    .description-field,
    .category-field {
      width: 100%;
      margin-bottom: 1rem;
    }

    .html-editor h4 {
      margin: 0 0 1rem 0;
      color: #374151;
    }

    .html-content-field {
      width: 100%;
    }

    .editor-actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 1rem;
    }

    .preview-section h4 {
      margin: 0 0 1rem 0;
      color: #374151;
    }

    .preview-container {
      background: #f9fafb;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .preview-email {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      padding: 1rem;
      min-height: 300px;
      max-height: 500px;
      overflow-y: auto;
    }

    .preview-actions {
      display: flex;
      gap: 0.5rem;
    }

    .variables-section h4 {
      margin: 0 0 1rem 0;
      color: #374151;
    }

    .variables-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .variable-card {
      border-left: 4px solid #8B2E2E;
    }

    .variable-info h5 {
      margin: 0 0 0.25rem 0;
      color: #1f2937;
    }

    .variable-info p {
      margin: 0 0 0.25rem 0;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .variable-example {
      font-family: monospace;
      background: #f3f4f6;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
      color: #374151;
    }

    mat-dialog-actions {
      justify-content: flex-end;
      gap: 0.5rem;
    }
  `]
})
export class TemplateConfigDialogComponent {
  templateName: string = '';
  templateDescription: string = '';
  templateCategory: string = 'newsletter';
  htmlContent: string = '';
  isActive: boolean = true;

  templateCategories = [
    { value: 'newsletter', label: 'Newsletter', icon: 'article' },
    { value: 'promotional', label: 'Promotionnel', icon: 'local_offer' },
    { value: 'transactional', label: 'Transactionnel', icon: 'receipt' },
    { value: 'welcome', label: 'Bienvenue', icon: 'waving_hand' },
    { value: 'abandoned_cart', label: 'Panier abandonné', icon: 'shopping_cart' }
  ];

  availableVariables = [
    {
      name: '{{customer_name}}',
      description: 'Nom du client',
      example: 'John Doe'
    },
    {
      name: '{{customer_email}}',
      description: 'Email du client',
      example: 'john@example.com'
    },
    {
      name: '{{store_name}}',
      description: 'Nom de la boutique',
      example: 'Afrikmode Store'
    },
    {
      name: '{{store_url}}',
      description: 'URL de la boutique',
      example: 'https://afrikmode.com'
    },
    {
      name: '{{unsubscribe_link}}',
      description: 'Lien de désabonnement',
      example: 'https://afrikmode.com/unsubscribe'
    },
    {
      name: '{{current_date}}',
      description: 'Date actuelle',
      example: '15 Janvier 2024'
    },
    {
      name: '{{product_name}}',
      description: 'Nom du produit',
      example: 'T-shirt Afrikmode'
    },
    {
      name: '{{product_price}}',
      description: 'Prix du produit',
      example: '15,000 FCFA'
    }
  ];

  constructor(
    public dialogRef: MatDialogRef<TemplateConfigDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    if (data.template) {
      this.templateName = data.template.name;
      this.templateDescription = data.template.description;
      this.templateCategory = data.template.category;
      this.htmlContent = data.template.htmlContent;
      this.isActive = data.template.isActive;
    } else {
      this.htmlContent = this.getDefaultTemplate();
    }
  }

  getDefaultTemplate(): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{store_name}}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background-color: #8B2E2E; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .button { background-color: #8B2E2E; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>{{store_name}}</h1>
        </div>
        <div class="content">
            <h2>Bonjour {{customer_name}},</h2>
            <p>Contenu de votre email...</p>
            <a href="{{store_url}}" class="button">Visiter la boutique</a>
        </div>
        <div class="footer">
            <p>{{store_name}} - {{store_url}}</p>
            <p><a href="{{unsubscribe_link}}">Se désabonner</a></p>
        </div>
    </div>
</body>
</html>`;
  }

  insertVariable(variableName?: string): void {
    if (variableName) {
      // Insérer la variable à la position du curseur
      this.htmlContent += variableName;
    }
  }

  formatHTML(): void {
    // Logique de formatage HTML basique
    this.htmlContent = this.htmlContent
      .replace(/></g, '>\n<')
      .replace(/^\s+|\s+$/g, '');
  }

  validateHTML(): void {
    // Logique de validation HTML basique
    const hasHtmlTag = this.htmlContent.includes('<html>');
    const hasBodyTag = this.htmlContent.includes('<body>');
    const hasUnsubscribeLink = this.htmlContent.includes('{{unsubscribe_link}}');
    
    if (!hasHtmlTag || !hasBodyTag) {
      alert('Le template doit contenir les balises <html> et <body>');
    } else if (!hasUnsubscribeLink) {
      alert('Le template doit contenir un lien de désabonnement');
    } else {
      alert('Template valide !');
    }
  }

  refreshPreview(): void {
    // L'aperçu se met à jour automatiquement avec [innerHTML]
  }

  downloadPreview(): void {
    const blob = new Blob([this.htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.templateName || 'template'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.templateName && this.htmlContent) {
      this.dialogRef.close({
        name: this.templateName,
        description: this.templateDescription,
        category: this.templateCategory,
        htmlContent: this.htmlContent,
        isActive: this.isActive
      });
    }
  }
}











