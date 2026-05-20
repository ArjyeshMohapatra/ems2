import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable, of, map, catchError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EventLoggerService } from '@core/services';

@Injectable({
  providedIn: 'root'
})
export class CheckRegistrationService {

  private http = inject(HttpClient);
  private logger = inject(EventLoggerService);

  // creates a cache variable which holds current value and future updated values & auto notifies subscribers
  private registrationStatus$ = new BehaviorSubject<boolean | null>(null);
  
  private employeeIdSubject = new BehaviorSubject<string | null>(localStorage.getItem('employeeId'));
  public employeeId$ = this.employeeIdSubject.asObservable();
  private checkRegistrationUrl = `${environment.apiUrl}/employeeservice/isRegistered`; 

  checkRegistrationStatus(): Observable<boolean> {
    const crsValue = this.registrationStatus$.value
    // if already checked for this session , return cached value
    if (crsValue!== null) {
      this.logger.log('CHECK_REGISTRATION_SERVICE', 'RETURNING_CACHED_REGISTRATION_STATUS', { result:  crsValue});
      return of(crsValue);
    }

    // otherwise ask the server
    return this.http.get<any>(this.checkRegistrationUrl)
      .pipe(
        map(res => {
          this.logger.log('CHECK_REGISTRATION_SERVICE', 'FETCHING_REGISTRATION_STATUS', {result: res});
        // Map the backend response to a boolean
        const data = res?.data || res;
        const status = !!data?.isRegistered;
        const employeeId = data?.id;

        // 2. If we have an employeeId, store it for the rest of the app to use
        if (employeeId) {
          localStorage.setItem('employeeId', employeeId);
          this.logger.log('CHECK_REGISTRATION_SERVICE', 'SETTING_EMPLOYEE_ID', {});

          this.logger.log('CHECK_REGISTRATION_SERVICE', 'NOTIFYING_SUBSCRIBERS', {});
          this.employeeIdSubject.next(employeeId); // Notify subscribers
        }
        this.registrationStatus$.next(status);
        return status;
        }),
        // Stay safe; if API fails or user is unauthorized, treat as not registered
        catchError((err) => {
          this.logger.log('CHECK_REGISTRATION_SERVICE', 'FAILED_WHILE_FETCHING_REGISTRATION_STATUS', {err});
          this.registrationStatus$.next(false);
          return of(false);
        })
      );
  }

  // Use this on logout
  clearCache(): void{
    this.registrationStatus$.next(null);
    this.logger.log('CHECK_REGISTRATION_SERVICE', 'CLEARING_REGISTRATION_CACHE', {});
  }

  // Manually update if the user completes registration successfully
  setRegistered(): void{
    this.registrationStatus$.next(true);
  }
}
