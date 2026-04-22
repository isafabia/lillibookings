import { Component } from '@angular/core';
import { AsyncPipe, DatePipe, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Observable, map } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';

import { BookingApiService } from '../../services/booking-api.service';
import { TranslateService } from '../../services/translate.service';
import { Booking } from '../../models/booking.model';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    NgTemplateOutlet,
    AsyncPipe,
    DatePipe,
    RouterLink,
    MatIconModule
  ],
  templateUrl: './bookings.html',
  styleUrls: ['./bookings.scss'],
})
export class BookingsComponent {
  bookings$!: Observable<Booking[]>;
  showPast = false;

  constructor(
    private bookingApi: BookingApiService,
    private router: Router,
    public translate: TranslateService
  ) {
    this.bookings$ = this.bookingApi.getBookings().pipe(
      map(items => [...items].sort((a, b) => {
        const aDate = this.parseDate(a.date);
        const bDate = this.parseDate(b.date);

        if (aDate.getTime() !== bDate.getTime()) {
          return aDate.getTime() - bDate.getTime();
        }

        return (a.startTime || '').localeCompare(b.startTime || '');
      }))
    );
  }

  openBooking(booking: Booking): void {
    if (!booking.id) return;

    localStorage.setItem('selectedBooking', JSON.stringify(booking));
    this.router.navigate(['/booking', booking.id]);
  }

  togglePast(): void {
    this.showPast = !this.showPast;
  }

  getUpcoming(bookings: Booking[]): Booking[] {
    const today = this.stripTime(new Date());
    return bookings.filter(b => this.parseDate(b.date) >= today);
  }

  getPast(bookings: Booking[]): Booking[] {
    const today = this.stripTime(new Date());
    const thirtyDaysMs = 1000 * 60 * 60 * 24 * 30;

    return bookings.filter(b => {
      const bookingDate = this.parseDate(b.date);
      const isPast = bookingDate < today;
      const withinThirtyDays = (today.getTime() - bookingDate.getTime()) <= thirtyDaysMs;

      return isPast && withinThirtyDays;
    });
  }

  trackByBooking(index: number, booking: Booking): string {
    return booking.id ?? `${booking.groupName}-${booking.date}-${index}`;
  }

  private parseDate(value: string | null | undefined): Date {
    if (!value) return new Date(2100, 0, 1);

    const datePart = value.includes('T') ? value.split('T')[0] : value;
    const [y, m, d] = datePart.split('-').map(Number);

    if (!y || !m || !d) return new Date(2100, 0, 1);

    return new Date(y, m - 1, d);
  }

  private stripTime(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
}