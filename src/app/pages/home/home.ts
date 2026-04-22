import { Component, HostListener } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AsyncPipe, NgFor, NgIf, NgClass } from '@angular/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Booking } from '../../models/booking.model';
import { BookingApiService } from '../../services/booking-api.service';
import { TranslateService } from '../../services/translate.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    RouterLinkActive,
    NgFor,
    NgIf,
    NgClass,
    AsyncPipe
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class HomeComponent {
  hideBottomNav = false;
  private lastScrollY = 0;

  selectedDate: Date;
  weekDays: Date[];

  bookings$!: Observable<Booking[]>;
  filteredBookings$!: Observable<Booking[]>;

  constructor(
    private bookingApi: BookingApiService,
    private router: Router,
    public translate: TranslateService
  ) {
    this.selectedDate = this.stripTime(new Date());
    this.weekDays = this.getWeekDays(this.selectedDate);

    this.bookings$ = this.bookingApi.getBookings();

    this.filteredBookings$ = this.bookings$.pipe(
      map((items: Booking[]) =>
        items.filter(b => this.isSameLocalDate(b.date, this.selectedDate))
      )
    );
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const current = window.scrollY || 0;

    if (current <= 10) {
      this.hideBottomNav = false;
      this.lastScrollY = current;
      return;
    }

    if (current > this.lastScrollY && current > 80) {
      this.hideBottomNav = true;
    } else {
      this.hideBottomNav = false;
    }

    this.lastScrollY = current;
  }

  openBooking(booking: Booking): void {
    if (!booking.id) return;

    localStorage.setItem('selectedBooking', JSON.stringify(booking));
    this.router.navigate(['/booking', booking.id]);
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('selectedBooking');
    this.router.navigate(['/login']);
  }

  get monthLabel(): string {
    return this.selectedDate
      .toLocaleString(this.getCurrentLocale(), { month: 'long', year: 'numeric' })
      .toLowerCase();
  }

  selectDay(d: Date): void {
    this.selectedDate = this.stripTime(d);
    this.weekDays = this.getWeekDays(this.selectedDate);

    this.filteredBookings$ = this.bookings$.pipe(
      map((items: Booking[]) =>
        items.filter(b => this.isSameLocalDate(b.date, this.selectedDate))
      )
    );
  }

  prevWeek(): void {
    const d = new Date(this.selectedDate);
    d.setDate(d.getDate() - 7);
    this.selectDay(d);
  }

  nextWeek(): void {
    const d = new Date(this.selectedDate);
    d.setDate(d.getDate() + 7);
    this.selectDay(d);
  }

  isSelected(d: Date): boolean {
    return this.stripTime(d).getTime() === this.selectedDate.getTime();
  }

  dayName(d: Date): string {
    return d.toLocaleString(this.getCurrentLocale(), { weekday: 'short' }).toLowerCase();
  }

  dayNumber(d: Date): number {
    return d.getDate();
  }

  private getCurrentLocale(): string {
    const lang = this.translate.currentLang;

    if (lang === 'spanish') return 'es-ES';
    if (lang === 'swedish') return 'sv-SE';
    return 'en-IE';
  }

  private isSameLocalDate(dateString: string, selected: Date): boolean {
    const d = new Date(dateString);

    return (
      d.getFullYear() === selected.getFullYear() &&
      d.getMonth() === selected.getMonth() &&
      d.getDate() === selected.getDate()
    );
  }

  private stripTime(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private getWeekDays(base: Date): Date[] {
    const d = this.stripTime(base);
    const day = d.getDay();
    const start = new Date(d);
    start.setDate(d.getDate() - day);

    return Array.from({ length: 7 }, (_, i) => {
      const x = new Date(start);
      x.setDate(start.getDate() + i);
      return x;
    });
  }
}