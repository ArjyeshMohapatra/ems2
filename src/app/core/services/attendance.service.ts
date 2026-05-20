import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { EventLoggerService } from './event-logger';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {

  private baseUrl = environment.apiUrl;

  private http = inject(HttpClient);
  private logger = inject(EventLoggerService);

  checkIn(id: string): Observable<any> {
    this.logger.log('AttendanceService', 'CHECK_IN_START', { id });
    return this.http.post(`${this.baseUrl}/employeeservice/check-in/${id}`, {}).pipe(
      tap(res => this.logger.log('AttendanceService', 'CHECK_IN_SUCCESS', { id, res })),
      catchError(err => {
        this.logger.log('AttendanceService', 'CHECK_IN_ERROR', { id, err });
        return throwError(() => err);
      })
    );
  }

  checkOut(id: string): Observable<any> {
    this.logger.log('AttendanceService', 'CHECK_OUT_START', { id });
    return this.http.post(`${this.baseUrl}/employeeservice/check-out/${id}`, {}).pipe(
      tap(res => this.logger.log('AttendanceService', 'CHECK_OUT_SUCCESS', { id, res })),
      catchError(err => {
        this.logger.log('AttendanceService', 'CHECK_OUT_ERROR', { id, err });
        return throwError(() => err);
      })
    );
  }

  getAttendance(id: string, limit: number, offset: number): Observable<any>{
    this.logger.log('AttendanceService', 'GET_ATTENDANCE_START', { id, limit, offset });
    return this.http.get(`${this.baseUrl}/employeeservice/attendance/${id}?limit=${limit}&offset=${offset}`).pipe(
      tap(res => this.logger.log('AttendanceService', 'GET_ATTENDANCE_SUCCESS', { id, res })),
      catchError(err => {
        this.logger.log('AttendanceService', 'GET_ATTENDANCE_ERROR', { id, err });
        return throwError(() => err);
      })
    );
  }
}