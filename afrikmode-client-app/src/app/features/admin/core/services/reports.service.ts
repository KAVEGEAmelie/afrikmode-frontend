import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface Report {
  id: string;
  title: string;
  type: 'activity' | 'transactions' | 'vendors' | 'custom';
  format: 'pdf' | 'excel' | 'csv';
  status: 'pending' | 'completed' | 'failed';
  generatedAt: Date;
  generatedBy: string;
  fileUrl?: string;
  fileSize?: number;
  parameters?: any;
}

export interface ReportTemplate {
  id: string;
  name: string;
  type: 'activity' | 'transactions' | 'vendors' | 'custom';
  description: string;
  requiredParameters: string[];
  availableFormats: ('pdf' | 'excel' | 'csv')[];
}

export interface ActivityReportData {
  period: string;
  totalUsers: number;
  newUsers: number;
  activeVendors: number;
  totalOrders: number;
  totalRevenue: number;
  topProducts: { name: string; sales: number }[];
  topVendors: { name: string; revenue: number }[];
}

export interface TransactionReportData {
  period: string;
  totalTransactions: number;
  totalAmount: number;
  byPaymentMethod: { method: string; count: number; amount: number }[];
  byStatus: { status: string; count: number; amount: number }[];
  disputes: number;
  refunds: number;
}

export interface VendorReportData {
  vendorId: string;
  vendorName: string;
  period: string;
  totalSales: number;
  revenue: number;
  productsCount: number;
  ordersCount: number;
  rating: number;
  topProducts: { name: string; sales: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private apiUrl = `${environment.apiUrl}/admin/reports`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer tous les rapports générés
   */
  getReports(
    page: number = 1,
    limit: number = 20,
    type?: string,
    status?: string
  ): Observable<{
    reports: Report[];
    total: number;
    page: number;
    limit: number;
  }> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (type) params = params.set('type', type);
    if (status) params = params.set('status', status);

    return this.http.get<{
      reports: Report[];
      total: number;
      page: number;
      limit: number;
    }>(this.apiUrl, { params });
  }

  /**
   * Récupérer les templates de rapports disponibles
   */
  getReportTemplates(): Observable<ReportTemplate[]> {
    return this.http.get<ReportTemplate[]>(`${this.apiUrl}/templates`);
  }

  /**
   * Générer un rapport d'activité globale
   */
  generateActivityReport(data: {
    dateFrom: string;
    dateTo: string;
    format: 'pdf' | 'excel' | 'csv';
    includeCharts?: boolean;
  }): Observable<{ reportId: string; message: string }> {
    return this.http.post<{ reportId: string; message: string }>(
      `${this.apiUrl}/generate/activity`,
      data
    );
  }

  /**
   * Générer un rapport de transactions
   */
  generateTransactionReport(data: {
    dateFrom: string;
    dateTo: string;
    format: 'pdf' | 'excel' | 'csv';
    paymentMethod?: string;
    status?: string;
  }): Observable<{ reportId: string; message: string }> {
    return this.http.post<{ reportId: string; message: string }>(
      `${this.apiUrl}/generate/transactions`,
      data
    );
  }

  /**
   * Générer un rapport de performance vendeur
   */
  generateVendorReport(data: {
    vendorId?: string; // si vide, rapport pour tous les vendeurs
    dateFrom: string;
    dateTo: string;
    format: 'pdf' | 'excel' | 'csv';
    includeProducts?: boolean;
  }): Observable<{ reportId: string; message: string }> {
    return this.http.post<{ reportId: string; message: string }>(
      `${this.apiUrl}/generate/vendors`,
      data
    );
  }

  /**
   * Générer un rapport personnalisé
   */
  generateCustomReport(data: {
    title: string;
    description?: string;
    dateFrom: string;
    dateTo: string;
    format: 'pdf' | 'excel' | 'csv';
    metrics: string[]; // ex: ['users', 'orders', 'revenue', 'products']
    filters?: any;
  }): Observable<{ reportId: string; message: string }> {
    return this.http.post<{ reportId: string; message: string }>(
      `${this.apiUrl}/generate/custom`,
      data
    );
  }

  /**
   * Récupérer un rapport par ID
   */
  getReportById(reportId: string): Observable<Report> {
    return this.http.get<Report>(`${this.apiUrl}/${reportId}`);
  }

  /**
   * Télécharger un rapport généré
   */
  downloadReport(reportId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${reportId}/download`, {
      responseType: 'blob'
    });
  }

  /**
   * Supprimer un rapport
   */
  deleteReport(reportId: string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(
      `${this.apiUrl}/${reportId}`
    );
  }

  /**
   * Récupérer les données d'un rapport d'activité (preview)
   */
  getActivityReportData(dateFrom: string, dateTo: string): Observable<ActivityReportData> {
    return this.http.get<ActivityReportData>(`${this.apiUrl}/data/activity`, {
      params: new HttpParams()
        .set('dateFrom', dateFrom)
        .set('dateTo', dateTo)
    });
  }

  /**
   * Récupérer les données d'un rapport de transactions (preview)
   */
  getTransactionReportData(dateFrom: string, dateTo: string): Observable<TransactionReportData> {
    return this.http.get<TransactionReportData>(`${this.apiUrl}/data/transactions`, {
      params: new HttpParams()
        .set('dateFrom', dateFrom)
        .set('dateTo', dateTo)
    });
  }

  /**
   * Planifier la génération automatique d'un rapport
   */
  scheduleReport(data: {
    templateId: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[]; // emails
    parameters: any;
  }): Observable<{ success: boolean; scheduleId: string; message: string }> {
    return this.http.post<{ success: boolean; scheduleId: string; message: string }>(
      `${this.apiUrl}/schedule`,
      data
    );
  }
}
