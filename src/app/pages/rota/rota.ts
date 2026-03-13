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

import { RotaService } from '../../services/rota.service';
import { RotaShift, ShiftAssignmentType } from '../../models/rota-shift.model';

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
  styleUrl: './rota.scss',
})
export class RotaComponent {
  shifts$: Observable<RotaShift[]>;

  assignmentTypes: ShiftAssignmentType[] = [
    'residential-group',
    'activity-station',
    'follow-day-group'
  ];

  form: any;

  constructor(
    private fb: FormBuilder,
    private rotaService: RotaService
  ) {
    this.shifts$ = this.rotaService.shifts$;

    this.form = this.fb.group({
      employeeName: ['', [Validators.required]],
      date: [new Date().toISOString().slice(0, 10), [Validators.required]],
      startTime: ['09:00', [Validators.required]],
      endTime: ['17:00', [Validators.required]],
      assignmentType: ['activity-station', [Validators.required]],
      groupName: [''],
      activityName: [''],
    });
  }

  addShift(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;

    const shift: RotaShift = {
      id: crypto.randomUUID(),
      employeeName: String(v.employeeName ?? '').trim(),
      date: new Date(v.date).toISOString(),
      startTime: String(v.startTime ?? ''),
      endTime: String(v.endTime ?? ''),
      assignmentType: v.assignmentType,
      groupName: String(v.groupName ?? '').trim() || undefined,
      activityName: String(v.activityName ?? '').trim() || undefined,
      status: 'pending',
    };

    this.rotaService.addShift(shift);

    this.form.reset({
      employeeName: '',
      date: new Date().toISOString().slice(0, 10),
      startTime: '09:00',
      endTime: '17:00',
      assignmentType: 'activity-station',
      groupName: '',
      activityName: '',
    });
  }

  clearAllShifts(): void {
    const ok = confirm('clear all rota shifts?');
    if (!ok) return;

    this.rotaService.clearAll();
  }

  labelForType(type: ShiftAssignmentType): string {
    switch (type) {
      case 'residential-group':
        return 'residential group';
      case 'activity-station':
        return 'activity station';
      case 'follow-day-group':
        return 'follow day group';
    }
  }
}