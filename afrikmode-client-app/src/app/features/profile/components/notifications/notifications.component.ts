// src/app/features/profile/components/notifications/notifications.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
  
  preferences = {
    emailNotifications: true,
    orderUpdates: true,
    promotions: false,
    newsletter: true,
    smsNotifications: false,
    pushNotifications: true
  };

  isSaving = false;

  ngOnInit(): void {}

  savePreferences(): void {
    this.isSaving = true;
    
    setTimeout(() => {
      this.isSaving = false;
      alert('Préférences enregistrées !');
    }, 1000);
  }
}