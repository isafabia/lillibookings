import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AsyncPipe, NgFor, NgIf, NgClass } from '@angular/common';
import { Observable } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { RotaApiService, CreateRotaShiftRequest } from '../../../services/rota-api.service';
import { BookingApiService } from '../../../services/booking-api.service';
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

  employees = [
    { id: 'emp1', name: 'isabella' },
    { id: 'emp2', name: 'samuel' },
    { id: 'emp3', name: 'staff 3' },
  ];

  bookings: Booking[] = [];
  shifts$!: Observable<RotaShift[]>;

  form: any;

  constructor(
    private fb: FormBuilder,
    private rotaApi: RotaApiService,
    private bookingApi: BookingApiService,
    public translate: TranslateService
  ) {
    this.shifts$ = this.rotaApi.getAll();

    this.bookingApi.getBookings().subscribe({
      next: (data) => (this.bookings = data),
      error: (err) => console.error('error loading bookings', err),
    });

    this.form = this.fb.group({
      date: [new Date().toISOString().slice(0, 10), [Validators.required]],
      startTime: ['09:00', [Validators.required]],
      endTime: ['13:00', [Validators.required]],
      type: ['activity', [Validators.required]],
      activity: [this.activities[0], [Validators.required]],
      groupName: [''],
      employeeId: ['emp1', [Validators.required]],
      bookingId: [''],
    });
  }

  saveShift(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;
    const emp = this.employees.find(e => e.id === v.employeeId);

    const selectedDate = new Date(v.date);

    const formattedDate =
      selectedDate.getFullYear() + '-' +
      String(selectedDate.getMonth() + 1).padStart(2, '0') + '-' +
      String(selectedDate.getDate()).padStart(2, '0');

    const shift: CreateRotaShiftRequest = {
      employeeId: String(v.employeeId ?? ''),
      employeeName: emp?.name ?? '',
      date: formattedDate,
      startTime: String(v.startTime ?? ''),
      endTime: String(v.endTime ?? ''),
      assignmentType: v.type === 'activity' ? 'activity-station' : 'follow-day-group',
      activity: String(v.activity ?? '').trim() || null,
      groupName: String(v.groupName ?? '').trim() || null,
      bookingId: v.bookingId || null,
      status: 'pending',
      confirmedWorked: false,
    };

    this.rotaApi.create(shift).subscribe({
      next: () => {
        this.shifts$ = this.rotaApi.getAll();

        this.form.reset({
          date: new Date().toISOString().slice(0, 10),
          startTime: '09:00',
          endTime: '13:00',
          type: 'activity',
          activity: this.activities[0],
          groupName: '',
          employeeId: 'emp1',
          bookingId: '',
        });
      },
      error: (err) => {
        console.error('error saving shift', err);
        alert(this.translate.t('error_saving_shift'));
      }
    });
  }
}