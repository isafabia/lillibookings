import { Component } from '@angular/core';
import { NgFor, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { TranslateService } from '../../services/translate.service';
import { BookingApiService } from '../../services/booking-api.service';
import { Booking } from '../../models/booking.model';

interface Program {
  id: string;
  bookingId: string;
  groupName: string;
  date: string;
  kidsCount: number;
  teachersCount: number;
  bookingType: string;
  nights?: number;
  title: string;
  description: string;
  imageUrl: string;
}

@Component({
  selector: 'app-programs',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    FormsModule,
    DatePipe,
    RouterLink,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './programs.html',
  styleUrls: ['./programs.scss']
})
export class ProgramsComponent {
  programs: Program[] = [];
  bookings: Booking[] = [];

  selectedBookingId = '';
  title = '';
  description = '';
  imageBase64: string | null = null;

  selectedImage: string | null = null;

  constructor(
    public translate: TranslateService,
    private bookingApi: BookingApiService
  ) {
    this.loadPrograms();
    this.loadBookings();
  }

  loadPrograms(): void {
    const data = localStorage.getItem('programs');
    this.programs = data ? JSON.parse(data) : [];

    this.programs.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }

  savePrograms(): void {
    localStorage.setItem('programs', JSON.stringify(this.programs));
  }

  loadBookings(): void {
    this.bookingApi.getBookings().subscribe({
      next: (data) => {
        this.bookings = [...data].sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });
      },
      error: (err) => {
        console.error('error loading bookings', err);
      }
    });
  }

  get selectedBooking(): Booking | undefined {
    return this.bookings.find(b => String(b.id) === String(this.selectedBookingId));
  }

  get upcomingPrograms(): Program[] {
    const today = this.stripTime(new Date());

    return this.programs.filter(p => {
      const d = this.stripTime(new Date(p.date));
      return d >= today;
    });
  }

  get pastPrograms(): Program[] {
    const today = this.stripTime(new Date());

    return this.programs.filter(p => {
      const d = this.stripTime(new Date(p.date));
      return d < today;
    });
  }

  onBookingChange(): void {
    const booking = this.selectedBooking;
    if (!booking) return;

    if (!this.title.trim()) {
      this.title = booking.groupName;
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.imageBase64 = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  upload(): void {
    const booking = this.selectedBooking;

    if (!booking) {
      alert('please choose a booking first');
      return;
    }

    if (!this.imageBase64) {
      alert(this.translate.t('choose_image_first'));
      return;
    }

    const newProgram: Program = {
      id: crypto.randomUUID(),
      bookingId: String(booking.id ?? ''),
      groupName: booking.groupName,
      date: booking.date,
      kidsCount: booking.kidsCount,
      teachersCount: booking.teachersCount,
      bookingType: booking.bookingType,
      nights: booking.bookingType === 'residential' ? booking.nights : undefined,
      title: this.title.trim() || booking.groupName,
      description: this.description.trim(),
      imageUrl: this.imageBase64
    };

    this.programs.unshift(newProgram);
    this.savePrograms();

    this.selectedBookingId = '';
    this.title = '';
    this.description = '';
    this.imageBase64 = null;
  }

  openImage(src: string): void {
    this.selectedImage = src;
  }

  closeImage(): void {
    this.selectedImage = null;
  }

  trackByProgram(index: number, program: Program): string {
    return program.id;
  }

  trackByBooking(index: number, booking: Booking): string {
    return String(booking.id ?? `${booking.groupName}-${booking.date}-${index}`);
  }

  private stripTime(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
}