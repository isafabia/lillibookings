import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const employeeGuard: CanActivateFn = () => {
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');

  if (!token || !savedUser) {
    router.navigate(['/login']);
    return false;
  }

  const user = JSON.parse(savedUser);

  if (user.role !== 'employee') {
    router.navigate(['/home']);
    return false;
  }

  return true;
};