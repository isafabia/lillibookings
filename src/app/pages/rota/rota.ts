import { Component } from '@angular/core';
import { DatePipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import {
  RotaApiService,
  CreateRotaShiftRequest,
  WeeklyResponses
} from '../../services/rota-api.service';

import { ShiftAssignmentType } from '../../models/rota-shift.model';
import { BookingApiService } from '../../services/booking-api.service';
import { Booking } from '../../models/booking.model';
import { TranslateService } from '../../services/translate.service';
import { UsersApiService, AppUser } from '../../services/users-api.service';

@Component({
  selector: 'app-rota',
  standalone: true,
  imports: [
    NgFor,
    NgIf,
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
  bookings: Booking[] = [];
  employees: AppUser[] = [];

  weeklyResponses: WeeklyResponses = {
    pending: [],
    accepted: [],
    declined: []
  };

  saving = false;
  errorMessage = '';

  assignmentTypes: ShiftAssignmentType[] = [
    'residential-group',
    'activity-station',
    'follow-day-group',
    'birthday-party'
  ];

  form: any;

  constructor(
    private fb: FormBuilder,
    private bookingApi: BookingApiService,
    private rotaApi: RotaApiService,
    private usersApi: UsersApiService,
    public translate: TranslateService
  ) {
    const today = this.todayString();

    this.form = this.fb.group({
      employeeIds: [[], [Validators.required]],
      startDate: [today, [Validators.required]],
      endDate: [today, [Validators.required]],
      startTime: ['09:00', [Validators.required]],
      endTime: ['17:00', [Validators.required]],
      assignmentType: ['activity-station', [Validators.required]],
      groupName: [''],
      activity: [''],
      bookingId: [''],
    });

    this.loadData();

    this.form.get('bookingId')?.valueChanges.subscribe((id: string) => {
      const booking = this.bookings.find(b => b.id === id);

      if (booking) {
        this.form.patchValue({
          groupName: booking.groupName,
          startDate: String(booking.date).split('T')[0],
          endDate: String(booking.date).split('T')[0],
        });
      }
    });
  }

  loadData(): void {
    this.loadWeeklyResponses();

    this.bookingApi.getBookings().subscribe({
      next: (data) => {
        this.bookings = data;
      },
      error: (err) => console.error('error loading bookings', err)
    });

    this.usersApi.getAll().subscribe({
      next: (data) => {
        this.employees = data
          .filter(u => u.role?.toLowerCase() === 'employee')
          .sort((a, b) => a.name.localeCompare(b.name));
      },
      error: (err) => console.error('error loading employees', err)
    });
  }

  loadWeeklyResponses(): void {
    this.rotaApi.getWeeklyResponses().subscribe({
      next: (data) => {
        this.weeklyResponses = data;
      },
      error: (err) => console.error('error loading weekly responses', err)
    });
  }

  addShifts(): void {
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
          employeeId: String(employeeId),
          employeeName: employee?.name ?? '',
          date,
          startTime: String(v.startTime ?? ''),
          endTime: String(v.endTime ?? ''),
          assignmentType: String(v.assignmentType ?? ''),
          activity: String(v.activity ?? '').trim() || null,
          groupName: String(v.groupName ?? '').trim() || null,
          bookingId: v.bookingId ? String(v.bookingId) : null,
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

        this.form.patchValue({
          employeeIds: [],
          groupName: '',
          activity: '',
          bookingId: '',
        });

        this.loadWeeklyResponses();
      },
      error: (err) => {
        console.error('error saving shifts', err);
        this.saving = false;
        this.errorMessage = 'could not save shifts';
      }
    });
  }

  labelForType(type: string): string {
    return this.translate.t(type.replace(/-/g, '_'));
  }

  getBooking(id?: string): Booking | undefined {
    if (!id) return undefined;
    return this.bookings.find(b => b.id === id);
  }

  private todayString(): string {
    return this.formatDate(new Date());
  }

  private getDatesBetween(startDate: string, endDate: string): string[] {
    const dates: string[] = [];

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) return [];

    const current = new Date(start);

    while (current <= end) {
      dates.push(this.formatDate(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  private formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}