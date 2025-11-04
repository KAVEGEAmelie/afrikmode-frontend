import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StoreService } from '../../core/services/store.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';

interface FormData {
  // Shop Info
  name: string;
  description: string;
  shortDescription: string;
  
  // Contact
  email: string;
  phone: string;
  whatsapp: string;
  website: string;
  
  // Address
  country: string;
  region: string;
  city: string;
  postalCode: string;
  address: string;
  
  // Legal
  businessType: string;
  registrationNumber: string;
  taxNumber: string;
  bankName: string;
  bankAccount: string;
  returnPolicy: string;
  shippingPolicy: string;
  
  // System
  defaultLanguage: string;
  defaultCurrency: string;
}

interface DocumentFiles {
  idCard: File | null;
  proofOfAddress: File | null;
  businessCertificate: File | null;
}

interface Step {
  title: string;
  description: string;
  fields: string[];
}

interface Country {
  code: string;
  name: string;
  flag: string;
}

@Component({
  selector: 'app-vendor-apply',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgFor],
  templateUrl: './vendor-apply.component.html',
  styleUrl: './vendor-apply.component.scss'
})
export class VendorApplyComponent implements OnInit {
  currentStep: number = 1;
  totalSteps: number = 5;
  isLoading: boolean = false;
  acceptTerms: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  steps: Step[] = [
    {
      title: 'Boutique',
      description: 'Informations de base',
      fields: ['name', 'description']
    },
    {
      title: 'Contact',
      description: 'Coordonnées',
      fields: ['email', 'phone', 'country', 'city', 'address']
    },
    {
      title: 'Légal',
      description: 'Informations légales',
      fields: ['businessType']
    },
    {
      title: 'Documents',
      description: 'Pièces justificatives',
      fields: ['idCard', 'proofOfAddress']
    },
    {
      title: 'Validation',
      description: 'Vérification finale',
      fields: []
    }
  ];

  form: FormData = {
    name: '',
    description: '',
    shortDescription: '',
    email: '',
    phone: '',
    whatsapp: '',
    website: '',
    country: '',
    region: '',
    city: '',
    postalCode: '',
    address: '',
    businessType: '',
    registrationNumber: '',
    taxNumber: '',
    bankName: '',
    bankAccount: '',
    returnPolicy: '',
    shippingPolicy: '',
    defaultLanguage: 'fr',
    defaultCurrency: 'XOF'
  };

  documents: DocumentFiles = {
    idCard: null,
    proofOfAddress: null,
    businessCertificate: null
  };

  countries: Country[] = [
    { code: 'TG', name: 'Togo', flag: '🇹🇬' },
    { code: 'BJ', name: 'Bénin', flag: '🇧🇯' },
    { code: 'CI', name: 'Côte d\'Ivoire', flag: '🇨🇮' },
    { code: 'SN', name: 'Sénégal', flag: '🇸🇳' },
    { code: 'ML', name: 'Mali', flag: '🇲🇱' },
    { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
    { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
    { code: 'CM', name: 'Cameroun', flag: '🇨🇲' },
    { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
    { code: 'FR', name: 'France', flag: '🇫🇷' }
  ];

  constructor(
    private storeService: StoreService,
    private router: Router,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get current user email if available
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.email) {
      this.form.email = currentUser.email;
    }

    // Scroll to top
    window.scrollTo(0, 0);
  }

  /**
   * Navigate to next step
   */
  nextStep(): void {
    if (!this.canProceedToNextStep()) {
      this.toastService.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Navigate to previous step
   */
  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Check if can proceed to next step based on required fields
   */
  canProceedToNextStep(): boolean {
    switch (this.currentStep) {
      case 1: // Shop Info
        return !!(this.form.name?.trim() && 
                 this.form.description?.trim() && 
                 this.form.description.length >= 50);
      
      case 2: // Contact & Address
        return !!(this.form.country && 
                 this.form.city?.trim() && 
                 this.form.address?.trim());
      
      case 3: // Legal Info
        return !!this.form.businessType;
      
      case 4: // Documents
        return !!(this.documents.idCard && this.documents.proofOfAddress);
      
      case 5: // Review
        return this.acceptTerms;
      
      default:
        return true;
    }
  }

  /**
   * Handle file selection
   */
  onFileSelect(event: Event, documentType: keyof DocumentFiles): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      this.toastService.error('Format de fichier non supporté. Utilisez PDF, JPG ou PNG');
      input.value = '';
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      this.toastService.error('Le fichier est trop volumineux. Maximum 5MB');
      input.value = '';
      return;
    }

    this.documents[documentType] = file;
    this.toastService.success(`${file.name} ajouté avec succès`);
  }

  /**
   * Remove selected file
   */
  removeFile(documentType: keyof DocumentFiles): void {
    this.documents[documentType] = null;
    this.toastService.info('Fichier supprimé');
  }

  /**
   * Get business type label for display
   */
  getBusinessTypeLabel(type: string): string {
    const types: { [key: string]: string } = {
      'individual': 'Entrepreneur Individuel',
      'company': 'Société (SARL, SA, SAS...)',
      'cooperative': 'Coopérative',
      'association': 'Association'
    };
    return types[type] || type;
  }

  /**
   * Submit the vendor application
   */
  async onSubmit(): Promise<void> {
    if (!this.acceptTerms) {
      this.toastService.error('Veuillez accepter les conditions générales');
      return;
    }

    if (!this.canProceedToNextStep()) {
      this.toastService.error('Veuillez compléter tous les champs obligatoires');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      // Prepare form data with documents
      const formData = new FormData();
      
      // Add all form fields
      Object.entries(this.form).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value.toString());
        }
      });

