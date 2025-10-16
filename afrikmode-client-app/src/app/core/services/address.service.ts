// src/app/core/services/address.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';
import { Address } from '../models';

@Injectable({
  providedIn: 'root'
})
export class AddressService extends BaseService {

  getAddresses(): Observable<Address[]> {
    return this.get<Address[]>('/users/addresses');
  }

  getAddress(id: string): Observable<Address> {
    return this.get<Address>(`/users/addresses/${id}`);
  }

  createAddress(address: Partial<Address>): Observable<Address> {
    return this.post<Address>('/users/addresses', address);
  }

  updateAddress(id: string, address: Partial<Address>): Observable<Address> {
    return this.put<Address>(`/users/addresses/${id}`, address);
  }

  deleteAddress(id: string): Observable<any> {
    return this.delete(`/users/addresses/${id}`);
  }

  setDefaultAddress(id: string, type: 'shipping' | 'billing'): Observable<any> {
    return this.put(`/users/addresses/${id}/default`, { type });
  }

  validateAddress(address: Partial<Address>): Observable<any> {
    return this.post('/addresses/validate', address);
  }

  searchCities(query: string, country: string): Observable<any[]> {
    return this.get('/addresses/cities', { q: query, country });
  }

  getCountries(): Observable<any[]> {
    return this.get('/addresses/countries');
  }

  getStates(country: string): Observable<any[]> {
    return this.get('/addresses/states', { country });
  }

  // Géocodage (coordonnées)
  geocodeAddress(address: string): Observable<any> {
    return this.post('/addresses/geocode', { address });
  }

  reverseGeocode(lat: number, lng: number): Observable<any> {
    return this.post('/addresses/reverse-geocode', { latitude: lat, longitude: lng });
  }

  // Validation de code postal
  validatePostalCode(postalCode: string, country: string): Observable<boolean> {
    return this.post<boolean>('/addresses/validate-postal-code', { postal_code: postalCode, country });
  }
}