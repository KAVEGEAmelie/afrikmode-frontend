import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  adminEmail: string;
  supportEmail: string;
  defaultLanguage: string;
  defaultCurrency: string;
  timezone: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  requireEmailVerification: boolean;
}

export interface SecuritySettings {
  passwordMinLength: number;
  requireStrongPassword: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  enable2FA: boolean;
  enableCaptcha: boolean;
  allowedIPs: string[];
  blockedIPs: string[];
}

export interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  smtpSecure: boolean;
  fromEmail: string;
  fromName: string;
  testEmail: string;
}

export interface PaymentSettings {
  enabledMethods: string[];
  defaultMethod: string;
  currency: string;
  commissionRate: number;
  paymentTimeout: number;
  enableRefunds: boolean;
}

export interface ShippingSettings {
  enabled: boolean;
  defaultProvider: string;
  freeShippingThreshold: number;
  shippingZones: ShippingZone[];
}

export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  rates: ShippingRate[];
}

export interface ShippingRate {
  id: string;
  name: string;
  price: number;
  estimatedDays: number;
}

export interface TaxSettings {
  enabled: boolean;
  defaultTaxRate: number;
  taxIncluded: boolean;
  taxRules: TaxRule[];
}

export interface TaxRule {
  id: string;
  name: string;
  rate: number;
  countries: string[];
  categories: string[];
}

export interface IntegrationSettings {
  googleAnalytics: {
    enabled: boolean;
    trackingId: string;
  };
  facebookPixel: {
    enabled: boolean;
    pixelId: string;
  };
  stripe: {
    enabled: boolean;
    publicKey: string;
    secretKey: string;
  };
  paypal: {
    enabled: boolean;
    clientId: string;
    secret: string;
  };
}

export interface ApiSettings {
  enableApi: boolean;
  apiKey: string;
  rateLimit: number;
  allowedOrigins: string[];
  webhookUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private apiUrl = `${environment.apiUrl}/admin/settings`;

  constructor(private http: HttpClient) {}

  // General Settings
  getGeneralSettings(): Observable<{ success: boolean; data: GeneralSettings }> {
    return this.http.get<{ success: boolean; data: GeneralSettings }>(`${this.apiUrl}/general`);
  }

  updateGeneralSettings(settings: Partial<GeneralSettings>): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/general`, settings);
  }

  // Security Settings
  getSecuritySettings(): Observable<{ success: boolean; data: SecuritySettings }> {
    return this.http.get<{ success: boolean; data: SecuritySettings }>(`${this.apiUrl}/security`);
  }

  updateSecuritySettings(settings: Partial<SecuritySettings>): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/security`, settings);
  }

  // Email Settings
  getEmailSettings(): Observable<{ success: boolean; data: EmailSettings }> {
    return this.http.get<{ success: boolean; data: EmailSettings }>(`${this.apiUrl}/email`);
  }

  updateEmailSettings(settings: Partial<EmailSettings>): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/email`, settings);
  }

  testEmailSettings(settings: EmailSettings): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/email/test`, settings);
  }

  // Payment Settings
  getPaymentSettings(): Observable<{ success: boolean; data: PaymentSettings }> {
    return this.http.get<{ success: boolean; data: PaymentSettings }>(`${this.apiUrl}/payments`);
  }

  updatePaymentSettings(settings: Partial<PaymentSettings>): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/payments`, settings);
  }

  // Shipping Settings
  getShippingSettings(): Observable<{ success: boolean; data: ShippingSettings }> {
    return this.http.get<{ success: boolean; data: ShippingSettings }>(`${this.apiUrl}/shipping`);
  }

  updateShippingSettings(settings: Partial<ShippingSettings>): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/shipping`, settings);
  }

  // Tax Settings
  getTaxSettings(): Observable<{ success: boolean; data: TaxSettings }> {
    return this.http.get<{ success: boolean; data: TaxSettings }>(`${this.apiUrl}/taxes`);
  }

  updateTaxSettings(settings: Partial<TaxSettings>): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/taxes`, settings);
  }

  // Integration Settings
  getIntegrationSettings(): Observable<{ success: boolean; data: IntegrationSettings }> {
    return this.http.get<{ success: boolean; data: IntegrationSettings }>(`${this.apiUrl}/integrations`);
  }

  updateIntegrationSettings(settings: Partial<IntegrationSettings>): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/integrations`, settings);
  }

  // API Settings
  getApiSettings(): Observable<{ success: boolean; data: ApiSettings }> {
    return this.http.get<{ success: boolean; data: ApiSettings }>(`${this.apiUrl}/api`);
  }

  updateApiSettings(settings: Partial<ApiSettings>): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/api`, settings);
  }

  generateApiKey(): Observable<{ success: boolean; apiKey: string; message: string }> {
    return this.http.post<{ success: boolean; apiKey: string; message: string }>(`${this.apiUrl}/api/generate-key`, {});
  }
}




