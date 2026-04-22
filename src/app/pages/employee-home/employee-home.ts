import { Component, HostListener } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { RotaApiService } from '../../services/rota-api.service';
import { RotaShift } from '../../models/rota-shift.model';

import { BookingApiService } from '../../services/booking-api.service';
import { Booking } from '../../models/booking.model';
import { TranslateService } from '../../services/translate.service';

@Component({
  selector: 'app-employee-home',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    AsyncPipe,
    RouterLink,
    RouterLinkActive,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './employee-home.html',
  styleUrls: ['./employee-home.scss'],
})
export class EmployeeHomeComponent {
  currentEmployee = '';
  currentDayRate = 0;

  hideBottomNav = false;
  private lastScrollY = 0;

  shifts$!: Observable<RotaShift[]>;
  pending$!: Observable<RotaShift[]>;
  upcoming$!: Observable<RotaShift | null>;
  workedShifts$!: Observable<RotaShift[]>;
  totalEarned$!: Observable<number>;

  bookings: Booking[] = [];

  constructor(
    private rotaApi: RotaApiService,
    private bookingApi: BookingApiService,
    private router: Router,
    public translate: TranslateService
  ) {
    const savedUser = localStorage.getItem('user');

    if (savedUser) {
      const user = JSON.parse(savedUser);
      this.currentEmployee = user.name?.trim().toLowerCase() || '';
      this.currentDayRate = Number(user.dayRate ?? 0);
    }

    this.shifts$ = this.rotaApi.getAll();

    this.bookingApi.getBookings().subscribe({
      next: (data) => (this.bookings = data),
      error: (err) => console.error(err),
    });

    this.setupStreams();
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const current = window.scrollY || 0;

    if (current > this.lastScrollY && current > 80) {
      this.hideBottomNav = true;
    } else {
      this.hideBottomNav = false;
    }

    this.lastScrollY = current;
  }

  private setupStreams(): void {
    const today = this.stripTime(new Date());

    this.pending$ = this.shifts$.pipe(
      map(items =>
        items
          .filter(s =>
            s.employeeName?.trim().toLowerCase() === this.currentEmployee &&
            s.status === 'pending'
          )
          .sort((a, b) => this.getShiftDateTime(a).getTime() - this.getShiftDateTime(b).getTime())
      )
    );

    this.upcoming$ = this.shifts$.pipe(
      map(items => {
        const next = items
          .filter(s =>
            s.employeeName?.trim().toLowerCase() === this.currentEmployee &&
            s.status === 'accepted' &&
            this.stripTime(this.getShiftDateTime(s)).getTime() >= today.getTime()
          )
          .sort((a, b) => this.getShiftDateTime(a).getTime() - this.getShiftDateTime(b).getTime());

        return next[0] || null;
      })
    );

    this.workedShifts$ = this.shifts$.pipe(
      map(items =>
        items
          .filter(s =>
            s.employeeName?.trim().toLowerCase() === this.currentEmployee &&
            s.confirmedWorked === true
          )
          .sort((a, b) => this.getShiftDateTime(b).getTime() - this.getShiftDateTime(a).getTime())
      )
    );

    this.totalEarned$ = this.workedShifts$.pipe(
      map(items => items.length * this.currentDayRate)
    );
  }

  accept(s: RotaShift): void {
    this.rotaApi.updateStatus(s.id, 'accepted').subscribe(() => this.refresh());
  }

  decline(s: RotaShift): void {
    this.rotaApi.updateStatus(s.id, 'declined').subscribe(() => this.refresh());
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('selectedBooking');
    this.router.navigate(['/login']);
  }

  private refresh(): void {
    this.shifts$ = this.rotaApi.getAll();

    this.bookingApi.getBookings().subscribe({
      next: (data) => (this.bookings = data),
      error: (err) => console.error(err),
    });

    this.setupStreams();
  }

  getBooking(id?: string): Booking | undefined {
    return this.bookings.find(b => b.id === id);
  }

  formatShiftDate(value: string): string {
    const d = this.parseDate(value);
    return d.toLocaleDateString('en-IE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    }).toLowerCase();
  }

  private parseDate(value: string): Date {
    const datePart = value.split('T')[0];
    const [y, m, d] = datePart.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  private getShiftDateTime(shift: RotaShift): Date {
    const baseDate = this.parseDate(shift.date);
    const [hours, minutes] = (shift.startTime || '00:00').split(':').map(Number);

    return new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      hours || 0,
      minutes || 0,
      0,
      0
    );
  }

  private stripTime(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
}