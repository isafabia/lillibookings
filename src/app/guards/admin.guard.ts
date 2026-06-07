import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const savedUser = localStorage.getItem('user');

  if (!token || !savedUser) {
    router.navigate(['/login']);
    return false;
  }

  const user = JSON.parse(savedUser);

 if (String(user.role).trim().toLowerCase() !== 'admin') {
    router.navigate(['/employee-home']);
    return false;
  }

  return true;
};