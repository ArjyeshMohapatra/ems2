import { Router } from '@angular/router';
import { inject } from '@angular/core';

export const guestGuard = () => {
  const router = inject(Router);
  const token = localStorage.getItem('authToken');

  return token ? router.parseUrl('/dashboard') : true;
};