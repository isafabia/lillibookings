import { Component } from '@angular/core';
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { map, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { RotaApiService } from '../../../services/rota-api.service';
import { RotaShift } from '../../../models/rota-shift.model';

import { BookingApiService } from '../../../services/booking-api.service';
import { Booking } from '../../../models/booking.model';
import { TranslateService } from '../../../services/translate.service';

interface RotaDayGroup {
  date: Date;
  dayName: string;
  dayLabel: string;
  shifts: RotaShift[];
}

@Component({
  selector: 'app-rota-employee',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    AsyncPipe,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './rota-employee.html',
  styleUrls: ['./rota-employee.scss'],
})
export class RotaEmployeeComponent {
  weekGroups$!: Observable<RotaDayGroup[]>;

  currentEmployee = '';
  bookings: Booking[] = [];

  constructor(
    private rotaApi: RotaApiService,
    private bookingApi: BookingApiService,
    public translate: TranslateService
  ) {
    const savedUser = localStorage.getItem('user');

    if (savedUser) {
      const user = JSON.parse(savedUser);
      this.currentEmployee = user.name?.trim().toLowerCase() || '';
    }

    this.bookingApi.getBookings().subscribe({
      next: (data) => {
        this.bookings = data;
      },
      error: (err) => {
        console.error('error loading bookings', err);
      }
    });

    this.loadWeekRota();
  }

  markWorked(s: RotaShift): void {
    this.rotaApi.updateStatus(s.id, 'worked').subscribe({
      next: () => this.loadWeekRota(),
      error: (err) => console.error('error updating shift', err)
    });
  }

  getBooking(id?: string): Booking | undefined {
    if (!id) return undefined;
    return this.bookings.find(b => b.id === id);
  }

  getAssignmentTypeLabel(type: string): string {
    return this.translate.t(type.replace(/-/g, '_'));
  }

  private getCurrentLocale(): string {
    const lang = this.translate.currentLang;

    if (lang === 'spanish') return 'es-ES';
    if (lang === 'swedish') return 'sv-SE';
    return 'en-IE';
  }

  private loadWeekRota(): void {
    this.weekGroups$ = this.rotaApi.getAll().pipe(
      catchError((err) => {
        console.error('error loading rota shifts', err);
        return of([] as RotaShift[]);
      }),
      map((items: RotaShift[]) => {
        const today = this.stripTime(new Date());
        const locale = this.getCurrentLocale();

        const weekDays: Date[] = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() + i);
          weekDays.push(this.stripTime(d));
        }

        const lastDay = new Date(today);
        lastDay.setDate(today.getDate() + 6);

        const employeeShifts = items
          .filter(s => s.employeeName?.trim().toLowerCase() === this.currentEmployee)
          .filter(s => s.status === 'pending' || s.status === 'accepted' || s.status === 'worked')
          .filter(s => {
            const shiftDate = this.parseDate(s.date);
            return shiftDate.getTime() >= today.getTime() && shiftDate.getTime() <= lastDay.getTime();
          })
          .sort((a, b) => {
            const dateCompare = this.parseDate(a.date).getTime() - this.parseDate(b.date).getTime();
            if (dateCompare !== 0) return dateCompare;
            return a.startTime.localeCompare(b.startTime);
          });

        return weekDays.map(dayDate => {
          const dayShifts = employeeShifts.filter(s =>
            this.isSameDay(this.parseDate(s.date), dayDate)
          );

          return {
            date: dayDate,
            dayName: dayDate.toLocaleDateString(locale, { weekday: 'long' }).toLowerCase(),
            dayLabel: dayDate.toLocaleDateString(locale, { day: 'numeric', month: 'short' }).toLowerCase(),
            shifts: dayShifts
          };
        });
      })
    );
  }

  private parseDate(value: string): Date {
    if (!value) return this.stripTime(new Date());

    const datePart = value.includes('T') ? value.split('T')[0] : value;
    const [y, m, d] = datePart.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  private isSameDay(d1: Date, d2: Date): boolean {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  private stripTime(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
}