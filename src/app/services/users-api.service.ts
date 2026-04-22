import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: string;
  dayRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsersApiService {
  private apiUrl = 'http://localhost:5180/api/users';

  constructor(private http: HttpClient) {}

  getAll(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(this.apiUrl);
  }
}