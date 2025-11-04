// src/app/features/profile/components/personal-info/personal-info.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss']
})
export class PersonalInfoComponent implements OnInit {
  
  personalInfoForm: FormGroup;
  isUpdating = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  
  // Photo de profil
  selectedFile: File | null = null;
  avatarPreview: string | null = null;
  isUploadingAvatar = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {
    this.personalInfoForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      date_of_birth: [''],
      gender: ['']
    });
  }

  ngOnInit(): void {
    // Charger les données utilisateur
    this.loadUserData();
  }

  loadUserData(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.userService.getProfile().subscribe({
      next: (response) => {
        console.log('✅ Données utilisateur chargées:', JSON.stringify(response, null, 2));
        
        // L'API retourne les données dans response.data
        const user = response.data || response;
        
        this.personalInfoForm.patchValue({
          first_name: user.firstName,
          last_name: user.lastName,
          email: user.email,
          phone: user.phone,
          date_of_birth: user.birthDate,
          gender: user.gender
        });
        this.isLoading = false;
        this.successMessage = 'Profil chargé avec succès';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement du profil:', error);
        this.isLoading = false;
        
        // Si erreur d'authentification, rediriger vers la connexion
        if (error.status === 401 || error.status === 403) {
          this.errorMessage = 'Session expirée. Redirection vers la connexion...';
          setTimeout(() => {
            this.authService.logout();
            this.router.navigate(['/auth/login']);
          }, 2000);
          return;
        }
        
        this.errorMessage = `Erreur de connexion: ${error.userMessage || error.message || 'Impossible de charger le profil'}`;
      }
    });
  }

  onSubmit(): void {
    if (this.personalInfoForm.valid) {
      this.isUpdating = true;
      this.errorMessage = '';
      this.successMessage = '';
      
      console.log('🔄 Mise à jour du profil:', this.personalInfoForm.value);
      
      this.userService.updateProfile(this.personalInfoForm.value).subscribe({
        next: (updatedUser) => {
          console.log('✅ Profil mis à jour avec succès:', updatedUser);
          this.isUpdating = false;
          // Mettre à jour le service d'authentification
          this.authService.updateUser(updatedUser);
          this.successMessage = 'Profil mis à jour avec succès !';
          setTimeout(() => this.successMessage = '', 5000);
        },
        error: (error) => {
          console.error('❌ Erreur lors de la mise à jour:', error);
          this.isUpdating = false;
          this.errorMessage = `Erreur de mise à jour: ${error.userMessage || error.message || 'Impossible de mettre à jour le profil'}`;
        }
      });
    } else {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires';
    }
  }

  onCancel(): void {
    this.loadUserData(); // Réinitialiser le formulaire
  }

  // Gestion de la photo de profil
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Créer un aperçu de l'image
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.avatarPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadAvatar(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Veuillez sélectionner un fichier';
      return;
    }

    this.isUploadingAvatar = true;
    this.errorMessage = '';

    this.userService.uploadAvatar(this.selectedFile).subscribe({
      next: (response) => {
        console.log('✅ Avatar uploadé avec succès:', response);
        this.isUploadingAvatar = false;
        this.successMessage = 'Photo de profil mise à jour avec succès !';
        setTimeout(() => this.successMessage = '', 5000);
        
        // Mettre à jour l'aperçu si l'API retourne une URL
        if (response.avatarUrl) {
          this.avatarPreview = response.avatarUrl;
        }
      },
      error: (error) => {
        console.error('❌ Erreur lors de l\'upload:', error);
        this.isUploadingAvatar = false;
        this.errorMessage = `Erreur d'upload: ${error.userMessage || error.message || 'Impossible de télécharger la photo'}`;
      }
    });
  }

  removeAvatar(): void {
    this.userService.removeAvatar().subscribe({
      next: () => {
        console.log('✅ Avatar supprimé avec succès');
        this.avatarPreview = null;
        this.selectedFile = null;
        this.successMessage = 'Photo de profil supprimée avec succès !';
        setTimeout(() => this.successMessage = '', 5000);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la suppression:', error);
        this.errorMessage = `Erreur de suppression: ${error.userMessage || error.message || 'Impossible de supprimer la photo'}`;
      }
    });
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('avatar-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }
}
