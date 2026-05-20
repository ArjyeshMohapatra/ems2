import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { EventLoggerService } from './event-logger';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loginUrl = `${environment.authUrl}/login`;
  private signupUrl = `${environment.authUrl}/signup`;
  private formHeaders = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded'
  });

  private http = inject(HttpClient);
  private logger = inject(EventLoggerService);

  login(email: string, password: string): Observable<any> {

    const body = new HttpParams()
      .set('email', email)
      .set('password', password);
    
    this.logger.log('AuthService', 'SETTING_URL_PARAMS', {});

    this.logger.log('AuthService', 'POSTING_LOGIN_DATA_TO_API', {api: this.loginUrl});
    return this.http.post(this.loginUrl, body.toString(), {
      headers: this.formHeaders
    });
  }

  signUp(email: string, password: string, role: string): Observable<any> {
    const body = new HttpParams()
      .set('email', email)
      .set('password', password)
      .set('role', role);
    this.logger.log('AuthService', 'SETTING_URL_PARAMS', {});
    
    this.logger.log('AuthService', 'POSTING_SIGNUP_DATA_TO_API', {api: this.signupUrl});
    return this.http.post(this.signupUrl, body.toString(), {
      headers: this.formHeaders
    });
  }
}