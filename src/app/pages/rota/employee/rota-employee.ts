import { Component } from '@angular/core';
import { AsyncPipe, NgClass, NgFor, NgIf, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

import { RotaService } from '../../../services/rota.service';
import { RotaShift } from '../../../models/rota-shift.model';

import { BookingService } from '../../../services/booking.service';
import { Booking } from '../../../models/booking.model';

@Component({
  selector: 'app-rota-employee',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    AsyncPipe,
    DatePipe,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './rota-employee.html',
  styleUrl: './rota-employee.scss',
})
export class RotaEmployeeComponent {
  shifts$: Observable<RotaShift[]>;

  // toggle state
  view: 'today' | 'tomorrow' = 'today';

  constructor(
    private rotaService: RotaService,
    private bookingService: BookingService
  ) {
    this.shifts$ = this.rotaService.shifts$.pipe(
      map((items: RotaShift[]) => items.filter(s => this.isInSelectedDay(s.date)))
    );
  }

  setView(v: 'today' | 'tomorrow'): void {
    this.view = v;

    // re-create stream so the UI updates immediately
    this.shifts$ = this.rotaService.shifts$.pipe(
      map((items: RotaShift[]) => items.filter(s => this.isInSelectedDay(s.date)))
    );
  }

  accept(s: RotaShift): void {
    this.rotaService.updateStatus(s.id, 'accepted');
  }

  decline(s: RotaShift): void {
    this.rotaService.updateStatus(s.id, 'declined');
  }

  getBooking(id?: string): Booking | undefined {
    if (!id) return undefined;

    // your booking service method is called getBookingById
    return this.bookingService.getById(id);
  }

  private isInSelectedDay(isoDate: string): boolean {
    const shiftDay = this.stripTime(new Date(isoDate));

    const base = new Date();
    if (this.view === 'tomorrow') base.setDate(base.getDate() + 1);

    const selectedDay = this.stripTime(base);
    return shiftDay.getTime() === selectedDay.getTime();
  }

  private stripTime(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
}