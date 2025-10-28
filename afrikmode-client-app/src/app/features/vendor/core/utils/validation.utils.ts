/**
 * Utilitaires de validation pour les fonctionnalités vendor
 */

import { FormControl, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Validateur personnalisé pour les emails
 */
export function emailValidator(control: AbstractControl): ValidationErrors | null {
  const email = control.value;
  if (!email) return null;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? null : { invalidEmail: true };
}

/**
 * Validateur personnalisé pour les téléphones
 */
export function phoneValidator(control: AbstractControl): ValidationErrors | null {
  const phone = control.value;
  if (!phone) return null;
  
  const phoneRegex = /^(\+225|225|0)?[0-9]{8,10}$/;
  return phoneRegex.test(phone.replace(/\s/g, '')) ? null : { invalidPhone: true };
}

/**
 * Validateur personnalisé pour les URLs
 */
export function urlValidator(control: AbstractControl): ValidationErrors | null {
  const url = control.value;
  if (!url) return null;
  
  try {
    new URL(url);
    return null;
  } catch {
    return { invalidUrl: true };
  }
}

/**
 * Validateur personnalisé pour les coordonnées GPS
 */
export function coordinatesValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;
  
  const lat = parseFloat(value.latitude);
  const lng = parseFloat(value.longitude);
  
  if (isNaN(lat) || isNaN(lng)) {
    return { invalidCoordinates: true };
  }
  
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return { invalidCoordinates: true };
  }
  
  return null;
}

/**
 * Validateur personnalisé pour les prix
 */
export function priceValidator(control: AbstractControl): ValidationErrors | null {
  const price = control.value;
  if (price === null || price === undefined) return null;
  
  const numPrice = parseFloat(price);
  if (isNaN(numPrice) || numPrice < 0) {
    return { invalidPrice: true };
  }
  
  return null;
}

/**
 * Validateur personnalisé pour les quantités
 */
export function quantityValidator(control: AbstractControl): ValidationErrors | null {
  const quantity = control.value;
  if (quantity === null || quantity === undefined) return null;
  
  const numQuantity = parseInt(quantity);
  if (isNaN(numQuantity) || numQuantity < 0 || !Number.isInteger(numQuantity)) {
    return { invalidQuantity: true };
  }
  
  return null;
}

/**
 * Validateur personnalisé pour les pourcentages
 */
export function percentageValidator(control: AbstractControl): ValidationErrors | null {
  const percentage = control.value;
  if (percentage === null || percentage === undefined) return null;
  
  const numPercentage = parseFloat(percentage);
  if (isNaN(numPercentage) || numPercentage < 0 || numPercentage > 100) {
    return { invalidPercentage: true };
  }
  
  return null;
}

/**
 * Validateur personnalisé pour les mots de passe
 */
export function passwordValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.value;
  if (!password) return null;
  
  const errors: ValidationErrors = {};
  
  if (password.length < 8) {
    errors['minLength'] = { requiredLength: 8, actualLength: password.length };
  }
  
  if (!/[a-z]/.test(password)) {
    errors['missingLowercase'] = true;
  }
  
  if (!/[A-Z]/.test(password)) {
    errors['missingUppercase'] = true;
  }
  
  if (!/[0-9]/.test(password)) {
    errors['missingNumber'] = true;
  }
  
  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors['missingSpecialChar'] = true;
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
}

/**
 * Validateur personnalisé pour la confirmation de mot de passe
 */
export function passwordMatchValidator(passwordField: string) {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.parent?.get(passwordField)?.value;
    const confirmPassword = control.value;
    
    if (!password || !confirmPassword) return null;
    
    return password === confirmPassword ? null : { passwordMismatch: true };
  };
}

/**
 * Validateur personnalisé pour les dates
 */
export function dateValidator(control: AbstractControl): ValidationErrors | null {
  const date = control.value;
  if (!date) return null;
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    return { invalidDate: true };
  }
  
  return null;
}

/**
 * Validateur personnalisé pour les dates futures
 */
export function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  const date = control.value;
  if (!date) return null;
  
  const dateObj = new Date(date);
  const now = new Date();
  
  if (isNaN(dateObj.getTime())) {
    return { invalidDate: true };
  }
  
  if (dateObj <= now) {
    return { pastDate: true };
  }
  
  return null;
}

/**
 * Validateur personnalisé pour les dates passées
 */
export function pastDateValidator(control: AbstractControl): ValidationErrors | null {
  const date = control.value;
  if (!date) return null;
  
  const dateObj = new Date(date);
  const now = new Date();
  
  if (isNaN(dateObj.getTime())) {
    return { invalidDate: true };
  }
  
  if (dateObj >= now) {
    return { futureDate: true };
  }
  
  return null;
}

/**
 * Validateur personnalisé pour les SKUs
 */
export function skuValidator(control: AbstractControl): ValidationErrors | null {
  const sku = control.value;
  if (!sku) return null;
  
  const skuRegex = /^[A-Z0-9-]+$/;
  return skuRegex.test(sku) ? null : { invalidSku: true };
}

/**
 * Validateur personnalisé pour les slugs
 */
export function slugValidator(control: AbstractControl): ValidationErrors | null {
  const slug = control.value;
  if (!slug) return null;
  
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug) ? null : { invalidSlug: true };
}

/**
 * Validateur personnalisé pour les codes de réduction
 */
export function couponCodeValidator(control: AbstractControl): ValidationErrors | null {
  const code = control.value;
  if (!code) return null;
  
  const codeRegex = /^[A-Z0-9-]+$/;
  return codeRegex.test(code) ? null : { invalidCouponCode: true };
}

/**
 * Validateur personnalisé pour les noms de fichiers
 */
