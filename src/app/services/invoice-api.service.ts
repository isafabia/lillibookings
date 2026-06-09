import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Invoice {
  id: string;
  bookingId?: string | null;

  invoiceNumber: string;

  schoolName: string;
  schoolEmail: string;
  location: string;

  dateVisited: string;

  expectedKidsCount: number;
  actualKidsCount: number;
  teachersCount: number;

  pricePerChild: number;
  pricePerTeacher: number;
  extraCharges: number;
  discount: number;

  totalAmount: number;

  notes: string;
  status: string;

  pdfFileName?: string | null;
  pdfUrl?: string | null;

  createdAt: string;
  sentAt?: string | null;
}

export interface CreateInvoiceRequest {
  bookingId?: string | null;

  schoolName: string;
  schoolEmail: string;
  location: string;

  dateVisited: string;

  expectedKidsCount: number;
  actualKidsCount: number;
  teachersCount: number;

  pricePerChild: number;
  pricePerTeacher: number;
  extraCharges: number;
  discount: number;

  notes: string;
}

@Injectable({
  providedIn: 'root'
})
export class InvoiceApiService {
  private apiUrl = 'https://lillibookings-api.onrender.com/api/invoices';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.apiUrl);
  }

  getLatest(): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.apiUrl}/latest`);
  }

  createInvoice(invoice: CreateInvoiceRequest): Observable<Invoice> {
    return this.http.post<Invoice>(`${this.apiUrl}/create`, invoice);
  }

  getPdf(invoiceId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${invoiceId}/pdf`, {
      responseType: 'blob'
    });
  }

  sendInvoice(invoiceId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${invoiceId}/send`, {});
  }
}