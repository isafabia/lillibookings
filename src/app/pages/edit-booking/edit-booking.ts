import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/booking.model';

@Component({
  selector: 'app-edit-booking',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './edit-booking.html',
  styleUrl: './edit-booking.scss',
})
export class EditBookingComponent {
  bookingId = '';
  form: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService
  ) {
    // build the form AFTER fb exists
    this.form = this.fb.group({
      groupName: ['', [Validators.required, Validators.minLength(2)]],
      date: [null as Date | null, [Validators.required]],
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],
      kidsCount: [null as number | null, [Validators.required, Validators.min(0)]],
      teachersCount: [null as number | null, [Validators.required, Validators.min(0)]],
      medicalNotes: [''],
    });

    this.bookingId = this.route.snapshot.paramMap.get('id') ?? '';
    const existing = this.bookingService.getById(this.bookingId);

    if (!existing) {
      this.router.navigateByUrl('/');
      return;
    }

    this.form.patchValue({
      groupName: existing.groupName,
      date: new Date(existing.date),
      startTime: existing.startTime,
      endTime: existing.endTime,
      kidsCount: existing.kidsCount,
      teachersCount: existing.teachersCount,
      medicalNotes: existing.medicalNotes,
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;

    const existing = this.bookingService.getById(this.bookingId);
    if (!existing) return;

    const updated: Booking = {
      ...existing, // keeps id, status, activity, etc
      groupName: String(v.groupName ?? '').trim(),
      date: (v.date as Date).toISOString(),
      startTime: String(v.startTime ?? ''),
      endTime: String(v.endTime ?? ''),
      kidsCount: Number(v.kidsCount ?? 0),
      teachersCount: Number(v.teachersCount ?? 0),
      medicalNotes: String(v.medicalNotes ?? ''),
    };

    this.bookingService.updateBooking(updated);
    this.router.navigate(['/booking', this.bookingId]);
  }
}