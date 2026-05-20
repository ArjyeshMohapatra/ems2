import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { CheckRegistrationService, EventLoggerService } from '@core/services';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private timer: ReturnType<typeof setTimeout> | null = null;

  private router = inject(Router);
  private logger = inject(EventLoggerService);
  private crs = inject(CheckRegistrationService);
  
  startSession(token: string): void{
    localStorage.setItem('authToken', token);
    this.logger.log('SessionService', 'SETTING_AUTH_TOKEN', { authToken: token });

    const expiresAt = this.getExpiryTime(token);
    this.logger.log('SessionService', 'FETCHING_AUTH_TOKEN_EXPIRY_TIME', {});

    if (!expiresAt || expiresAt < Date.now()) {
      this.logger.log('SessionService', 'AUTH_TOKEN_EXPIRED', {});
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
      this.logger.log('SessionService', 'AUTH_TOKEN_EXPIRED', {});
      this.logout();
      return;
    }

    this.startSession(token);
    this.logger.log('SessionService', 'RESTORING_USER_SESSION', {});
  }

  logout(): void {
    this.logger.log('SessionService', 'LOGGING_USER_OUT', {});
    this.clearTimer();
    this.clearSession();
    this.router.navigate(['/login']);
    this.logger.log('SessionService', 'NAVIGATING_TO_LOGIN', {});
  }

  clearSession(): void {
    localStorage.clear();
    this.crs.clearCache();
    this.logger.log('SessionService', 'PURGING_LOCAL-STORAGE_AND_CRS', {});
    document.cookie.split(';').forEach(cookie => {
      document.cookie =
        cookie.split('=')[0].trim() +
        '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
    });
    this.logger.log('SessionService', 'CLEARNING_COOKIES', {});
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
