import { Component } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatIconModule } from '@angular/material/icon';

import { Observable } from 'rxjs';
import { UsersApiService, AppUser, CreateUserRequest } from '../../services/users-api.service';

@Component({
  selector: 'app-employees',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, FormsModule, RouterLink, MatIconModule],
  templateUrl: './employees.html',
  styleUrls: ['./employees.scss']
})
export class EmployeesComponent {
  users$!: Observable<AppUser[]>;

  name = '';
  email = '';
  password = '';
  role = 'employee';

  errorMessage = '';
  successMessage = '';

  constructor(private usersApi: UsersApiService) {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.users$ = this.usersApi.getAll();
  }

  createUser(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const payload: CreateUserRequest = {
      name: this.name.trim(),
      email: this.email.trim().toLowerCase(),
      password: this.password,
      role: this.role,
      dayRate: 0
    };

    if (!payload.name || !payload.email || !payload.password) {
      this.errorMessage = 'please fill in name, email and password';
      return;
    }

    this.usersApi.create(payload).subscribe({
      next: () => {
        this.successMessage = 'employee created successfully';
        this.name = '';
        this.email = '';
        this.password = '';
        this.role = 'employee';
        this.loadUsers();
      },
      error: (err) => {
        this.errorMessage = err?.error || 'could not create user';
      }
    });
  }
}