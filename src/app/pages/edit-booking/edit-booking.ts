import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';

import { BookingApiService } from '../../services/booking-api.service';
import { TranslateService } from '../../services/translate.service';
import { Booking } from '../../models/booking.model';

@Component({
  selector: 'app-edit-booking',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
  ],
  templateUrl: './edit-booking.html',
  styleUrls: ['./edit-booking.scss'],
})
export class EditBookingComponent {
  bookingId = '';
  form: any;
  isLoading = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private bookingApi: BookingApiService,
    public translate: TranslateService
  ) {
    this.form = this.fb.group({
      groupName: ['', [Validators.required, Validators.minLength(2)]],
      date: [null as Date | null, [Validators.required]],
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      kidsCount: [null as number | null, [Validators.required, Validators.min(0)]],
      teachersCount: [null as number | null, [Validators.required, Validators.min(0)]],
      medicalNotes: [''],
      bookingType: ['day-group', [Validators.required]],
      nights: [null as number | null],
    });

    this.bookingId = (this.route.snapshot.paramMap.get('id') ?? '').trim();

    if (!this.bookingId) {
      this.router.navigateByUrl('/');
      return;
    }

    const navState = history.state as { booking?: Booking };
    if (navState?.booking?.id === this.bookingId) {
      this.patchForm(navState.booking);
      this.isLoading = false;
      return;
    }

    this.bookingApi.getBookingById(this.bookingId).subscribe({
      next: (booking: Booking) => {
        this.patchForm(booking);
        this.isLoading = false;
      },
      error: (err: unknown) => {
        console.error('error loading booking', err);
        alert(this.translate.t('error_loading_booking'));
        this.router.navigateByUrl('/');
      }
    });
  }

  private patchForm(booking: Booking): void {
    this.form.patchValue({
      groupName: booking.groupName,
      date: this.toDateForPicker(booking.date),
      startTime: booking.startTime,
      endTime: booking.endTime,
      kidsCount: booking.kidsCount,
      teachersCount: booking.teachersCount,
      medicalNotes: booking.medicalNotes ?? '',
      bookingType: booking.bookingType ?? 'day-group',
      nights: booking.nights ?? null,
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert(this.translate.t('form_invalid'));
      return;
    }

    const v = this.form.value;

    const updated: Booking = {
      id: this.bookingId,
      groupName: String(v.groupName ?? '').trim(),
      date: this.toLocalDateString(v.date),
      startTime: String(v.startTime ?? ''),
      endTime: String(v.endTime ?? ''),
      kidsCount: Number(v.kidsCount ?? 0),
      teachersCount: Number(v.teachersCount ?? 0),
      medicalNotes: String(v.medicalNotes ?? ''),
      status: 'pending',
      bookingType: v.bookingType,
      nights: v.bookingType === 'residential'
        ? Number(v.nights ?? 1)
        : undefined
    };

    this.bookingApi.updateBooking(this.bookingId, updated).subscribe({
      next: () => {
        alert(this.translate.t('booking_updated_successfully'));
        this.router.navigate(['/booking', this.bookingId]);
      },
      error: (err: unknown) => {
        console.error('error updating booking', err);
        alert(this.translate.t('error_updating_booking'));
      }
    });
  }

  private toLocalDateString(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private toDateForPicker(value: string | Date): Date {
    if (value instanceof Date) {
      return value;
    }

    const datePart = String(value).includes('T') ? String(value).split('T')[0] : String(value);
    const [year, month, day] = datePart.split('-').map(Number);

    return new Date(year, month - 1, day);
  }
}