import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, DatePipe, registerLocaleData } from '@angular/common';

import localeEs from '@angular/common/locales/es';
import localeSv from '@angular/common/locales/sv';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TranslateService } from '../../services/translate.service';
import { BookingApiService } from '../../services/booking-api.service';
import { Booking } from '../../models/booking.model';

registerLocaleData(localeEs);
registerLocaleData(localeSv);

@Component({
  selector: 'app-booking-details',
  standalone: true,
  imports: [
    NgIf,
    RouterLink,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './booking-details.html',
  styleUrl: './booking-details.scss',
})
export class BookingDetailsComponent {
  booking?: Booking;
  isLoading = true;
  notFound = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingApi: BookingApiService,
    public translate: TranslateService
  ) {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');

      if (!id) {
        this.isLoading = false;
        this.notFound = true;
        return;
      }

      this.isLoading = true;
      this.notFound = false;
      this.booking = undefined;

      const stored = localStorage.getItem('selectedBooking');

      if (stored) {
        try {
          const parsed: Booking = JSON.parse(stored);

          if (parsed?.id === id) {
            this.booking = parsed;
            this.isLoading = false;
            return;
          }
        } catch {
          // ignore parse issue and continue to api fallback
        }
      }

      this.bookingApi.getBookingById(id).subscribe({
        next: (data) => {
          this.booking = data;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('error loading booking', err);
          this.notFound = true;
          this.isLoading = false;
        }
      });
    });
  }

  get dateLocale(): string {
    if (this.translate.currentLang === 'spanish') return 'es';
    if (this.translate.currentLang === 'swedish') return 'sv';
    return 'en';
  }

  delete(): void {
    if (!this.booking?.id) return;

    const ok = confirm(this.translate.t('confirm_delete_booking'));
    if (!ok) return;

    this.bookingApi.deleteBooking(this.booking.id).subscribe({
      next: () => {
        localStorage.removeItem('selectedBooking');
        alert(this.translate.t('booking_deleted_successfully'));
        this.router.navigateByUrl('/bookings');
      },
      error: (err: unknown) => {
        console.error('error deleting booking', err);
        alert(this.translate.t('error_deleting_booking'));
      }
    });
  }
}