import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Replaces CommonModule in old module
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

// Material and Shared UI Imports
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { PageLayoutComponent, SearchBarComponent } from '@shared/ui';
import { TableComponent } from '@shared';

// Services
import { LeaveService, NotificationService, LoadingService, CheckRegistrationService } from '@core/services';


interface LeaveRequest {
  id: string;
  emp_id: string;
  from_date: string;
  to_date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
  slNo?: number;
}
 
@Component({
  selector: 'app-leave-mgmt',
  standalone: true, // Mark as standalone
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    PageLayoutComponent,
    TableComponent,
    SearchBarComponent
  ], // Dependencies moved from the old module file
  templateUrl: './leave-mgmt.component.html',
  styleUrls: ['./leave-mgmt.component.css']
})
export class LeaveMgmtComponent implements OnInit, AfterViewInit {

  totalRecords: number = 0;
  leaveForm!: FormGroup;
 
  role: string = '';
  isHrOrAdmin: boolean = false;
 
  displayedColumns: string[] = [
    'slNo',
    'from_date',
    'to_date',
    'reason',
    'status'
  ];
 
  dataSource = new MatTableDataSource<LeaveRequest>([]);
 
  constructor(
    private fb: FormBuilder,
    private leaveService: LeaveService,
    private notify: NotificationService,
    private loader: LoadingService,
    private crs: CheckRegistrationService
  ) {}
 
  ngOnInit(): void {
    this.initForm();
 
    this.role = localStorage.getItem('role') || '';
 
    const normalizedRole = this.role.toUpperCase().replace('ROLE_', '');
 
    this.isHrOrAdmin =
      normalizedRole === 'HR' || normalizedRole === 'ADMIN';
 
      this.crs.employeeId$.subscribe(id => {
        if (id) {
          this.loadLeaves();
        }
      });

    this.dataSource.filterPredicate = (row: LeaveRequest, filter: string) => {
      return (
        row.from_date.toLowerCase().includes(filter) ||
        row.to_date.toLowerCase().includes(filter) ||
        row.reason.toLowerCase().includes(filter) ||
        row.status.toLowerCase().includes(filter)
      );
    };
  }

  @ViewChild(MatPaginator) paginator !: MatPaginator;
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }
 
  initForm() {
    this.leaveForm = this.fb.group({
      from_date: ['', Validators.required],
      to_date: ['', Validators.required],
      reason: ['', Validators.required]
    });
  }
 
  getEmpId(): string {
    return localStorage.getItem('employeeId') || '';
  }
 
  onSubmit() {
    if (this.leaveForm.invalid) {
      this.leaveForm.markAllAsTouched();
      this.notify.showWarning('Missing details', 'Please fill the leave dates and reason.');
      return;
    }
 
    const empId = this.getEmpId();
    if (!empId) {
      this.notify.showWarning('Employee ID missing', 'Employee ID was not found for this leave request.');
      return;
    }
 
    const payload = {
      from_date: this.formatDate(this.leaveForm.value.from_date),
      to_date: this.formatDate(this.leaveForm.value.to_date),
      reason: this.leaveForm.value.reason
    };

    const startTime = Date.now();
    this.loader.show();
    this.leaveService.applyLeave(empId, payload)
    .pipe(
      finalize(() => {
        this.loader.hide(startTime);
      })
    )
      .subscribe({
      next: () => {
        this.leaveForm.reset();
        this.notify.showSuccess('Leave applied', 'Your leave request was submitted successfully.');
        this.loadLeaves();
      },
      error: (err) => {
        this.notify.showError(err);
      }
    });
  }
 
  formatDate(date: any): string {
    const d = new Date(date);
    return `${d.getFullYear()}-${('0'+(d.getMonth()+1)).slice(-2)}-${('0'+d.getDate()).slice(-2)}`;
  }
 
  loadLeaves() {
    const empId = this.getEmpId();
    if (!empId) return;

    const startTime = Date.now();
    this.loader.show();
    this.leaveService.getLeavesByEmpId(empId)
    .pipe(
      finalize(() => {
        this.loader.hide(startTime);
      })
    )
      .subscribe({
      next: (res: any) => {
        this.dataSource.data = (res.data || []).map((item: any, i: number) => ({
          ...item,
          slNo: i + 1
        }));
          this.totalRecords = this.dataSource.data.length;
      },
      error: (err) => this.notify.showError(err)
    });
  }
 
  approveLeave(empId: string) {
    if (!this.isHrOrAdmin) {
      this.notify.showWarning('Permission denied', 'Only HR or Admin can approve leave requests.');
      return;
    }

    const startTime = Date.now();
    this.loader.show();
    this.leaveService.updateLeaveStatus(empId, 'APPROVED')
    .pipe(
      finalize(() => {
        this.loader.hide(startTime);
      })
    )
      .subscribe({
        next: () => {
          this.notify.showSuccess('Leave approved', 'The leave request was approved.');
          this.loadLeaves();
        },
        error: (err) => this.notify.showError(err)
      });
  }
 
  rejectLeave(empId: string) {
    if (!this.isHrOrAdmin) {
      this.notify.showWarning('Permission denied', 'Only HR or Admin can reject leave requests.');
      return;
    }

    const startTime = Date.now();
    this.loader.show();
    this.leaveService.updateLeaveStatus(empId, 'REJECTED')
    .pipe(
      finalize(() => {
        this.loader.hide(startTime);
      })
    )
      .subscribe({
        next: () => {
          this.notify.showSuccess('Leave rejected', 'The leave request was rejected.');
          this.loadLeaves();
        },
        error: (err) => this.notify.showError(err)
      });
  }

  onPageChange(event: any): void {
  }

  filterLeaves(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
    this.totalRecords = this.dataSource.filteredData.length;
  }
}
