// src/app/core/services/ticket.service.ts
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Ticket, TicketMessage, PaginatedResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private baseUrl = 'http://localhost:5000/api';

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

  getTickets(params?: {
    page?: number;
    limit?: number;
    status?: string;
    category?: string;
    priority?: string;
  }): Observable<PaginatedResponse<Ticket>> {
    return this.http.get<PaginatedResponse<Ticket>>(`${this.baseUrl}/tickets`, {
      headers: this.getHeaders(),
      params: params ? this.buildParams(params) : undefined
    });
  }

  getTicket(id: string): Observable<Ticket> {
    return this.http.get<Ticket>(`${this.baseUrl}/tickets/${id}`, {
      headers: this.getHeaders()
    });
  }

  createTicket(data: {
    subject: string;
    description: string;
    category: string;
    priority?: string;
    attachments?: File[];
  }): Observable<Ticket> {
    if (data.attachments && data.attachments.length > 0) {
      const formData = new FormData();
      formData.append('subject', data.subject);
      formData.append('description', data.description);
      formData.append('category', data.category);
      if (data.priority) formData.append('priority', data.priority);
      
      data.attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const token = localStorage.getItem('auth_token');
      let headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      return this.http.post<Ticket>(`${this.baseUrl}/tickets`, formData, { headers });
    } else {
      return this.http.post<Ticket>(`${this.baseUrl}/tickets`, data, {
        headers: this.getHeaders()
      });
    }
  }

  addMessage(ticketId: string, data: {
    message: string;
    attachments?: File[];
  }): Observable<TicketMessage> {
    if (data.attachments && data.attachments.length > 0) {
      const formData = new FormData();
      formData.append('message', data.message);
      
      data.attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const token = localStorage.getItem('auth_token');
      let headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      return this.http.post<TicketMessage>(
        `${this.baseUrl}/tickets/${ticketId}/messages`,
        formData,
        { headers }
      );
    } else {
      return this.http.post<TicketMessage>(
        `${this.baseUrl}/tickets/${ticketId}/messages`,
        data,
        { headers: this.getHeaders() }
      );
    }
  }

  closeTicket(id: string): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.baseUrl}/tickets/${id}/close`, {}, {
      headers: this.getHeaders()
    });
  }

  reopenTicket(id: string): Observable<Ticket> {
    return this.http.put<Ticket>(`${this.baseUrl}/tickets/${id}/reopen`, {}, {
      headers: this.getHeaders()
    });
  }

  rateTicket(id: string, rating: number, comment?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/tickets/${id}/rate`, { rating, comment }, {
      headers: this.getHeaders()
    });
  }

  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tickets/categories`, {
      headers: this.getHeaders()
    });
  }

  getTicketMessages(ticketId: string): Observable<TicketMessage[]> {
    return this.http.get<TicketMessage[]>(`${this.baseUrl}/tickets/${ticketId}/messages`, {
      headers: this.getHeaders()
    });
  }
}