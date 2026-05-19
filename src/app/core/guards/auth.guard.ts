import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SessionService } from '../services';

export const authGuard = () => {

  const router = inject(Router);
  const session = inject(SessionService);

  const token = localStorage.getItem('authToken');

  if (!token || session.isExpired(token)) {
    session.clearSession();
    return router.parseUrl('/login');
  }

  return true;
};