// src/app/features/profile/components/personal-info/personal-info.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIf],
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss']
})
export class PersonalInfoComponent implements OnInit {
  
  personalInfoForm: FormGroup;
  isUpdating = false;

  constructor(private fb: FormBuilder) {
    this.personalInfoForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      dateOfBirth: [''],
      gender: ['']
    });
  }

  ngOnInit(): void {
    // Charger les données utilisateur
    this.loadUserData();
  }

  loadUserData(): void {
    // Simuler les données utilisateur
    const userData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+228 90 12 34 56',
      dateOfBirth: '1990-01-15',
      gender: 'male'
    };

    this.personalInfoForm.patchValue(userData);
  }

  onSubmit(): void {
    if (this.personalInfoForm.valid) {
      this.isUpdating = true;
      
      // Simuler la sauvegarde
      setTimeout(() => {
        console.log('Informations personnelles mises à jour:', this.personalInfoForm.value);
        this.isUpdating = false;
        // Afficher un message de succès
      }, 1000);
    }
  }

  onCancel(): void {
    this.loadUserData(); // Réinitialiser le formulaire
  }
}
