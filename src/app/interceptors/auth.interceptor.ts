import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  // continue without token if user is not logged in
  if (!token) {
    return next(req);
  }

  // add token to api requests
  const clonedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(clonedRequest);
};