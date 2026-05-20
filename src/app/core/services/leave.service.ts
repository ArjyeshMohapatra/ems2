import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { environment } from '@env/environment';
import { EventLoggerService } from './event-logger';
 
@Injectable({
  providedIn: 'root'
})
export class LeaveService {

  // central state that everyone subscribes to
  private leaveStatusSubject = new BehaviorSubject<any[]>([]);
  public leaves$ = this.leaveStatusSubject.asObservable();

  private pendingCountSubject = new BehaviorSubject<number>(0);
  public pendingCount$ = this.pendingCountSubject.asObservable();

  private baseUrl = `${environment.apiUrl}/leaveservice`;
 
  private http = inject(HttpClient);
  private logger = inject(EventLoggerService);
 
 
  // 2. Intercept actions to trigger auto-refresh
  applyLeave(empId: string, payload: any) {
    this.logger.log('LeaveService', 'APPLY_LEAVE_START', { empId, payload });
    return this.http.post(`${this.baseUrl}/${empId}`, payload).pipe(
      tap((res) => {
        this.logger.log('LeaveService', 'APPLY_LEAVE_SUCCESS', { empId, res });
        this.refreshState(empId);
      }), // Auto-refresh employee's list
      catchError(err => {
        this.logger.log('LeaveService', 'APPLY_LEAVE_ERROR', { empId, err });
        return throwError(() => err);
      })
    );
  }
 
  getLeavesByEmpId(empId: string): Observable<any> {
    this.logger.log('LeaveService', 'GET_LEAVES_BY_EMP_ID_START', { empId });
    return this.http.get(`${this.baseUrl}/${empId}`).pipe(
      tap((res) => this.logger.log('LeaveService', 'GET_LEAVES_BY_EMP_ID_SUCCESS', { empId, res })),
      catchError(err => {
        this.logger.log('LeaveService', 'GET_LEAVES_BY_EMP_ID_ERROR', { empId, err });
        return throwError(() => err);
      })
    );
  }

  getLeavesByStatus(status: 'PENDING' | 'APPROVED' | 'REJECTED'): Observable<any> {
      return this.http.get(`${this.baseUrl}?status=${status}`);
  }
 
  updateLeaveStatus(leaveId: string, status: string) {
    this.logger.log('LeaveService', 'UPDATE_LEAVE_STATUS_START', { leaveId, status });
    return this.http.patch(`${this.baseUrl}/${leaveId}`, { status }).pipe(
      tap((res) => {
        this.logger.log('LeaveService', 'UPDATE_LEAVE_STATUS_SUCCESS', { leaveId, status, res });
        this.refreshState();
      }), // Auto-refresh HR count
      catchError(err => {
        this.logger.log('LeaveService', 'UPDATE_LEAVE_STATUS_ERROR', { leaveId, status, err });
        return throwError(() => err);
      })
    );
  }

  refreshState(empId?: string) {
    // If empId is provided, we fetch just that emp's leaves
    // If not, we fetch all PENDING leaves (for HR)
    const request = empId 
      ? this.getLeavesByEmpId(empId) 
      : this.getLeavesByStatus('PENDING');

    request.subscribe({
      next: (res) => {
        const data = res?.data || [];
    
        this.leaveStatusSubject.next(data);
    
        if (!empId) this.pendingCountSubject.next(data.length);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  
}