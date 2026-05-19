import { Injectable, inject } from '@angular/core';
import { environment } from '@env/environment';
import { BehaviorSubject, Observable, of, map, catchError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CheckRegistrationService {

  private http = inject(HttpClient);

  // creates a cache variable which holds current value and future updated values & auto notifies subscribers
  private registrationStatus$ = new BehaviorSubject<boolean | null>(null);
  
  private employeeIdSubject = new BehaviorSubject<string | null>(localStorage.getItem('employeeId'));
  public employeeId$ = this.employeeIdSubject.asObservable();
  private checkRegistrationUrl = `${environment.apiUrl}/employeeservice/isRegistered`; 

  checkRegistrationStatus(): Observable<boolean> {
    // if already checked for this session , return cached value
    if (this.registrationStatus$.value !== null) return of(this.registrationStatus$.value);

    // otherwise ask the server
    return this.http.get<any>(this.checkRegistrationUrl)
      .pipe(
        map(res => {
        // Map the backend response to a boolean
        const data = res?.data || res;
        const status = !!data?.isRegistered;
        const employeeId = data?.id;

        // 2. If we have an employeeId, store it for the rest of the app to use
        if (employeeId) {
          localStorage.setItem('employeeId', employeeId);
          this.employeeIdSubject.next(employeeId); // Notify subscribers
        }
        this.registrationStatus$.next(status);
        return status;
        }),
        // Stay safe; if API fails or user is unauthorized, treat as not registered
        catchError(() => {
          this.registrationStatus$.next(false);
          return of(false);
        })
      );
  }

  // Use this on logout
  clearCache(): void{
    this.registrationStatus$.next(null);
  }

  // Manually update if the user completes registration successfully
  setRegistered(): void{
    this.registrationStatus$.next(true);
  }
}
