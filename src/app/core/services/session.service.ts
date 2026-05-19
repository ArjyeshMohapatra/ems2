import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { CheckRegistrationService } from './check-registration.service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private timer: ReturnType<typeof setTimeout> | null = null;

  private router = inject(Router);
  private crs = inject(CheckRegistrationService);
  
  startSession(token: string): void{
    localStorage.setItem('authToken', token);

    const expiresAt = this.getExpiryTime(token);
    if (!expiresAt || expiresAt < Date.now()) {
      this.logout();
      return;
    }
    this.clearTimer();
    this.timer = setTimeout(() => this.logout(), expiresAt - Date.now());
  }

  restoreSession(): void {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return;
    }

    if (this.isExpired(token)) {
      this.logout();
      return;
    }

    this.startSession(token);
  }

  logout(): void {
    this.clearTimer();
    this.clearSession();
    this.router.navigate(['/login']);
  }

  clearSession(): void {
    localStorage.clear();
    this.crs.clearCache();
    document.cookie.split(';').forEach(cookie => {
      document.cookie =
        cookie.split('=')[0].trim() +
        '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
    });
  }

  isExpired(token: string): boolean{
    const expiresAt = this.getExpiryTime(token);
    return !expiresAt || expiresAt < Date.now();
  }

  private getExpiryTime(token: string): number | null {

    try {
      const payload = jwtDecode<{ exp?: number }>(token);
      return payload.exp ? payload.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}
