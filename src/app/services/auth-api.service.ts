import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppUser } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:5180/api/users'; 

  login(email: string, password: string): Observable<AppUser> {
    return this.http.post<AppUser>(`${this.baseUrl}/login`, {
      email,
      password
    });
  }
}