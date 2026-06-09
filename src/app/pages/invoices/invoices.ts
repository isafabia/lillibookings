import { Component, inject } from '@angular/core';
import { AsyncPipe, CurrencyPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';

import { Invoice, InvoiceApiService } from '../../services/invoice-api.service';
import { BookingApiService } from '../../services/booking-api.service';
import { Booking } from '../../models/booking.model';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    DatePipe,
    CurrencyPipe,
    FormsModule,
    RouterLink,
    MatIconModule
  ],
  templateUrl: './invoices.html',
  styleUrls: ['./invoices.scss']
})
export class InvoicesComponent {
  private invoiceApi = inject(InvoiceApiService);
  private bookingApi = inject(BookingApiService);
  private router = inject(Router);

  invoices$!: Observable<Invoice[]>;
  latestInvoice$!: Observable<Invoice | null>;
  bookings$!: Observable<Booking[]>;

  selectedBookingId = '';
  errorMessage = '';
  showHistory = false;
  isSending = false;

  constructor() {
    this.loadInvoices();
    this.loadBookings();
  }

  private loadInvoices(): void {
    this.invoices$ = this.invoiceApi.getAll().pipe(
      catchError((err: unknown) => {
        console.error('error loading invoices', err);
        this.errorMessage = 'could not load invoices';
        return of([]);
      })
    );

    this.latestInvoice$ = this.invoiceApi.getLatest().pipe(
      catchError((err: unknown) => {
        console.error('error loading latest invoice', err);
        return of(null);
      })
    );
  }

  private loadBookings(): void {
    this.bookings$ = this.bookingApi.getBookings().pipe(
      catchError((err: unknown) => {
        console.error('error loading bookings', err);
        return of([]);
      })
    );
  }

  createInvoiceFromSelected(): void {
    this.errorMessage = '';

    if (!this.selectedBookingId) {
      this.errorMessage = 'please choose a booking first';
      return;
    }

    this.router.navigate(['/create-invoice', this.selectedBookingId]);
  }

  openPdf(invoice: Invoice): void {
    this.errorMessage = '';

    this.invoiceApi.getPdf(invoice.id).subscribe({
      next: (blob: Blob) => {
        const fileUrl = window.URL.createObjectURL(blob);
        window.open(fileUrl, '_blank');
      },
      error: (err: unknown) => {
        console.error('error opening pdf', err);
        this.errorMessage = 'could not open invoice pdf';
      }
    });
  }

  sendInvoice(invoice: Invoice): void {
  this.errorMessage = '';
  this.isSending = true;

  this.invoiceApi.sendInvoice(invoice.id).subscribe({
    next: () => {
      alert('invoice sent successfully');
      this.isSending = false;
      this.loadInvoices();
    },
    error: (err: any) => {
      console.error('error sending invoice', err);

      this.errorMessage =
        err?.error?.error ||
        err?.error?.message ||
        'could not send invoice';

      this.isSending = false;
      this.loadInvoices();
    }
  });
}

  toggleHistory(): void {
    this.showHistory = !this.showHistory;
  }

  statusLabel(status: string): string {
    return status?.trim().toLowerCase() || 'created';
  }
}