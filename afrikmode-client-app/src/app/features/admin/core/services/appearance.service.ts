import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  successColor: string;
  warningColor: string;
  errorColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: string;
  fontFamily: string;
  darkMode: boolean;
}

export interface LogoSettings {
  logoUrl: string;
  logoDarkUrl?: string;
  faviconUrl: string;
  logoWidth?: number;
  logoHeight?: number;
}

export interface HomepageSettings {
  heroBanner: {
    enabled: boolean;
    title: string;
    subtitle: string;
    imageUrl: string;
    ctaText: string;
    ctaLink: string;
  };
  categories: {
    enabled: boolean;
    title: string;
    limit: number;
  };
  trendingProducts: {
    enabled: boolean;
    title: string;
    limit: number;
  };
  newArrivals: {
    enabled: boolean;
    title: string;
    limit: number;
  };
  testimonials: {
    enabled: boolean;
    title: string;
  };
  newsletter: {
    enabled: boolean;
    title: string;
    subtitle: string;
  };
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  externalUrl?: string;
  children?: MenuItem[];
  order: number;
  visible: boolean;
}

export interface MenuSettings {
  headerMenu: MenuItem[];
  footerMenu: MenuItem[];
  mobileMenu: MenuItem[];
}

export interface Widget {
  id: string;
  name: string;
  type: 'text' | 'image' | 'html' | 'products' | 'categories';
  content: any;
  position: string;
  order: number;
  enabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AppearanceService {
  private apiUrl = `${environment.apiUrl}/admin/appearance`;

  constructor(private http: HttpClient) {}

  // Theme Settings
  getThemeSettings(): Observable<{ success: boolean; data: ThemeSettings }> {
    return this.http.get<{ success: boolean; data: ThemeSettings }>(`${this.apiUrl}/theme`);
  }

  updateThemeSettings(settings: Partial<ThemeSettings>): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/theme`, settings);
  }

  // Logo Settings
  getLogoSettings(): Observable<{ success: boolean; data: LogoSettings }> {
    return this.http.get<{ success: boolean; data: LogoSettings }>(`${this.apiUrl}/logo`);
  }

  updateLogoSettings(settings: Partial<LogoSettings>): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/logo`, settings);
  }

  uploadLogo(file: File, type: 'logo' | 'logoDark' | 'favicon'): Observable<{ success: boolean; url: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    return this.http.post<{ success: boolean; url: string; message: string }>(`${this.apiUrl}/logo/upload`, formData);
  }

  // Homepage Settings
  getHomepageSettings(): Observable<{ success: boolean; data: HomepageSettings }> {
    return this.http.get<{ success: boolean; data: HomepageSettings }>(`${this.apiUrl}/homepage`);
  }

  updateHomepageSettings(settings: Partial<HomepageSettings>): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/homepage`, settings);
  }

  uploadHomepageImage(file: File, section: string): Observable<{ success: boolean; url: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('section', section);
    return this.http.post<{ success: boolean; url: string; message: string }>(`${this.apiUrl}/homepage/upload`, formData);
  }

  // Menu Settings
  getMenuSettings(): Observable<{ success: boolean; data: MenuSettings }> {
    return this.http.get<{ success: boolean; data: MenuSettings }>(`${this.apiUrl}/menus`);
  }

  updateMenuSettings(settings: Partial<MenuSettings>): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/menus`, settings);
  }

  // Widgets
  getWidgets(): Observable<{ success: boolean; data: Widget[] }> {
    return this.http.get<{ success: boolean; data: Widget[] }>(`${this.apiUrl}/widgets`);
  }

  getWidgetById(id: string): Observable<{ success: boolean; data: Widget }> {
    return this.http.get<{ success: boolean; data: Widget }>(`${this.apiUrl}/widgets/${id}`);
  }

  createWidget(widget: Partial<Widget>): Observable<{ success: boolean; data: Widget; message: string }> {
    return this.http.post<{ success: boolean; data: Widget; message: string }>(`${this.apiUrl}/widgets`, widget);
  }

  updateWidget(id: string, widget: Partial<Widget>): Observable<{ success: boolean; message: string }> {
    return this.http.put<{ success: boolean; message: string }>(`${this.apiUrl}/widgets/${id}`, widget);
  }

  deleteWidget(id: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/widgets/${id}`);
  }

  reorderWidgets(widgetIds: string[]): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(`${this.apiUrl}/widgets/reorder`, { widgetIds });
  }
}


