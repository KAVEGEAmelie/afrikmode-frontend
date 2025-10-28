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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatStepperModule } from '@angular/material/stepper';
import { MatRadioModule } from '@angular/material/radio';

interface DialogData {
  campaign?: any;
}

@Component({
  selector: 'app-campaign-config-dialog',
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
    MatDatepickerModule,
    MatNativeDateModule,
    MatStepperModule,
    MatRadioModule
  ],
  template: `
    <div class="campaign-config-dialog">
      <div class="dialog-header">
        <h2 mat-dialog-title>
          <mat-icon>email</mat-icon>
          {{ data.campaign ? 'Modifier la campagne' : 'Nouvelle campagne' }}
        </h2>
        <button mat-icon-button (click)="onCancel()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content>
        <mat-stepper #stepper>
          <!-- Étape 1: Informations de base -->
          <mat-step label="Informations de base">
            <div class="step-content">
              <mat-form-field appearance="outline" class="name-field">
                <mat-label>Nom de la campagne</mat-label>
                <input 
                  matInput 
                  [(ngModel)]="campaignName"
                  placeholder="Ex: Newsletter Janvier 2024">
              </mat-form-field>

              <mat-form-field appearance="outline" class="subject-field">
                <mat-label>Objet de l'email</mat-label>
                <input 
                  matInput 
                  [(ngModel)]="emailSubject"
                  placeholder="Ex: Découvrez nos nouveautés">
              </mat-form-field>

              <mat-form-field appearance="outline" class="type-field">
                <mat-label>Type de campagne</mat-label>
                <mat-select [(ngModel)]="campaignType">
                  @for (type of campaignTypes; track type.value) {
                    <mat-option [value]="type.value">
                      <mat-icon>{{ type.icon }}</mat-icon>
                      {{ type.label }}
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="template-field">
                <mat-label>Template</mat-label>
                <mat-select [(ngModel)]="selectedTemplate">
                  @for (template of availableTemplates; track template.id) {
                    <mat-option [value]="template.id">
                      {{ template.name }}
                    </mat-option>
                  }
                </mat-select>
              </mat-form-field>
            </div>
          </mat-step>

          <!-- Étape 2: Contenu -->
          <mat-step label="Contenu">
            <div class="step-content">
              <div class="content-editor">
                <h4>Contenu de l'email</h4>
                <mat-form-field appearance="outline" class="content-field">
                  <mat-label>Contenu HTML</mat-label>
                  <textarea 
                    matInput 
                    [(ngModel)]="emailContent"
                    placeholder="<html>...</html>"
                    rows="10">
                  </textarea>
                </mat-form-field>

                <div class="content-preview">
                  <h4>Aperçu</h4>
                  <div class="preview-container" [innerHTML]="emailContent">
                  </div>
                </div>
              </div>
            </div>
          </mat-step>

          <!-- Étape 3: Segmentation -->
          <mat-step label="Segmentation">
            <div class="step-content">
              <h4>Sélection des segments</h4>
              <div class="segments-list">
                @for (segment of availableSegments; track segment.id) {
                  <mat-card class="segment-card">
                    <mat-card-content>
                      <div class="segment-info">
                        <mat-checkbox 
                          [(ngModel)]="segment.selected"
                          (change)="updateRecipientCount()">
                          {{ segment.name }}
                        </mat-checkbox>
                        <p>{{ segment.description }}</p>
                        <span class="member-count">{{ segment.memberCount }} membres</span>
                      </div>
                    </mat-card-content>
                  </mat-card>
                }
              </div>

              <div class="recipient-summary">
                <h4>Résumé des destinataires</h4>
                <div class="summary-card">
                  <div class="summary-item">
                    <span>Total destinataires:</span>
                    <span class="total-count">{{ totalRecipients }}</span>
                  </div>
                  <div class="summary-item">
                    <span>Segments sélectionnés:</span>
                    <span>{{ selectedSegmentsCount }}</span>
                  </div>
                </div>
              </div>
            </div>
          </mat-step>

          <!-- Étape 4: Planification -->
          <mat-step label="Planification">
            <div class="step-content">
              <h4>Options d'envoi</h4>
              
              <mat-radio-group [(ngModel)]="sendOption" class="send-options">
                <mat-radio-button value="now">Envoyer maintenant</mat-radio-button>
                <mat-radio-button value="scheduled">Programmer l'envoi</mat-radio-button>
                <mat-radio-button value="draft">Sauvegarder comme brouillon</mat-radio-button>
              </mat-radio-group>

              @if (sendOption === 'scheduled') {
                <div class="scheduling-options">
                  <mat-form-field appearance="outline" class="schedule-date-field">
                    <mat-label>Date d'envoi</mat-label>
                    <input 
                      matInput 
                      [matDatepicker]="picker"
                      [(ngModel)]="scheduledDate">
                    <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                    <mat-datepicker #picker></mat-datepicker>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="schedule-time-field">
                    <mat-label>Heure d'envoi</mat-label>
                    <input 
                      matInput 
                      type="time"
                      [(ngModel)]="scheduledTime">
                  </mat-form-field>
                </div>
              }

              <div class="campaign-tags">
                <h4>Tags</h4>
                <mat-form-field appearance="outline" class="tags-field">
                  <mat-label>Ajouter des tags</mat-label>
                  <mat-chip-grid #chipGrid>
                    @for (tag of campaignTags; track tag) {
                      <mat-chip-row (removed)="removeTag(tag)">
                        {{ tag }}
                        <button matChipRemove>
                          <mat-icon>cancel</mat-icon>
                        </button>
                      </mat-chip-row>
                    }
                  </mat-chip-grid>
                  <input 
                    matInput 
                    [matChipInputFor]="chipGrid"
                    [matChipInputSeparatorKeyCodes]="separatorKeysCodes"
                    (matChipInputTokenEnd)="addTag($event)">
                </mat-form-field>
              </div>
            </div>
          </mat-step>
        </mat-stepper>
      </mat-dialog-content>

      <mat-dialog-actions>
        <button mat-button (click)="onCancel()">
          Annuler
        </button>
        <button 
          mat-raised-button 
          color="primary" 
          (click)="onConfirm()"
          [disabled]="!campaignName || !emailSubject || !emailContent">
          <mat-icon>send</mat-icon>
          {{ getConfirmButtonText() }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .campaign-config-dialog {
      max-width: 900px;
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

    .step-content {
      padding: 1rem 0;
    }

    .name-field,
    .subject-field,
    .type-field,
    .template-field {
      width: 100%;
      margin-bottom: 1rem;
    }

    .content-editor {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .content-field {
      width: 100%;
    }

    .content-preview {
      background: #f9fafb;
      border-radius: 8px;
      padding: 1rem;
    }

    .content-preview h4 {
      margin: 0 0 0.5rem 0;
      color: #374151;
    }

    .preview-container {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      padding: 1rem;
      min-height: 200px;
    }

    .segments-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .segment-card {
      border-left: 4px solid #8B2E2E;
    }

    .segment-info p {
      margin: 0.25rem 0;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .member-count {
      color: #8B2E2E;
      font-weight: 500;
    }

    .recipient-summary h4 {
      margin: 1rem 0 0.5rem 0;
      color: #374151;
    }

    .summary-card {
      background: #fef3f2;
      border-radius: 8px;
      padding: 1rem;
      border-left: 4px solid #8B2E2E;
    }

    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.25rem 0;
    }

    .total-count {
      font-weight: 600;
      color: #8B2E2E;
    }

    .send-options {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .scheduling-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-top: 1rem;
    }

    .campaign-tags h4 {
      margin: 1rem 0 0.5rem 0;
      color: #374151;
    }

    .tags-field {
      width: 100%;
    }

    mat-dialog-actions {
      justify-content: flex-end;
      gap: 0.5rem;
    }

    @media (max-width: 768px) {
      .scheduling-options {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CampaignConfigDialogComponent {
  campaignName: string = '';
  emailSubject: string = '';
  campaignType: string = 'newsletter';
  selectedTemplate: string = '';
  emailContent: string = '';
  sendOption: string = 'draft';
  scheduledDate: Date | null = null;
  scheduledTime: string = '09:00';
  campaignTags: string[] = [];
  totalRecipients: number = 0;
  selectedSegmentsCount: number = 0;

  campaignTypes = [
    { value: 'newsletter', label: 'Newsletter', icon: 'article' },
    { value: 'promotional', label: 'Promotionnel', icon: 'local_offer' },
    { value: 'transactional', label: 'Transactionnel', icon: 'receipt' },
    { value: 'welcome', label: 'Bienvenue', icon: 'waving_hand' },
    { value: 'abandoned_cart', label: 'Panier abandonné', icon: 'shopping_cart' }
  ];

  availableTemplates = [
    { id: '1', name: 'Template Newsletter' },
    { id: '2', name: 'Template Promotionnel' },
    { id: '3', name: 'Template Transactionnel' },
    { id: '4', name: 'Template Bienvenue' }
  ];

  availableSegments = [
    { id: '1', name: 'Clients VIP', description: 'Clients avec plus de 10 commandes', memberCount: 150, selected: false },
    { id: '2', name: 'Nouveaux clients', description: 'Clients inscrits dans les 30 derniers jours', memberCount: 300, selected: false },
    { id: '3', name: 'Clients inactifs', description: 'Pas d\'achat depuis 3 mois', memberCount: 200, selected: false },
    { id: '4', name: 'Tous les clients', description: 'Tous les clients actifs', memberCount: 1200, selected: false }
  ];

  separatorKeysCodes = [13, 188]; // Enter et virgule

  constructor(
    public dialogRef: MatDialogRef<CampaignConfigDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    if (data.campaign) {
      this.campaignName = data.campaign.name;
      this.emailSubject = data.campaign.subject;
      this.campaignType = data.campaign.type;
      this.selectedTemplate = data.campaign.template;
      this.emailContent = data.campaign.content;
      this.campaignTags = data.campaign.tags || [];
    }
  }

  updateRecipientCount(): void {
    this.totalRecipients = this.availableSegments
      .filter(segment => segment.selected)
      .reduce((total, segment) => total + segment.memberCount, 0);
    
    this.selectedSegmentsCount = this.availableSegments
      .filter(segment => segment.selected).length;
  }

  addTag(event: any): void {
    const value = event.value.trim();
    if (value && !this.campaignTags.includes(value)) {
      this.campaignTags.push(value);
    }
    event.chipInput.clear();
  }

  removeTag(tag: string): void {
    const index = this.campaignTags.indexOf(tag);
    if (index >= 0) {
      this.campaignTags.splice(index, 1);
    }
  }

  getConfirmButtonText(): string {
    switch (this.sendOption) {
      case 'now': return 'Envoyer maintenant';
      case 'scheduled': return 'Programmer';
      case 'draft': return 'Sauvegarder';
      default: return 'Confirmer';
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.campaignName && this.emailSubject && this.emailContent) {
      this.dialogRef.close({
        name: this.campaignName,
        subject: this.emailSubject,
        type: this.campaignType,
        template: this.selectedTemplate,
        content: this.emailContent,
        sendOption: this.sendOption,
        scheduledDate: this.scheduledDate,
        scheduledTime: this.scheduledTime,
        tags: this.campaignTags,
        segments: this.availableSegments.filter(s => s.selected).map(s => s.id)
      });
    }
  }
}
