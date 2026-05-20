import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { EventLoggerService } from './event-logger';
 
@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
 
  private employeeUrl = `${environment.apiUrl}/employeeservice`;
 
  private http = inject(HttpClient);
  private logger = inject(EventLoggerService);
 
  getEmployeeData(department: string, offset: number, limit: number) {
    this.logger.log('EmployeeService', 'FETCH_EMPLOYEE_DATA_START', { department, offset, limit });
    const params = new HttpParams()
      .set('department', department)
      .set('offset', offset.toString())
      .set('limit', limit.toString());
    return this.http.get(this.employeeUrl, {params}).pipe(
      tap(() => this.logger.log('EmployeeService', 'FETCH_EMPLOYEE_DATA_SUCCESS', { department })),
      catchError(err => {
        this.logger.log('EmployeeService', 'FETCH_EMPLOYEE_DATA_ERROR', { department, err });
        return throwError(() => err);
      })
    );
  }
 
  registerEmployee(payload: any): Observable<any> {
    this.logger.log('EmployeeService', 'REGISTER_EMPLOYEE_START', { payload });
    return this.http.post(this.employeeUrl, payload).pipe(
      tap(res => this.logger.log('EmployeeService', 'REGISTER_EMPLOYEE_SUCCESS', { res })),
      catchError(err => {
        this.logger.log('EmployeeService', 'REGISTER_EMPLOYEE_ERROR', { err });
        return throwError(() => err);
      })
    );
  }

  getAllEmployees(): Observable<any> {
    this.logger.log('EmployeeService', 'GET_ALL_EMPLOYEES_START', {});
    const params = new HttpParams()
      .set('department', 'ALL')
      .set('offset', '0')
      .set('limit', '1000');
    return this.http.get(this.employeeUrl, {params}).pipe(
      tap(res => this.logger.log('EmployeeService', 'GET_ALL_EMPLOYEES_SUCCESS', { res })),
      catchError(err => {
        this.logger.log('EmployeeService', 'GET_ALL_EMPLOYEES_ERROR', { err });
        return throwError(() => err);
      })
    );
  }

  updateEmployee(id: string, payload: any): Observable<any> {
    this.logger.log('EmployeeService', 'UPDATE_EMPLOYEE_START', { id, payload });
    return this.http.put(`${this.employeeUrl}/${id}`, payload).pipe(
      tap(res => this.logger.log('EmployeeService', 'UPDATE_EMPLOYEE_SUCCESS', { id, res })),
      catchError(err => {
        this.logger.log('EmployeeService', 'UPDATE_EMPLOYEE_ERROR', { id, err });
        return throwError(() => err);
      })
    );
  }
 
  getEmployeeById(id: string): Observable<any> {
    this.logger.log('EmployeeService', 'GET_EMPLOYEE_BY_ID_START', { id });
    return this.http.get(`${this.employeeUrl}/${id}`).pipe(
      tap(res => this.logger.log('EmployeeService', 'GET_EMPLOYEE_BY_ID_SUCCESS', { id, res })),
      catchError(err => {
        this.logger.log('EmployeeService', 'GET_EMPLOYEE_BY_ID_ERROR', { id, err });
        return throwError(() => err);
      })
    );
  }
}