import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
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

  isEditMode: boolean = false;
  storeId: string | null = null;
  applicationNumber: string | null = null;

  constructor(
    private storeService: StoreService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Get current user email if available
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.email) {
      this.form.email = currentUser.email;
    }

    // Vérifier si on est en mode édition (vérifier immédiatement et aussi via subscription)
    const params = this.route.snapshot.queryParams;
    if (params['edit'] === 'true' || params['edit'] === true) {
      if (params['id']) {
        this.isEditMode = true;
        this.storeId = params['id'];
        console.log('🔄 Mode édition détecté, chargement des données...');
        this.loadStoreForEdit(params['id']);
      } else {
        console.warn('⚠️ Mode édition activé mais pas d\'ID fourni');
        this.toastService.error('ID de candidature manquant');
      }
    }

    // Écouter aussi les changements de query params (au cas où)
    this.route.queryParams.subscribe(queryParams => {
      if (queryParams['edit'] === 'true' || queryParams['edit'] === true) {
        if (queryParams['id'] && queryParams['id'] !== this.storeId) {
          this.isEditMode = true;
          this.storeId = queryParams['id'];
          console.log('🔄 Mode édition détecté via subscription, chargement des données...');
          this.loadStoreForEdit(queryParams['id']);
        }
      }
    });

    // Scroll to top
    window.scrollTo(0, 0);
  }

  /**
   * Charger les données de la boutique pour édition
   */
  loadStoreForEdit(storeId: string): void {
    this.isLoading = true;
    this.errorMessage = '';
    console.log('🔄 Chargement des données pour édition, storeId:', storeId);
    
    this.storeService.getStore(storeId).subscribe({
      next: (response: any) => {
        console.log('📥 Données boutique chargées pour édition:', response);
        
        // Extraire les données de la réponse (peut être directement store ou response.data)
        const store = response.data || response;
        
        // Pré-remplir le formulaire avec toutes les données disponibles
        this.form.name = store.name || '';
        this.form.description = store.description || '';
        this.form.shortDescription = store.shortDescription || store.short_description || '';
        
        // Contact - vérifier plusieurs emplacements possibles
        this.form.email = store.email || store.contact?.email || this.form.email;
        this.form.phone = store.phone || store.contact?.phone || '';
        this.form.whatsapp = store.whatsapp || '';
        this.form.website = store.website || '';
        
        // Localisation - vérifier plusieurs emplacements possibles
        this.form.country = store.country || store.location?.country || '';
        this.form.region = store.region || store.location?.region || '';
        this.form.city = store.city || store.location?.city || '';
        this.form.postalCode = store.postalCode || store.postal_code || store.location?.postalCode || '';
        this.form.address = store.address || store.location?.address || '';
        
        // Informations business
        this.form.businessType = store.businessType || store.business_type || store.businessInfo?.businessType || '';
        this.form.returnPolicy = store.returnPolicy || store.return_policy || '';
        this.form.shippingPolicy = store.shippingPolicy || store.shipping_policy || '';
        
        // Langues et devises
        this.form.defaultLanguage = store.defaultLanguage || store.languages?.default || store.default_language || 'fr';
        this.form.defaultCurrency = store.defaultCurrency || store.currencies?.default || store.default_currency || 'XOF';

        // Sauvegarder le numéro de candidature
        this.applicationNumber = store.applicationNumber || store.application_number || null;
        console.log('📋 Numéro de candidature:', this.applicationNumber);

        // Charger les documents si disponibles
        if (store.documents) {
          // Les documents sont des URLs, on ne peut pas les pré-charger comme fichiers
          // Mais on peut afficher un message à l'utilisateur
          console.log('📄 Documents existants:', store.documents);
          this.toastService.info('Des documents existent déjà. Vous pouvez les remplacer si nécessaire.');
        }

        this.isLoading = false;
        this.toastService.success('Données de la candidature chargées. Vous pouvez les modifier.');
        console.log('✅ Formulaire pré-rempli avec les données de la boutique');
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement de la boutique:', error);
        this.isLoading = false;
        this.toastService.error('Impossible de charger les données de la candidature');
        // Rediriger vers la page de statut en cas d'erreur
        this.router.navigate(['/vendor/application-status'], {
          queryParams: { number: error.error?.data?.applicationNumber }
        });
      }
    });
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
      
      // Validation côté client avant envoi
      if (!this.form.name || !this.form.name.trim()) {
        this.toastService.error('Le nom de la boutique est obligatoire');
        this.isLoading = false;
        return;
      }
      if (!this.form.description || !this.form.description.trim()) {
        this.toastService.error('La description est obligatoire');
        this.isLoading = false;
        return;
      }
      if (!this.form.city || !this.form.city.trim()) {
        this.toastService.error('La ville est obligatoire');
        this.isLoading = false;
        return;
      }
      if (!this.form.address || !this.form.address.trim()) {
        this.toastService.error('L\'adresse est obligatoire');
        this.isLoading = false;
        return;
      }
      
      // Add all form fields (toujours ajouter les champs requis, même si vides)
      // Multer parse automatiquement les champs texte du FormData
      formData.append('name', this.form.name.trim());
      formData.append('description', this.form.description.trim());
      formData.append('city', this.form.city.trim());
      formData.append('address', this.form.address.trim());
      
      // Ajouter les champs optionnels seulement s'ils ont une valeur
      if (this.form.shortDescription) {
        formData.append('shortDescription', this.form.shortDescription.trim());
      }
      if (this.form.email) {
        formData.append('email', this.form.email.trim());
      }
      if (this.form.phone) {
        formData.append('phone', this.form.phone.trim());
      }
      if (this.form.whatsapp) {
        formData.append('whatsapp', this.form.whatsapp.trim());
      }
      if (this.form.website) {
        formData.append('website', this.form.website.trim());
      }
      if (this.form.country) {
        formData.append('country', this.form.country);
      }
      if (this.form.region) {
        formData.append('region', this.form.region.trim());
      }
      if (this.form.postalCode) {
        formData.append('postalCode', this.form.postalCode.trim());
      }
      if (this.form.businessType) {
        formData.append('businessType', this.form.businessType);
      }
      if (this.form.returnPolicy) {
        formData.append('returnPolicy', this.form.returnPolicy.trim());
      }
      if (this.form.shippingPolicy) {
        formData.append('shippingPolicy', this.form.shippingPolicy.trim());
      }
      if (this.form.defaultLanguage) {
        formData.append('defaultLanguage', this.form.defaultLanguage);
      }
      if (this.form.defaultCurrency) {
        formData.append('defaultCurrency', this.form.defaultCurrency);
      }

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

      // Add application status and metadata (seulement si création, pas en mode édition)
      if (!this.isEditMode) {
        formData.append('status', 'pending');
        formData.append('applicationDate', new Date().toISOString());
      }

      // Utiliser updateStore si on est en mode édition, sinon createStore
      const request = this.isEditMode && this.storeId
        ? this.storeService.updateStore(this.storeId, formData)
        : this.storeService.createStore(formData);

      request.subscribe({
        next: (response: any) => {
          // Si l'API retourne un ID de boutique, on peut uploader les documents après
          const storeId = response?.data?.id || response?.id || response?.storeId || this.storeId;
          
          // Les documents sont déjà inclus dans le FormData initial
          // Si besoin d'un upload séparé, utiliser cette méthode :
          // if (storeId && (this.documents.idCard || this.documents.proofOfAddress || this.documents.businessCertificate)) {
          //   this.storeService.uploadStoreDocuments(storeId, this.documents).subscribe();
          // }

          this.isLoading = false;
          
          // Récupérer le numéro de candidature depuis la réponse du backend
          let applicationNumber = response?.data?.applicationNumber || response?.applicationNumber;
          
          // Si en mode édition et pas de numéro dans la réponse, utiliser celui sauvegardé ou celui de la boutique
          if (this.isEditMode && !applicationNumber) {
            applicationNumber = this.applicationNumber || response?.data?.application_number;
          }
          
          if (this.isEditMode) {
            this.successMessage = 'Candidature modifiée avec succès !';
            this.toastService.success('Votre candidature a été modifiée avec succès !');
            
            // Rediriger vers la page de statut après modification
            setTimeout(() => {
              this.router.navigate(['/vendor/application-status'], {
                queryParams: {
                  number: applicationNumber || ''
                }
              });
            }, 2000);
          } else {
            if (!applicationNumber) {
              console.warn('⚠️ Numéro de candidature non reçu du backend');
            }
            
            this.successMessage = 'Candidature soumise avec succès !';
            this.toastService.success('Votre candidature a été soumise avec succès !');
            
            // Redirect to success page after 2 seconds
            setTimeout(() => {
              this.router.navigate(['/vendor-application-success'], {
                queryParams: {
                  email: this.form.email || '',
                  shopName: this.form.name || '',
                  applicationNumber: applicationNumber || '',
                  id: storeId || ''
                }
              });
            }, 2000);
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('❌ Error submitting vendor application:', error);
          console.error('❌ Error status:', error.status);
          console.error('❌ Error response:', error.error);
          
          // Gestion d'erreurs améliorée
          let errorMsg = 'Erreur lors de la soumission. Veuillez réessayer';
          
          if (error.status === 409) {
            errorMsg = error.error?.error?.message || error.error?.message || 'Une boutique avec ce nom existe déjà';
          } else if (error.status === 422) {
            // Erreur de validation
            const validationErrors = error.error?.error?.details || error.error?.error?.errors || error.error?.details || {};
            if (typeof validationErrors === 'object' && !Array.isArray(validationErrors)) {
              const errorMessages = Object.entries(validationErrors)
                .filter(([key, msg]: [string, any]) => msg !== null && msg !== undefined)
                .map(([key, msg]: [string, any]) => `${msg}`)
                .join(', ');
              errorMsg = errorMessages || 'Erreurs de validation. Veuillez vérifier tous les champs';
            } else if (Array.isArray(validationErrors)) {
              errorMsg = validationErrors.join(', ');
            } else {
              errorMsg = error.error?.error?.message || error.error?.message || 'Données invalides. Veuillez vérifier tous les champs';
            }
          } else if (error.status === 400) {
            errorMsg = error.error?.error?.message || error.error?.message || 'Données invalides';
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


