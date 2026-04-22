import { Component } from '@angular/core';
import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { Observable } from 'rxjs';

import { RotaApiService, CreateRotaShiftRequest } from '../../services/rota-api.service';
import { RotaShift, ShiftAssignmentType } from '../../models/rota-shift.model';

import { BookingApiService } from '../../services/booking-api.service';
import { Booking } from '../../models/booking.model';
import { TranslateService } from '../../services/translate.service';

@Component({
  selector: 'app-rota',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    AsyncPipe,
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './rota.html',
  styleUrls: ['./rota.scss'],
})
export class RotaComponent {
  shifts$!: Observable<RotaShift[]>;
  bookings: Booking[] = [];

  assignmentTypes: ShiftAssignmentType[] = [
    'residential-group',
    'activity-station',
    'follow-day-group'
  ];

  form: any;

  constructor(
    private fb: FormBuilder,
    private bookingApi: BookingApiService,
    private rotaApi: RotaApiService,
    public translate: TranslateService
  ) {
    this.shifts$ = this.rotaApi.getAll();

    this.bookingApi.getBookings().subscribe({
      next: (data) => {
        this.bookings = data;
      },
      error: (err) => {
        console.error('error loading bookings', err);
      }
    });

    this.form = this.fb.group({
      employeeName: ['', [Validators.required]],
      date: [this.todayString(), [Validators.required]],
      startTime: ['09:00', [Validators.required]],
      endTime: ['17:00', [Validators.required]],
      assignmentType: ['activity-station', [Validators.required]],
      groupName: [''],
      activityName: [''],
      bookingId: [''],
    });

    this.form.get('bookingId')?.valueChanges.subscribe((id: string) => {
      const booking = this.bookings.find(b => b.id === id);

      if (booking) {
        this.form.patchValue({
          groupName: booking.groupName,
          date: String(booking.date).split('T')[0]
        });
      }
    });
  }

  addShift(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    const selectedBooking = this.bookings.find(b => b.id === v.bookingId);

    const shift: CreateRotaShiftRequest = {
      employeeId: String(v.employeeName ?? '')
        .trim()
        .toLowerCase()
        .replaceAll(' ', '-'),

      employeeName: String(v.employeeName ?? '').trim(),

      date: this.normalizeApiDate(v.date),

      startTime: String(v.startTime ?? ''),
      endTime: String(v.endTime ?? ''),

      assignmentType: String(v.assignmentType ?? ''),

      activity: v.activityName
        ? String(v.activityName).trim()
        : null,

      groupName:
        selectedBooking?.groupName ||
        (v.groupName ? String(v.groupName).trim() : null),

      bookingId: v.bookingId ? String(v.bookingId) : null,

      status: 'pending',
      confirmedWorked: false
    };

    this.rotaApi.create(shift).subscribe({
      next: () => {
        this.shifts$ = this.rotaApi.getAll();

        this.form.reset({
          employeeName: '',
          date: this.todayString(),
          startTime: '09:00',
          endTime: '17:00',
          assignmentType: 'activity-station',
          groupName: '',
          activityName: '',
          bookingId: '',
        });
      },
      error: (err) => {
        console.error('BACKEND ERROR:', err);
        alert(this.translate.t('error_saving_shift_check_console'));
      }
    });
  }

  clearAllShifts(): void {
    alert(this.translate.t('clear_all_not_connected'));
  }

  labelForType(type: ShiftAssignmentType): string {
    return this.translate.t(type.replace(/-/g, '_'));
  }

  getBooking(id?: string): Booking | undefined {
    if (!id) return undefined;
    return this.bookings.find(b => b.id === id);
  }

  private todayString(): string {
    const today = new Date();
    return this.formatDate(today);
  }

  private normalizeApiDate(value: string | Date): string {
    if (value instanceof Date) {
      return this.formatDate(value);
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    if (value.includes('T')) {
      return value.split('T')[0];
    }

    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return this.formatDate(parsed);
    }

    return value;
  }

  private formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}