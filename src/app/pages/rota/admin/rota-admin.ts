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

import { RotaService } from '../../../services/rota.service';
import { BookingService } from '../../../services/booking.service';
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
  styleUrl: './rota-admin.scss',
})
export class RotaAdminComponent {
  activities = LILLIPUT_ACTIVITIES;

  employees = [
    { id: 'emp1', name: 'isabella' },
    { id: 'emp2', name: 'samuel' },
    { id: 'emp3', name: 'staff 3' },
  ];

  bookings: Booking[] = [];

  // ✅ for recent shifts list
  shifts$!: Observable<RotaShift[]>;

  form: any;

  constructor(
    private fb: FormBuilder,
    private rotaService: RotaService,
    private bookingService: BookingService
  ) {
    // ✅ recent shifts stream
    this.shifts$ = this.rotaService.shifts$;

    // ✅ bookings snapshot for dropdown
    this.bookings = this.bookingService.getSnapshot?.() ?? [];

    // ✅ form with real default activity
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

    const shift: RotaShift = {
      id: crypto.randomUUID(),
      date: new Date(v.date).toISOString(),
      startTime: String(v.startTime),
      endTime: String(v.endTime),
      type: v.type,

      activity: v.type === 'activity' ? String(v.activity ?? '') : undefined,
      groupName: v.type === 'group' ? String(v.groupName ?? '') : undefined,

      employeeId: String(v.employeeId),
      employeeName: emp?.name ?? 'employee',

      bookingId: v.bookingId ? String(v.bookingId) : undefined,

      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.rotaService.addShift(shift);

    // ✅ reset form (activity must be a string, not an array)
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
  }
}