      // Add documents
      if (this.documents.idCard) {
        formData.append('idCard', this.documents.idCard);
      }
      if (this.documents.proofOfAddress) {
        formData.append('proofOfAddress', this.documents.proofOfAddress);
      }
      if (this.documents.businessCertificate) {
        formData.append('businessCertificate', this.documents.businessCertificate);
      }

      // Add application status and metadata
      formData.append('status', 'pending');
      formData.append('applicationDate', new Date().toISOString());

      // Envoyer tout en FormData pour inclure les documents
      // Le storeService.createStore accepte maintenant FormData
      this.storeService.createStore(formData).subscribe({
        next: (response: any) => {
          // Si l'API retourne un ID de boutique, on peut uploader les documents après
          const storeId = response?.data?.id || response?.id || response?.storeId;
          
          // Les documents sont déjà inclus dans le FormData initial
          // Si besoin d'un upload séparé, utiliser cette méthode :
          // if (storeId && (this.documents.idCard || this.documents.proofOfAddress || this.documents.businessCertificate)) {
          //   this.storeService.uploadStoreDocuments(storeId, this.documents).subscribe();
          // }

          this.isLoading = false;
          const applicationNumber = response?.data?.applicationNumber || response?.applicationNumber || 
                                  `VA-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
          
          this.successMessage = 'Candidature soumise avec succès !';
          this.toastService.success('Votre candidature a été soumise avec succès !');
          
          // Redirect to success page after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/vendor-application-success'], {
              queryParams: {
                email: this.form.email,
                shopName: this.form.name,
                applicationNumber: applicationNumber,
                id: storeId
              }
            });
          }, 2000);
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error submitting vendor application:', error);
          
          // Gestion d'erreurs améliorée
          let errorMsg = 'Erreur lors de la soumission. Veuillez réessayer';
          
          if (error.status === 409) {
            errorMsg = error.error?.message || 'Une boutique avec ce nom existe déjà';
          } else if (error.status === 422) {
            const errors = error.error?.errors || error.error?.data?.errors;
            if (errors && Array.isArray(errors)) {
              errorMsg = errors.join(', ');
            } else {
              errorMsg = error.error?.message || 'Données invalides. Veuillez vérifier tous les champs';
            }
          } else if (error.status === 400) {
            errorMsg = error.error?.message || 'Données invalides';
          } else if (error.status === 403) {
            errorMsg = error.error?.message || 'Vous n\'êtes pas autorisé à soumettre une candidature';
          } else if (error.status === 401) {
            errorMsg = 'Votre session a expiré. Veuillez vous reconnecter';
            setTimeout(() => {
              this.router.navigate(['/login'], {
                queryParams: { returnUrl: '/vendor/apply' }
              });
            }, 2000);
          } else if (error.status === 0 || error.status >= 500) {
            errorMsg = 'Erreur serveur. Veuillez réessayer plus tard';
          }
          
          this.errorMessage = errorMsg;
          this.toastService.error(errorMsg);
          
          // Scroll to error message
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });

    } catch (error) {
      this.isLoading = false;
      this.errorMessage = 'Une erreur inattendue s\'est produite';
      this.toastService.error(this.errorMessage);
      console.error('Unexpected error:', error);
    }
  }

  /**
   * Navigate to specific step (for editing from review)
   */
  goToStep(stepNumber: number): void {
    if (stepNumber >= 1 && stepNumber <= this.totalSteps) {
      this.currentStep = stepNumber;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

}


