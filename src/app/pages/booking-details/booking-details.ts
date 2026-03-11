import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { BookingService } from '../../services/booking.service';
import { BookingApiService } from '../../services/booking-api.service';
import { Booking } from '../../models/booking.model';

@Component({
  selector: 'app-booking-details',
  standalone: true,
  imports: [NgIf, RouterLink, MatCardModule, MatButtonModule, MatIconModule, DatePipe],
  templateUrl: './booking-details.html',
  styleUrl: './booking-details.scss',
})
export class BookingDetailsComponent {
  booking?: Booking;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private bookingApi: BookingApiService
  ) {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.booking = this.bookingService.getById(id);

    if (!this.booking) {
      this.router.navigateByUrl('/');
    }
  }

  edit(): void {
    if (!this.booking) return;
    this.router.navigate(['/booking', this.booking.id, 'edit']);
  }

  delete(): void {
    if (!this.booking) return;

    const ok = confirm(`delete booking for "${this.booking.groupName}"?`);
    if (!ok) return;

    this.bookingApi.deleteBooking(this.booking.id).subscribe({
      next: () => {
        this.bookingService.deleteBooking(this.booking!.id);
        this.router.navigateByUrl('/');
      },
      error: (err: unknown) => {
        console.error('error deleting booking', err);
        alert('there was a problem deleting the booking');
      }
    });
  }
}