export function fileNameValidator(control: AbstractControl): ValidationErrors | null {
  const fileName = control.value;
  if (!fileName) return null;
  
  const invalidChars = /[<>:"/\\|?*]/;
  if (invalidChars.test(fileName)) {
    return { invalidFileName: true };
  }
  
  if (fileName.length > 255) {
    return { fileNameTooLong: true };
  }
  
  return null;
}

/**
 * Validateur personnalisé pour les tailles de fichiers
 */
export function fileSizeValidator(maxSizeInMB: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value;
    if (!file || !(file instanceof File)) return null;
    
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return { 
        fileSizeExceeded: { 
          maxSize: maxSizeInMB, 
          actualSize: Math.round(file.size / (1024 * 1024) * 100) / 100 
        } 
      };
    }
    
    return null;
  };
}

/**
 * Validateur personnalisé pour les types de fichiers
 */
export function fileTypeValidator(allowedTypes: string[]) {
  return (control: AbstractControl): ValidationErrors | null => {
    const file = control.value;
    if (!file || !(file instanceof File)) return null;
    
    const fileType = file.type;
    const isValidType = allowedTypes.some(type => {
      if (type.includes('*')) {
        return fileType.startsWith(type.replace('*', ''));
      }
      return fileType === type;
    });
    
    return isValidType ? null : { invalidFileType: { allowedTypes, actualType: fileType } };
  };
}

/**
 * Validateur personnalisé pour les dimensions d'image
 */
export function imageDimensionsValidator(maxWidth: number, maxHeight: number) {
  return (control: AbstractControl): Promise<ValidationErrors | null> | ValidationErrors | null => {
    const file = control.value;
    if (!file || !(file instanceof File)) return null;
    
    if (!file.type.startsWith('image/')) return null;
    
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.width > maxWidth || img.height > maxHeight) {
          resolve({ 
            imageDimensionsExceeded: { 
              maxWidth, 
              maxHeight, 
              actualWidth: img.width, 
              actualHeight: img.height 
            } 
          });
        } else {
          resolve(null);
        }
      };
      img.onerror = () => resolve({ invalidImage: true });
      img.src = URL.createObjectURL(file);
    });
  };
}

/**
 * Validateur personnalisé pour les codes de pays
 */
export function countryCodeValidator(control: AbstractControl): ValidationErrors | null {
  const code = control.value;
  if (!code) return null;
  
  const validCountryCodes = [
    'CI', 'SN', 'ML', 'BF', 'NE', 'TG', 'BJ', 'GH', 'NG', 'CM', 'TD', 'CF', 'CD', 'CG', 'GA', 'GQ', 'ST'
  ];
  
  return validCountryCodes.includes(code.toUpperCase()) ? null : { invalidCountryCode: true };
}

/**
 * Validateur personnalisé pour les codes de devise
 */
export function currencyCodeValidator(control: AbstractControl): ValidationErrors | null {
  const code = control.value;
  if (!code) return null;
  
  const validCurrencyCodes = ['XOF', 'EUR', 'USD', 'XAF', 'CDF'];
  
  return validCurrencyCodes.includes(code.toUpperCase()) ? null : { invalidCurrencyCode: true };
}

/**
 * Validateur personnalisé pour les plages de dates
 */
export function dateRangeValidator(startDateField: string, endDateField: string) {
  return (control: AbstractControl): ValidationErrors | null => {
    const startDate = control.parent?.get(startDateField)?.value;
    const endDate = control.parent?.get(endDateField)?.value;
    
    if (!startDate || !endDate) return null;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { invalidDateRange: true };
    }
    
    if (start >= end) {
      return { invalidDateRange: true };
    }
    
    return null;
  };
}

/**
 * Validateur personnalisé pour les heures d'ouverture
 */
export function operatingHoursValidator(control: AbstractControl): ValidationErrors | null {
  const hours = control.value;
  if (!hours || typeof hours !== 'object') return null;
  
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  for (const day of days) {
    const dayHours = hours[day];
    if (dayHours && typeof dayHours === 'string') {
      if (!timeRegex.test(dayHours)) {
        return { invalidOperatingHours: { day, time: dayHours } };
      }
    }
  }
  
  return null;
}

/**
 * Validateur personnalisé pour les réseaux sociaux
 */
export function socialLinksValidator(control: AbstractControl): ValidationErrors | null {
  const links = control.value;
  if (!links || typeof links !== 'object') return null;
  
  const socialPlatforms = ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'website'];
  
  for (const platform of socialPlatforms) {
    const url = links[platform];
    if (url && typeof url === 'string') {
      try {
        new URL(url);
      } catch {
        return { invalidSocialLink: { platform, url } };
      }
    }
  }
  
  return null;
}

/**
 * Marque tous les champs d'un formulaire comme touchés
 */
export function markFormGroupTouched(formGroup: FormGroup): void {
  Object.keys(formGroup.controls).forEach(key => {
    const control = formGroup.get(key);
    if (control instanceof FormGroup) {
      markFormGroupTouched(control);
    } else {
      control?.markAsTouched();
    }
  });
}

/**
 * Récupère tous les erreurs d'un formulaire
 */
export function getFormErrors(formGroup: FormGroup): { [key: string]: any } {
  const errors: { [key: string]: any } = {};
  
  Object.keys(formGroup.controls).forEach(key => {
    const control = formGroup.get(key);
    if (control instanceof FormGroup) {
      const nestedErrors = getFormErrors(control);
      if (Object.keys(nestedErrors).length > 0) {
        errors[key] = nestedErrors;
      }
    } else if (control?.errors) {
      errors[key] = control.errors;
    }
  });
  
  return errors;
}

/**
 * Valide un formulaire et retourne les erreurs
 */
export function validateForm(formGroup: FormGroup): boolean {
  markFormGroupTouched(formGroup);
  return formGroup.valid;
}


































