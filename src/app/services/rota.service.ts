import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RotaShift, ShiftStatus } from '../models/rota-shift.model';

@Injectable({ providedIn: 'root' })
export class RotaService {
  // make a "tomorrow" date for demo data
  private readonly tomorrow = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  })();

  private readonly _shifts = new BehaviorSubject<RotaShift[]>([
    // TODAY shift
    {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      startTime: '09:00',
      endTime: '13:00',
      type: 'activity',
      activity: 'kayaking',
      employeeId: 'emp1',
      employeeName: 'isabella',
      status: 'pending',
      createdAt: new Date().toISOString(),
    },

    // TOMORROW shift ✅
    {
      id: crypto.randomUUID(),
      date: this.tomorrow.toISOString(),
      startTime: '13:00',
      endTime: '17:00',
      type: 'group',
      groupName: "st. anne’s school",
      activity: 'rotating program',
      employeeId: 'emp1',
      employeeName: 'isabella',
      status: 'pending',
      createdAt: new Date().toISOString(),
    },
  ]);

  shifts$ = this._shifts.asObservable();

  addShift(shift: RotaShift): void {
    this._shifts.next([shift, ...this._shifts.value]);
  }

  updateStatus(id: string, status: ShiftStatus): void {
    const now = new Date().toISOString();
    const updated = this._shifts.value.map(s =>
      s.id === id ? { ...s, status, respondedAt: now } : s
    );
    this._shifts.next(updated);
  }

  getSnapshot(): RotaShift[] {
    return this._shifts.value;
  }
}