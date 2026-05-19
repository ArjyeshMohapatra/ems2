import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
 
@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
 
  private employeeUrl = `${environment.apiUrl}/employeeservice`;
 
  private http = inject(HttpClient);
 
  getEmployeeData(department: string, offset: number, limit: number) {
    const params = new HttpParams()
      .set('department', department)
      .set('offset', offset.toString())
      .set('limit', limit.toString());
    return this.http.get(this.employeeUrl, {params});
  }
 
  registerEmployee(payload: any): Observable<any> {
    return this.http.post(this.employeeUrl, payload);
  }

  getAllEmployees(): Observable<any> {
    const params = new HttpParams()
      .set('department', 'ALL')
      .set('offset', '0')
      .set('limit', '1000');
    return this.http.get(this.employeeUrl, {params});
  }

  updateEmployee(id: string, payload: any): Observable<any> {
    return this.http.put(`${this.employeeUrl}/${id}`, payload);
  }
 
  getEmployeeById(id: string): Observable<any> {
    return this.http.get(`${this.employeeUrl}/${id}`);
  }
}