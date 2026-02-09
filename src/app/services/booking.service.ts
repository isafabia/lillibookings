import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Booking } from '../models/booking.model';

@Injectable({ providedIn: 'root' })
export class BookingService {
  private readonly _bookings = new BehaviorSubject<Booking[]>([
    {
      id: crypto.randomUUID(),
      groupName: "st. anne’s school",
      date: new Date().toISOString(),
      startTime: '11:00',
      endTime: '15:00',
      activity: 'kayaking',
      kidsCount: 25,
      teachersCount: 3,
      medicalNotes: '',
      status: 'confirmed',
    },
  ]);

  bookings$ = this._bookings.asObservable();

  // CREATE
  addBooking(newBooking: Booking): void {
    const current = this._bookings.value;
    this._bookings.next([newBooking, ...current]);
  }

  // READ (by id)
  getById(id: string): Booking | undefined {
    return this._bookings.value.find(b => b.id === id);
  }

  // UPDATE
  updateBooking(updated: Booking): void {
    const current = this._bookings.value;
    const next = current.map(b =>
      b.id === updated.id ? updated : b
    );
    this._bookings.next(next);
  }

  // DELETE
  deleteBooking(id: string): void {
    const current = this._bookings.value;
    this._bookings.next(current.filter(b => b.id !== id));
  }

  // optional helper
  getSnapshot(): Booking[] {
    return this._bookings.value;
  }
}
