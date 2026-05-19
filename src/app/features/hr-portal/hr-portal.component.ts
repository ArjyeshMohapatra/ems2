import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Replaces CommonModule from HRPortalModule
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Material and Shared UI Imports (Moved from HRPortalModule)
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PageLayoutComponent, SearchBarComponent } from '@shared/ui';
import { TableComponent } from '@shared';

// Logic and Service Imports
import { NotificationService, LeaveService, LoadingService } from '@core/services';
import { finalize } from 'rxjs';

interface LeaveRequest {
  id: string;
  employeeName: string;
  from_date: string;
  to_date: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  slNo?: number;
}

@Component({
  selector: 'app-hr-portal',
  standalone: true, // Mark as standalone
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTableModule,
    PageLayoutComponent,
    TableComponent,
    SearchBarComponent
  ], // Dependencies moved from the old module file
  templateUrl: './hr-portal.component.html',
  styleUrls: ['./hr-portal.component.css']
})
export class HRPortalComponent implements OnInit {

  totalRecords: number = 0;
  displayedColumns: string[] = [
    'slNo',
    'employeeName',
    'from_date',
    'to_date',
    'reason',
    'status',
    'action'
  ];

  allLeaves: LeaveRequest[] = [];
  selectedStatus: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING';
  statuses: ('PENDING' | 'APPROVED' | 'REJECTED')[] = [
    'PENDING',
    'APPROVED',
    'REJECTED'
  ];
 
  dataSource = new MatTableDataSource<LeaveRequest>([]);
 
  constructor(
    private leaveService: LeaveService,
    private notify: NotificationService,
    private loader: LoadingService
  ) {}
 
  ngOnInit(): void {
    this.dataSource.filterPredicate = (row: LeaveRequest, filter: string) => {
      return (
        row.employeeName.toLowerCase().includes(filter) ||
        row.from_date.toLowerCase().includes(filter) ||
        row.to_date.toLowerCase().includes(filter) ||
        row.reason.toLowerCase().includes(filter) ||
        row.status.toLowerCase().includes(filter)
      );
    };

    this.leaveService.leaves$.subscribe(leaves => {
      // Transform and update your existing dataSource
      this.dataSource.data = leaves.map((item, index) => ({
        ...item,
        slNo: index + 1
      }));
      this.totalRecords = leaves.length;
    });
    
    this.loadAllLeaves();
  }
 
  loadAllLeaves() {
    const startTime = Date.now();
    this.loader.show();
    this.leaveService.getLeavesByStatus(this.selectedStatus)
    .pipe(
      finalize(() => {
        this.loader.hide(startTime);
      })
    )
      .subscribe({
        next: (res: any) => {
          this.allLeaves = (res.data || []).map(
            (item: any, index: number) => ({
              ...item,
              slNo: index + 1
            })
          );
  
          this.dataSource.data = this.allLeaves;
          this.totalRecords = this.allLeaves.length;
        },
        error: (err) => this.notify.showError(err)
      });
  }
 
  approveLeave(leaveId: string) {
    const startTime = Date.now();
    this.loader.show();
    this.leaveService.updateLeaveStatus(leaveId, 'APPROVED')
    .pipe(
      finalize(() => {
        this.loader.hide(startTime);
      })
    )
      .subscribe({
        next: () => {
          this.notify.showSuccess('Leave approved', 'The leave request was approved.');
          this.loadAllLeaves();
          this.leaveService.refreshState();
        },
        error: (err) => this.notify.showError(err)
      });
  }
 
  rejectLeave(leaveId: string) {
    const startTime = Date.now();
    this.loader.show();
    this.leaveService.updateLeaveStatus(leaveId, 'REJECTED')
    .pipe(
      finalize(() => {
        this.loader.hide(startTime);
      })
    )
      .subscribe({
        next: () => {
          this.notify.showSuccess('Leave rejected', 'The leave request was rejected.');
          this.loadAllLeaves();
          this.leaveService.refreshState(); 
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

  filterByStatus(value: string): void {
    this.selectedStatus =
      value as 'PENDING' | 'APPROVED' | 'REJECTED';
  
    this.loadAllLeaves();
  }
}
