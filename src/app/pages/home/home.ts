import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { BookingService } from '../../services/booking.service';
import { AsyncPipe, NgFor, NgIf, NgClass } from '@angular/common';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Booking } from '../../models/booking.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, RouterLink,RouterLinkActive, NgFor, NgIf, NgClass, AsyncPipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class HomeComponent {
  // calendar state
  selectedDate: Date;
  weekDays: Date[];

  // data
 bookings$!: Observable<Booking[]>;
filteredBookings$!: Observable<Booking[]>;

  constructor(private bookingService: BookingService) {
    this.selectedDate = this.stripTime(new Date());
    this.weekDays = this.getWeekDays(this.selectedDate);

    this.bookings$ = this.bookingService.bookings$;

    // filter bookings by selected day
    this.filteredBookings$ = this.bookings$.pipe(
      map((items: Booking[]) =>
        items.filter(b =>
          this.stripTime(new Date(b.date)).getTime() === this.selectedDate.getTime()
        )
      )
    );
  }

  // month title (e.g. "january 2026")
  get monthLabel(): string {
    return this.selectedDate
      .toLocaleString('en-IE', { month: 'long', year: 'numeric' })
      .toLowerCase();
  }

  // click a day
  selectDay(d: Date): void {
    this.selectedDate = this.stripTime(d);
    this.weekDays = this.getWeekDays(this.selectedDate);

    // re-create filtered stream so UI updates immediately
    this.filteredBookings$ = this.bookings$.pipe(
      map((items: any[]) =>
        items.filter(b =>
          this.stripTime(new Date(b.date)).getTime() === this.selectedDate.getTime()
        )
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
    return d.toLocaleString('en-IE', { weekday: 'short' }).toLowerCase();
  }

  dayNumber(d: Date): number {
    return d.getDate();
  }

  private stripTime(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  private getWeekDays(base: Date): Date[] {
    const d = this.stripTime(base);
    const day = d.getDay(); // 0 sun .. 6 sat
    const start = new Date(d);
    start.setDate(d.getDate() - day);

    return Array.from({ length: 7 }, (_, i) => {
      const x = new Date(start);
      x.setDate(start.getDate() + i);
      return x;
    });
  }
}
