import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RotaShift, ShiftStatus } from '../models/rota-shift.model';

@Injectable({
  providedIn: 'root'
})
export class RotaService {
  private readonly storageKey = 'lilliput-rota-shifts';

  private readonly _shifts = new BehaviorSubject<RotaShift[]>(this.loadShifts());

  shifts$ = this._shifts.asObservable();

  private loadShifts(): RotaShift[] {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return [];

    try {
      return JSON.parse(raw) as RotaShift[];
    } catch {
      return [];
    }
  }

  private saveShifts(shifts: RotaShift[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(shifts));
  }

  getSnapshot(): RotaShift[] {
    return this._shifts.value;
  }

  addShift(shift: RotaShift): void {
    const updated = [shift, ...this._shifts.value];
    this._shifts.next(updated);
    this.saveShifts(updated);
  }

  updateShiftStatus(id: string, status: ShiftStatus): void {
    const updated = this._shifts.value.map(s =>
      s.id === id ? { ...s, status } : s
    );

    this._shifts.next(updated);
    this.saveShifts(updated);
  }

  getByEmployee(name: string): RotaShift[] {
    return this._shifts.value.filter(
      s => s.employeeName.toLowerCase() === name.toLowerCase()
    );
  }

  clearAll(): void {
    this._shifts.next([]);
    localStorage.removeItem(this.storageKey);
  }
}