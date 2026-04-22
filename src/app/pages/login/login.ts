import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';

import { AuthApiService } from '../../services/auth-api.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(
    private router: Router,
    private authApi: AuthApiService
  ) {}

  login(): void {
    this.errorMessage = '';

    const email = this.email.trim().toLowerCase();
    const password = this.password;

    if (!email || !password) {
      this.errorMessage = 'please enter email and password';
      return;
    }

    this.authApi.login(email, password).subscribe({
      next: (user) => {
        localStorage.setItem(
          'user',
          JSON.stringify({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            dayRate: user.dayRate
          })
        );

        if (user.role === 'admin') {
          this.router.navigate(['/home']);
        } else {
          this.router.navigate(['/employee-home']);
        }
      },
      error: () => {
        this.errorMessage = 'invalid email or password';
      }
    });
  }
}