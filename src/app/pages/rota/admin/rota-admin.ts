import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AsyncPipe, NgFor, NgIf, NgClass, DatePipe} from '@angular/common';
import { forkJoin } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { RotaApiService, CreateRotaShiftRequest } from '../../../services/rota-api.service';
import { BookingApiService } from '../../../services/booking-api.service';
import { UsersApiService, AppUser } from '../../../services/users-api.service';
import { TranslateService } from '../../../services/translate.service';

import { RotaShift } from '../../../models/rota-shift.model';
import { Booking } from '../../../models/booking.model';
import { LILLIPUT_ACTIVITIES } from '../../../constants/activities';

@Component({
  selector: 'app-rota-admin',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    AsyncPipe,
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './rota-admin.html',
  styleUrls: ['./rota-admin.scss'],
})
export class RotaAdminComponent {
  activities = LILLIPUT_ACTIVITIES;

  employees: AppUser[] = [];
  bookings: Booking[] = [];
  shifts: RotaShift[] = [];

  saving = false;
  errorMessage = '';

  form: any;

  constructor(
    private fb: FormBuilder,
    private rotaApi: RotaApiService,
    private bookingApi: BookingApiService,
    private usersApi: UsersApiService,
    public translate: TranslateService
  ) {
    const today = new Date().toISOString().slice(0, 10);

    this.form = this.fb.group({
      employeeIds: [[], [Validators.required]],
      startDate: [today, [Validators.required]],
      endDate: [today, [Validators.required]],
      startTime: ['09:00', [Validators.required]],
      endTime: ['17:00', [Validators.required]],
      type: ['activity', [Validators.required]],
      activity: [this.activities[0], [Validators.required]],
      groupName: [''],
      bookingId: [''],
    });

    this.loadData();
  }

  loadData(): void {
    this.rotaApi.getAll().subscribe({
      next: (data) => (this.shifts = data),
      error: (err) => console.error('error loading shifts', err),
    });

    this.bookingApi.getBookings().subscribe({
      next: (data) => (this.bookings = data),
      error: (err) => console.error('error loading bookings', err),
    });

    this.usersApi.getAll().subscribe({
      next: (data) => {
        this.employees = data
          .filter(u => u.role?.toLowerCase() === 'employee')
          .sort((a, b) => a.name.localeCompare(b.name));
      },
      error: (err) => console.error('error loading employees', err),
    });
  }

  saveShifts(): void {
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    const dates = this.getDatesBetween(v.startDate, v.endDate);

    if (dates.length === 0) {
      this.errorMessage = 'end date cannot be before start date';
      return;
    }

    const requests = [];

    for (const employeeId of v.employeeIds) {
      const employee = this.employees.find(e => e.id === employeeId);

      for (const date of dates) {
        const shift: CreateRotaShiftRequest = {
          employeeId: employeeId,
          employeeName: employee?.name ?? '',
          date: date,
          startTime: String(v.startTime ?? ''),
          endTime: String(v.endTime ?? ''),
          assignmentType: v.type === 'activity' ? 'activity-station' : 'follow-day-group',
          activity: String(v.activity ?? '').trim() || null,
          groupName: String(v.groupName ?? '').trim() || null,
          bookingId: v.bookingId || null,
          status: 'pending',
          confirmedWorked: false,
        };

        requests.push(this.rotaApi.create(shift));
      }
    }

    if (requests.length === 0) {
      this.errorMessage = 'please select at least one employee';
      return;
    }

    this.saving = true;

    forkJoin(requests).subscribe({
      next: () => {
        this.saving = false;
        this.loadData();

        this.form.patchValue({
          employeeIds: [],
          groupName: '',
          bookingId: '',
        });
      },
      error: (err) => {
        console.error('error saving shifts', err);
        this.saving = false;
        this.errorMessage = 'could not save shifts';
      }
    });
  }

  onBookingSelected(bookingId: string): void {
    const booking = this.bookings.find(b => b.id === bookingId);

    if (!booking) return;

    this.form.patchValue({
      groupName: booking.groupName,
      startDate: booking.date?.slice(0, 10),
      endDate: booking.date?.slice(0, 10),
    });
  }

  get pendingShifts(): RotaShift[] {
    return this.shifts.filter(s => this.statusLabel(s.status) === 'pending');
  }

  get acceptedShifts(): RotaShift[] {
    return this.shifts.filter(s =>
      this.statusLabel(s.status) === 'accepted' && !s.confirmedWorked
    );
  }

  get workedShifts(): RotaShift[] {
    return this.shifts.filter(s => s.confirmedWorked || this.statusLabel(s.status) === 'worked');
  }

  get declinedShifts(): RotaShift[] {
    return this.shifts.filter(s => this.statusLabel(s.status) === 'declined');
  }

  statusLabel(status: string): string {
    return status?.trim().toLowerCase() || 'pending';
  }

  private getDatesBetween(startDate: string, endDate: string): string[] {
    const dates: string[] = [];

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) return [];

    const current = new Date(start);

    while (current <= end) {
      const formatted =
        current.getFullYear() + '-' +
        String(current.getMonth() + 1).padStart(2, '0') + '-' +
        String(current.getDate()).padStart(2, '0');

      dates.push(formatted);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }
}