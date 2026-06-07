import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatIconModule } from '@angular/material/icon';

import { BookingApiService } from '../../services/booking-api.service';
import { InvoiceApiService, CreateInvoiceRequest } from '../../services/invoice-api.service';
import { Booking } from '../../models/booking.model';

@Component({
  selector: 'app-create-invoice',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, RouterLink, MatIconModule],
  templateUrl: './create-invoice.html',
  styleUrls: ['./create-invoice.scss']
})
export class CreateInvoiceComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private bookingApi = inject(BookingApiService);
  private invoiceApi = inject(InvoiceApiService);

  bookingId = '';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  form = this.fb.group({
    schoolName: ['', [Validators.required]],
    schoolEmail: ['', [Validators.required, Validators.email]],
    location: ['', [Validators.required]],
    dateVisited: ['', [Validators.required]],

    expectedKidsCount: [0, [Validators.required, Validators.min(0)]],
    actualKidsCount: [0, [Validators.required, Validators.min(0)]],
    teachersCount: [0, [Validators.required, Validators.min(0)]],

    pricePerChild: [0, [Validators.required, Validators.min(0)]],
    pricePerTeacher: [0, [Validators.required, Validators.min(0)]],
    extraCharges: [0, [Validators.required, Validators.min(0)]],
    discount: [0, [Validators.required, Validators.min(0)]],

    notes: ['']
  });

  constructor() {
    this.bookingId = this.route.snapshot.paramMap.get('bookingId') ?? '';

    if (!this.bookingId) {
      this.errorMessage = 'booking id missing';
      return;
    }

    const navState = history.state as { booking?: Booking };

    if (navState?.booking) {
      this.fillForm(navState.booking);
      return;
    }

    this.loadBooking();
  }

  private loadBooking(): void {
    this.isLoading = true;

    this.bookingApi.getBookingById(this.bookingId).subscribe({
      next: (booking: Booking) => {
        this.fillForm(booking);
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('booking load error', err);
        this.errorMessage = `could not load booking. status: ${err.status}`;
        this.isLoading = false;
      }
    });
  }

  private fillForm(booking: Booking): void {
    this.form.patchValue({
      schoolName: booking.groupName ?? '',
      schoolEmail: booking.schoolEmail ?? '',
      location: booking.location ?? '',
      dateVisited: this.cleanDate(booking.date),

      expectedKidsCount: Number(booking.kidsCount ?? 0),
      actualKidsCount: Number(booking.kidsCount ?? 0),
      teachersCount: Number(booking.teachersCount ?? 0),

      pricePerChild: 0,
      pricePerTeacher: 0,
      extraCharges: 0,
      discount: 0,

      notes: ''
    });
  }

  submit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errorMessage = 'please fill in all required fields';
      return;
    }

    const v = this.form.value;

    const request: CreateInvoiceRequest = {
      bookingId: this.bookingId,
      schoolName: String(v.schoolName ?? '').trim(),
      schoolEmail: String(v.schoolEmail ?? '').trim().toLowerCase(),
      location: String(v.location ?? '').trim(),
      dateVisited: String(v.dateVisited ?? ''),

      expectedKidsCount: Number(v.expectedKidsCount ?? 0),
      actualKidsCount: Number(v.actualKidsCount ?? 0),
      teachersCount: Number(v.teachersCount ?? 0),

      pricePerChild: Number(v.pricePerChild ?? 0),
      pricePerTeacher: Number(v.pricePerTeacher ?? 0),
      extraCharges: Number(v.extraCharges ?? 0),
      discount: Number(v.discount ?? 0),

      notes: String(v.notes ?? '').trim()
    };

    this.invoiceApi.createInvoice(request).subscribe({
      next: () => {
        this.successMessage = 'invoice created successfully';
        this.router.navigate(['/invoices']);
      },
      error: (err: unknown) => {
        console.error('error creating invoice', err);
        this.errorMessage = 'could not create invoice';
      }
    });
  }

  calculateTotal(): number {
    const v = this.form.value;

    const kidsTotal = Number(v.actualKidsCount ?? 0) * Number(v.pricePerChild ?? 0);
    const teachersTotal = Number(v.teachersCount ?? 0) * Number(v.pricePerTeacher ?? 0);
    const extras = Number(v.extraCharges ?? 0);
    const discount = Number(v.discount ?? 0);

    const total = kidsTotal + teachersTotal + extras - discount;

    return total < 0 ? 0 : total;
  }

  private cleanDate(value: string | Date): string {
    const raw = String(value ?? '');
    return raw.includes('T') ? raw.split('T')[0] : raw;
  }
}