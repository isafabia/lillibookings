import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BookingService } from '../../services/booking.service';
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
  styleUrl: './add-booking.scss',
})
export class AddBookingComponent {
  activities = [
    'kayaking',
    'stand up paddle boarding',
    'forest activities',
    'rock wall climbing',
  ];

  form: any; 

 constructor(
  private fb: FormBuilder,
  private bookingService: BookingService,
  private router: Router
) {
  this.form = this.fb.group({
    groupName: ['', [Validators.required, Validators.minLength(2)]],
    date: [null as Date | null, [Validators.required]],
    startTime: ['', [Validators.required]],
    endTime: ['', [Validators.required]],
    activity: ['default', [Validators.required]],
    kidsCount: [null as number | null, [Validators.required, Validators.min(0)]],
    teachersCount: [null as number | null, [Validators.required, Validators.min(0)]],
    medicalNotes: [''],
  });
}
  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;

    const booking: Booking = {
      id: crypto.randomUUID(),
      groupName: String(v.groupName ?? '').trim(),
      date: (v.date as Date).toISOString(),
      startTime: String(v.startTime ?? ''),
      endTime: String(v.endTime ?? ''),
      activity: String(v.activity ?? ''),
      kidsCount: Number(v.kidsCount ?? 0),
      teachersCount: Number(v.teachersCount ?? 0),
      medicalNotes: String(v.medicalNotes ?? ''),
      status: 'confirmed',
    };

    this.bookingService.addBooking(booking);

    // go back to home
    this.router.navigate(['']);
  }
}
