// src/app/core/services/geolocation.service.ts
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
}

export interface GeolocationResult {
  coordinates: GeolocationCoordinates;
  address?: string;
  city?: string;
  country?: string;
  timestamp: number;
}

export interface NearbyStore {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  distance: number;
  phone?: string;
  hours?: any;
}

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  private baseUrl = 'http://localhost:5000/api';
  private currentLocationSubject = new BehaviorSubject<GeolocationResult | null>(null);
  public currentLocation$ = this.currentLocationSubject.asObservable();
  private watchId: number | null = null;

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('auth_token');
    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  private buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== null && value !== undefined && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }
    return httpParams;
  }

  // Obtenir la position actuelle
  getCurrentPosition(options?: PositionOptions): Observable<GeolocationResult> {
    return new Observable(observer => {
      if (!navigator.geolocation) {
        observer.error('Geolocation is not supported by this browser');
        return;
      }

      const defaultOptions: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      };

      const finalOptions = { ...defaultOptions, ...options };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const result: GeolocationResult = {
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude || undefined,
              altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
              heading: position.coords.heading || undefined,
              speed: position.coords.speed || undefined
            },
            timestamp: position.timestamp
          };

          this.currentLocationSubject.next(result);
          observer.next(result);
          observer.complete();
        },
        (error) => {
          let errorMessage = 'Unknown geolocation error';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'User denied the request for Geolocation';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'The request to get user location timed out';
              break;
          }
          observer.error(new Error(errorMessage));
        },
        finalOptions
      );
    });
  }

  // Surveiller la position en continu
  watchPosition(options?: PositionOptions): Observable<GeolocationResult> {
    return new Observable(observer => {
      if (!navigator.geolocation) {
        observer.error('Geolocation is not supported by this browser');
        return;
      }

      const defaultOptions: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      };

      const finalOptions = { ...defaultOptions, ...options };

      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const result: GeolocationResult = {
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude || undefined,
              altitudeAccuracy: position.coords.altitudeAccuracy || undefined,
              heading: position.coords.heading || undefined,
              speed: position.coords.speed || undefined
            },
            timestamp: position.timestamp
          };

          this.currentLocationSubject.next(result);
          observer.next(result);
        },
        (error) => observer.error(error),
        finalOptions
      );

      // Cleanup function
      return () => {
        if (this.watchId !== null) {
          navigator.geolocation.clearWatch(this.watchId);
          this.watchId = null;
        }
      };
    });
  }

  // Arrêter la surveillance
  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // Géocodage - Adresse vers coordonnées
  geocodeAddress(address: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/geolocation/geocode`, 
      { address }, 
      { headers: this.getHeaders() }
    );
  }

  // Géocodage inverse - Coordonnées vers adresse
  reverseGeocode(lat: number, lng: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/geolocation/reverse-geocode`, 
      { latitude: lat, longitude: lng }, 
      { headers: this.getHeaders() }
    );
  }

  // Trouver les magasins à proximité
  getNearbyStores(lat: number, lng: number, radius: number = 10): Observable<NearbyStore[]> {
    return this.http.get<NearbyStore[]>(`${this.baseUrl}/geolocation/nearby-stores`, {
      headers: this.getHeaders(),
      params: this.buildParams({ 
        latitude: lat, 
        longitude: lng, 
        radius: radius 
      })
    });
  }

  // Calculer la distance entre deux points
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Rayon de la Terre en km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return Math.round(distance * 100) / 100; // Arrondi à 2 décimales
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // Obtenir la position sauvegardée
  getCurrentLocation(): GeolocationResult | null {
    return this.currentLocationSubject.value;
  }

  // Vérifier si la géolocalisation est supportée
  isGeolocationSupported(): boolean {
    return 'geolocation' in navigator;
  }

  // Demander la permission de géolocalisation
  requestPermission(): Promise<PermissionState> {
    if (!navigator.permissions) {
      return Promise.reject('Permissions API not supported');
    }

    return navigator.permissions.query({ name: 'geolocation' })
      .then(permission => permission.state);
  }

  // Sauvegarder la localisation favorite
  saveFavoriteLocation(name: string, lat: number, lng: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/geolocation/favorites`, {
      name, latitude: lat, longitude: lng
    }, { headers: this.getHeaders() });
  }

  // Obtenir les localisations favorites
  getFavoriteLocations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/geolocation/favorites`, {
      headers: this.getHeaders()
    });
  }

  // Supprimer une localisation favorite
  deleteFavoriteLocation(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/geolocation/favorites/${id}`, {
      headers: this.getHeaders()
    });
  }
}