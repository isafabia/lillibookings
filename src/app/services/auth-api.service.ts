import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { LoginResponse } from '../models/login-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private apiUrl = 'http://localhost:5180/api/users';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      email,
      password
    });
  }
}