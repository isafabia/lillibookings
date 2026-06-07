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

  hideBottomNav = false;
  private lastScrollY = 0;

  shifts$!: Observable<RotaShift[]>;
  pending$!: Observable<RotaShift[]>;
  upcoming$!: Observable<RotaShift | null>;
  workedShifts$!: Observable<RotaShift[]>;
  fullDays$!: Observable<number>;
  birthdayParties$!: Observable<number>;

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

    this.hideBottomNav = current > this.lastScrollY && current > 80;
    this.lastScrollY = current;
  }

  private setupStreams(): void {
    const today = this.stripTime(new Date());
    const weekStart = this.getStartOfWeek(today);
    const weekEnd = this.getEndOfWeek(today);

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
          .filter(s => {
            const shiftDate = this.parseDate(s.date);

            return (
              s.employeeName?.trim().toLowerCase() === this.currentEmployee &&
              s.confirmedWorked === true &&
              shiftDate >= weekStart &&
              shiftDate <= weekEnd
            );
          })
          .sort((a, b) => this.getShiftDateTime(b).getTime() - this.getShiftDateTime(a).getTime())
      )
    );

    this.fullDays$ = this.workedShifts$.pipe(
      map(items => items.filter(s => !this.isBirthdayParty(s.assignmentType)).length)
    );

    this.birthdayParties$ = this.workedShifts$.pipe(
      map(items => items.filter(s => this.isBirthdayParty(s.assignmentType)).length)
    );
  }

  accept(s: RotaShift): void {
    this.rotaApi.updateStatus(s.id, 'accepted').subscribe(() => this.refresh());
  }

  decline(s: RotaShift): void {
    this.rotaApi.updateStatus(s.id, 'declined').subscribe(() => this.refresh());
  }

  logout(): void {
    localStorage.removeItem('token');
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

  labelForType(type: string | null | undefined): string {
    const value = (type ?? '').replace(/-/g, ' ');

    if (!value.trim()) {
      return 'shift';
    }

    return value;
  }

  private isBirthdayParty(value: string | null | undefined): boolean {
    const type = (value ?? '').trim().toLowerCase();

    return type.includes('birthday') || type.includes('party');
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

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private getEndOfWeek(date: Date): Date {
    const start = this.getStartOfWeek(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }
}