import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from '../models/booking.model';

@Injectable({
  providedIn: 'root'
})
export class BookingApiService {
  private apiUrl = 'http://localhost:5180/api/Bookings';

  constructor(private http: HttpClient) {}

  addBooking(booking: Booking): Observable<Booking> {
    return this.http.post<Booking>(this.apiUrl, booking);
  }

  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(this.apiUrl);
  }

  getBookingById(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${id}`);
  }

  updateBooking(id: string, booking: Booking) {
    return this.http.put(`${this.apiUrl}/${id}`, booking);
  }

  deleteBooking(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}