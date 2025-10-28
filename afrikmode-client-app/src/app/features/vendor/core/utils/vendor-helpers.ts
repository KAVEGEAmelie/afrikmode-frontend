/**
 * Utilitaires pour les fonctionnalités vendor
 */

import { OrderStatus, PaymentStatus, StoreStatus, ProductStatus } from '../enums';

/**
 * Formate un montant en devise locale
 */
export function formatCurrency(amount: number, currency: string = 'XOF'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency === 'XOF' ? 'XOF' : 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Formate un pourcentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formate une date en français
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };

  return new Intl.DateTimeFormat('fr-FR', defaultOptions).format(dateObj);
}

/**
 * Formate une date relative (il y a X temps)
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'À l\'instant';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `Il y a ${diffInMinutes} min`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `Il y a ${diffInHours}h`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `Il y a ${diffInWeeks} semaine${diffInWeeks > 1 ? 's' : ''}`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `Il y a ${diffInMonths} mois`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `Il y a ${diffInYears} an${diffInYears > 1 ? 's' : ''}`;
}

/**
 * Génère un slug à partir d'un texte
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9\s-]/g, '') // Garder seulement lettres, chiffres, espaces et tirets
    .replace(/\s+/g, '-') // Remplacer espaces par tirets
    .replace(/-+/g, '-') // Remplacer tirets multiples par un seul
    .trim();
}

/**
 * Valide une adresse email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valide un numéro de téléphone
 */
export function isValidPhone(phone: string): boolean {
  // Format international ou local (Afrique de l'Ouest)
  const phoneRegex = /^(\+225|225|0)?[0-9]{8,10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Formate un numéro de téléphone
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('225')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0')) {
    return `+225${cleaned.substring(1)}`;
  } else if (cleaned.length === 8) {
    return `+225${cleaned}`;
  }
  
  return phone;
}

/**
 * Calcule la commission sur un montant
 */
export function calculateCommission(amount: number, commissionRate: number): number {
  return Math.round(amount * (commissionRate / 100));
}

/**
 * Calcule le montant net après commission
 */
export function calculateNetAmount(amount: number, commissionRate: number): number {
  return amount - calculateCommission(amount, commissionRate);
}

/**
 * Calcule le pourcentage de variation
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue > 0 ? 100 : 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Génère un numéro de commande unique
 */
export function generateOrderNumber(prefix: string = 'AFM'): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Génère un SKU de produit
 */
export function generateSKU(name: string, category?: string): string {
  const namePart = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 4);
  
  const categoryPart = category
    ? category.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 2)
    : 'GEN';
  
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `${categoryPart}-${namePart}-${random}`;
}

/**
 * Valide une URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extrait le nom de domaine d'une URL
 */
export function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}

/**
 * Génère une couleur aléatoire
 */
export function generateRandomColor(): string {
  const colors = [
    '#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6',
    '#1abc9c', '#34495e', '#e67e22', '#95a5a6', '#f1c40f'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * Génère une couleur basée sur un texte (pour les avatars)
 */
export function generateColorFromText(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Tronque un texte
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalise la première lettre
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * Capitalise chaque mot
 */
export function capitalizeWords(text: string): string {
  return text
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Formate un nombre avec séparateurs de milliers
 */
export function formatNumber(number: number): string {
  return new Intl.NumberFormat('fr-FR').format(number);
}

/**
 * Calcule la distance entre deux points GPS
 */
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

/**
 * Valide les coordonnées GPS
 */
export function isValidCoordinates(lat: number, lng: number): boolean {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

/**
 * Génère un mot de passe sécurisé
 */
export function generatePassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return password;
}

/**
 * Valide la force d'un mot de passe
 */
export function validatePasswordStrength(password: string): {
  score: number;
  feedback: string[];
  isValid: boolean;
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('Au moins 8 caractères requis');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    feedback.push('Ajoutez des minuscules');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Ajoutez des majuscules');
  } else {
    score += 1;
  }

  if (!/[0-9]/.test(password)) {
    feedback.push('Ajoutez des chiffres');
  } else {
    score += 1;
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    feedback.push('Ajoutez des caractères spéciaux');
  } else {
    score += 1;
  }

  return {
    score,
    feedback,
    isValid: score >= 4
  };
}

/**
 * Débounce une fonction
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle une fonction
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Retry une fonction avec backoff exponentiel
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i === maxRetries - 1) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, i);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

/**
 * Convertit un objet en FormData
 */
export function objectToFormData(obj: any): FormData {
  const formData = new FormData();
  
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    
    if (value instanceof File) {
      formData.append(key, value);
    } else if (value instanceof Date) {
      formData.append(key, value.toISOString());
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item instanceof File) {
          formData.append(`${key}[${index}]`, item);
        } else {
          formData.append(`${key}[${index}]`, JSON.stringify(item));
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });
  
  return formData;
}

/**
 * Nettoie un objet en supprimant les valeurs vides
 */
export function cleanObject(obj: any): any {
  const cleaned: any = {};
  
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    
    if (value !== null && value !== undefined && value !== '') {
      if (typeof value === 'object' && !Array.isArray(value)) {
        const cleanedNested = cleanObject(value);
        if (Object.keys(cleanedNested).length > 0) {
          cleaned[key] = cleanedNested;
        }
      } else {
        cleaned[key] = value;
      }
    }
  });
  
  return cleaned;
}

/**
 * Vérifie si un objet est vide
 */
export function isEmpty(obj: any): boolean {
  if (obj == null) return true;
  if (typeof obj === 'string' || Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === 'object') return Object.keys(obj).length === 0;
  return false;
}

/**
 * Clone profond d'un objet
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as any;
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as any;
  if (typeof obj === 'object') {
    const cloned: any = {};
    Object.keys(obj).forEach(key => {
      cloned[key] = deepClone((obj as any)[key]);
    });
    return cloned;
  }
  return obj;
}




