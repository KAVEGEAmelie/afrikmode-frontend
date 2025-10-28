/**
 * Utilitaires de gestion du stockage local et session
 */

import { Injectable } from '@angular/core';

// Interfaces pour typer les données stockées
interface FormData {
  data: any;
  timestamp: number;
}

interface CacheData {
  data: any;
  timestamp: number;
  ttl: number;
}

@Injectable({
  providedIn: 'root'
})
export class StorageUtils {
  private readonly PREFIX = 'afrikmode_vendor_';

  /**
   * Stocker une valeur dans le localStorage
   */
  setLocalItem(key: string, value: any): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(this.PREFIX + key, serializedValue);
    } catch (error) {
      console.error('Erreur lors du stockage local:', error);
    }
  }

  /**
   * Récupérer une valeur du localStorage
   */
  getLocalItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = localStorage.getItem(this.PREFIX + key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error('Erreur lors de la récupération locale:', error);
      return defaultValue || null;
    }
  }

  /**
   * Supprimer une valeur du localStorage
   */
  removeLocalItem(key: string): void {
    try {
      localStorage.removeItem(this.PREFIX + key);
    } catch (error) {
      console.error('Erreur lors de la suppression locale:', error);
    }
  }

  /**
   * Vider le localStorage
   */
  clearLocalStorage(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Erreur lors du nettoyage local:', error);
    }
  }

  /**
   * Stocker une valeur dans le sessionStorage
   */
  setSessionItem(key: string, value: any): void {
    try {
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(this.PREFIX + key, serializedValue);
    } catch (error) {
      console.error('Erreur lors du stockage session:', error);
    }
  }

  /**
   * Récupérer une valeur du sessionStorage
   */
  getSessionItem<T>(key: string, defaultValue?: T): T | null {
    try {
      const item = sessionStorage.getItem(this.PREFIX + key);
      return item ? JSON.parse(item) : defaultValue || null;
    } catch (error) {
      console.error('Erreur lors de la récupération session:', error);
      return defaultValue || null;
    }
  }

  /**
   * Supprimer une valeur du sessionStorage
   */
  removeSessionItem(key: string): void {
    try {
      sessionStorage.removeItem(this.PREFIX + key);
    } catch (error) {
      console.error('Erreur lors de la suppression session:', error);
    }
  }

  /**
   * Vider le sessionStorage
   */
  clearSessionStorage(): void {
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Erreur lors du nettoyage session:', error);
    }
  }

  /**
   * Vérifier si une clé existe dans le localStorage
   */
  hasLocalItem(key: string): boolean {
    return localStorage.getItem(this.PREFIX + key) !== null;
  }

  /**
   * Vérifier si une clé existe dans le sessionStorage
   */
  hasSessionItem(key: string): boolean {
    return sessionStorage.getItem(this.PREFIX + key) !== null;
  }

  /**
   * Obtenir toutes les clés du localStorage
   */
  getLocalKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.PREFIX)) {
        keys.push(key.replace(this.PREFIX, ''));
      }
    }
    return keys;
  }

  /**
   * Obtenir toutes les clés du sessionStorage
   */
  getSessionKeys(): string[] {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(this.PREFIX)) {
        keys.push(key.replace(this.PREFIX, ''));
      }
    }
    return keys;
  }

  /**
   * Obtenir la taille utilisée par le localStorage
   */
  getLocalStorageSize(): number {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.startsWith(this.PREFIX)) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  }

  /**
   * Obtenir la taille utilisée par le sessionStorage
   */
  getSessionStorageSize(): number {
    let total = 0;
    for (let key in sessionStorage) {
      if (sessionStorage.hasOwnProperty(key) && key.startsWith(this.PREFIX)) {
        total += sessionStorage[key].length + key.length;
      }
    }
    return total;
  }

  /**
   * Stocker des données de formulaire temporairement
   */
  saveFormData(formName: string, data: any): void {
    this.setSessionItem(`form_${formName}`, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Récupérer des données de formulaire temporaires
   */
  getFormData<T>(formName: string, maxAge: number = 24 * 60 * 60 * 1000): T | null {
    const formData = this.getSessionItem<FormData>(`form_${formName}`);
    if (!formData) return null;

    const age = Date.now() - formData.timestamp;
    if (age > maxAge) {
      this.removeSessionItem(`form_${formName}`);
      return null;
    }

    return formData.data;
  }

  /**
   * Supprimer des données de formulaire temporaires
   */
  clearFormData(formName: string): void {
    this.removeSessionItem(`form_${formName}`);
  }

  /**
   * Stocker les préférences utilisateur
   */
  saveUserPreferences(preferences: any): void {
    this.setLocalItem('user_preferences', preferences);
  }

  /**
   * Récupérer les préférences utilisateur
   */
  getUserPreferences(): any {
    return this.getLocalItem('user_preferences', {});
  }

  /**
   * Stocker les filtres de tableau
   */
  saveTableFilters(tableName: string, filters: any): void {
    this.setLocalItem(`table_filters_${tableName}`, filters);
  }

  /**
   * Récupérer les filtres de tableau
   */
  getTableFilters(tableName: string): any {
    return this.getLocalItem(`table_filters_${tableName}`, {});
  }

  /**
   * Supprimer les filtres de tableau
   */
  clearTableFilters(tableName: string): void {
    this.removeLocalItem(`table_filters_${tableName}`);
  }

  /**
   * Stocker l'état de la sidebar
   */
  saveSidebarState(collapsed: boolean): void {
    this.setLocalItem('sidebar_collapsed', collapsed);
  }

  /**
   * Récupérer l'état de la sidebar
   */
  getSidebarState(): boolean {
    return this.getLocalItem<boolean>('sidebar_collapsed', false) ?? false;
  }

  /**
   * Stocker les données de cache
   */
  setCacheData(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    const cacheData = {
      data,
      timestamp: Date.now(),
      ttl
    };
    this.setLocalItem(`cache_${key}`, cacheData);
  }

  /**
   * Récupérer des données de cache
   */
  getCacheData<T>(key: string): T | null {
    const cacheData = this.getLocalItem<CacheData>(`cache_${key}`);
    if (!cacheData) return null;

    const age = Date.now() - cacheData.timestamp;
    if (age > cacheData.ttl) {
      this.removeLocalItem(`cache_${key}`);
      return null;
    }

    return cacheData.data;
  }

  /**
   * Supprimer des données de cache
   */
  clearCacheData(key: string): void {
    this.removeLocalItem(`cache_${key}`);
  }

  /**
   * Nettoyer le cache expiré
   */
  cleanExpiredCache(): void {
    const keys = this.getLocalKeys();
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        const cacheData = this.getLocalItem<CacheData>(key);
        if (cacheData && cacheData.timestamp && cacheData.ttl) {
          const age = Date.now() - cacheData.timestamp;
          if (age > cacheData.ttl) {
            this.removeLocalItem(key);
          }
        }
      }
    });
  }

  /**
   * Stocker les données de pagination
   */
  savePaginationData(tableName: string, page: number, pageSize: number, sortBy?: string, sortOrder?: string): void {
    this.setLocalItem(`pagination_${tableName}`, {
      page,
      pageSize,
      sortBy,
      sortOrder
    });
  }

  /**
   * Récupérer les données de pagination
   */
  getPaginationData(tableName: string): any {
    return this.getLocalItem(`pagination_${tableName}`, {
      page: 1,
      pageSize: 20,
      sortBy: 'created_at',
      sortOrder: 'desc'
    });
  }

  /**
   * Supprimer les données de pagination
   */
  clearPaginationData(tableName: string): void {
    this.removeLocalItem(`pagination_${tableName}`);
  }

  /**
   * Stocker les données de recherche
   */
  saveSearchData(tableName: string, searchTerm: string, filters: any): void {
    this.setSessionItem(`search_${tableName}`, {
      searchTerm,
      filters,
      timestamp: Date.now()
    });
  }

  /**
   * Récupérer les données de recherche
   */
  getSearchData(tableName: string): any {
    return this.getSessionItem(`search_${tableName}`);
  }

  /**
   * Supprimer les données de recherche
   */
  clearSearchData(tableName: string): void {
    this.removeSessionItem(`search_${tableName}`);
  }

  /**
   * Exporter les données stockées
   */
  exportStorageData(): any {
    const data: any = {
      localStorage: {},
      sessionStorage: {}
    };

    // Exporter localStorage
    const localKeys = this.getLocalKeys();
    localKeys.forEach(key => {
      data.localStorage[key] = this.getLocalItem(key);
    });

    // Exporter sessionStorage
    const sessionKeys = this.getSessionKeys();
    sessionKeys.forEach(key => {
      data.sessionStorage[key] = this.getSessionItem(key);
    });

    return data;
  }

  /**
   * Importer des données stockées
   */
  importStorageData(data: any): void {
    if (data.localStorage) {
      Object.keys(data.localStorage).forEach(key => {
        this.setLocalItem(key, data.localStorage[key]);
      });
    }

    if (data.sessionStorage) {
      Object.keys(data.sessionStorage).forEach(key => {
        this.setSessionItem(key, data.sessionStorage[key]);
      });
    }
  }

  /**
   * Nettoyer toutes les données temporaires
   */
  cleanTemporaryData(): void {
    const localKeys = this.getLocalKeys();
    const sessionKeys = this.getSessionKeys();

    // Nettoyer les données de formulaire expirées
    sessionKeys.forEach(key => {
      if (key.startsWith('form_')) {
        const formData = this.getSessionItem<FormData>(key);
        if (formData && formData.timestamp) {
          const age = Date.now() - formData.timestamp;
          if (age > 24 * 60 * 60 * 1000) { // 24 heures
            this.removeSessionItem(key);
          }
        }
      }
    });

    // Nettoyer le cache expiré
    this.cleanExpiredCache();
  }
}




