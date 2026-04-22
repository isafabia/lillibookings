import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';

import { BookingApiService } from '../../services/booking-api.service';
import { TranslateService } from '../../services/translate.service';
import { Booking } from '../../models/booking.model';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-add-booking',
  standalone: true,
  imports: [
    NgIf,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './add-booking.html',
  styleUrls: ['./add-booking.scss'],
})
export class AddBookingComponent {
  form: any;

  constructor(
    private fb: FormBuilder,
    private bookingApi: BookingApiService,
    private router: Router,
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
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;

    const booking: Booking = {
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

    this.bookingApi.addBooking(booking).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err: unknown) => {
        console.error('error saving booking', err);
        alert(this.translate.t('error_saving_booking'));
      }
    });
  }

  private toLocalDateString(value: Date): string {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}