import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RotaShift } from '../models/rota-shift.model';

export interface CreateRotaShiftRequest {
  employeeId: string;
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;
  assignmentType: string;
  activity: string | null;
  groupName: string | null;
  bookingId: string | null;
  status: string;
  confirmedWorked: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RotaApiService {
  private apiUrl = 'http://localhost:5180/api/rota';

  constructor(private http: HttpClient) {}

  getAll(): Observable<RotaShift[]> {
    return this.http.get<RotaShift[]>(this.apiUrl);
  }

  create(shift: CreateRotaShiftRequest): Observable<RotaShift> {
    return this.http.post<RotaShift>(this.apiUrl, shift);
  }

  updateStatus(id: string, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, { status });
  }
}