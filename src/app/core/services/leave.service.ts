import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { environment } from '@env/environment';
 
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
 
 
  // 2. Intercept actions to trigger auto-refresh
  applyLeave(empId: string, payload: any) {
    return this.http.post(`${this.baseUrl}/${empId}`, payload).pipe(
      tap(() => this.refreshState(empId)) // Auto-refresh employee's list
    );
  }
 
  getLeavesByEmpId(empId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${empId}`);
  }

  getLeavesByStatus(status: 'PENDING' | 'APPROVED' | 'REJECTED'): Observable<any> {
      return this.http.get(`${this.baseUrl}?status=${status}`);
  }
 
  updateLeaveStatus(leaveId: string, status: string) {
    return this.http.patch(`${this.baseUrl}/${leaveId}`, { status }).pipe(
      tap(() => this.refreshState()) // Auto-refresh HR count
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