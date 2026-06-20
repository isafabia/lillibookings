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

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: string;
  dayRate: number;
}

@Injectable({
  providedIn: 'root'
})
export class UsersApiService {
  private apiUrl = 'https://lillibookings-api.onrender.com/api/users';

  constructor(private http: HttpClient) {}

  getAll(): Observable<AppUser[]> {
    return this.http.get<AppUser[]>(this.apiUrl);
  }

  create(user: CreateUserRequest): Observable<AppUser> {
    return this.http.post<AppUser>(this.apiUrl, user);
  }

  delete(id: string): Observable<any> {
  return this.http.delete(`${this.apiUrl}/${id}`);
}
}