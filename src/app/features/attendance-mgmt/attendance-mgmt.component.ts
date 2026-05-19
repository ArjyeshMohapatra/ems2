import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Material and Shared UI Imports
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PageLayoutComponent, SearchBarComponent } from '@shared/ui';
import { TableComponent } from '@shared';

// Logic and Service Imports
import { AttendanceService, NotificationService, LoadingService, CheckRegistrationService } from '@core/services';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-attendance-mgmt',
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
  templateUrl: './attendance-mgmt.component.html',
  styleUrls: ['./attendance-mgmt.component.css']
})
  
export class AttendanceMgmtComponent implements OnInit{

  totalRecords: number = 0;
  totalPresent: number = 0;
  totalAbsent: number = 0;
  allAttendance: any[] = [];
  // totalLeaves: number = 0;
  // totalWFH: number = 0;

  displayedColumns: string[] = [
    'slNo',
    'date',
    'firstIn',
    'lastOut',
    'actualWorkTime',
    'status'
  ];

  selectedMonth: string = '';
  months: string[] = [];
  selectedStatus: string = 'All Status';
  status: string[] = [
    'All Status',
    'Present',
    'Absent',
    // 'Leave',
    // 'WFH'
  ];

  dataSource = new MatTableDataSource<any>([]);

  constructor(
    private attendanceService: AttendanceService,
    private notify: NotificationService,
    private loader: LoadingService,
    private crs: CheckRegistrationService
  ) { }
  
  ngOnInit(): void {
    this.crs.employeeId$.subscribe(id => {
      if (id) {
        this.loadAttendance(0, 5);
      }
    });
    this.dataSource.filterPredicate = (row: any, filter: string) => {
      return (
        row.date?.toLowerCase().includes(filter) ||
        row.status?.toLowerCase().includes(filter) ||
        row.actualWorkTime?.toLowerCase().includes(filter)
      );
    };

    this.createDate();
  }

  checkIn(): void {
    const employeeId = localStorage.getItem('employeeId');
  
    if (!employeeId) return;

    const startTime = Date.now();
    this.loader.show();
    this.attendanceService.checkIn(employeeId)
    .pipe(
      finalize(() => {
        this.loader.hide(startTime);
      })
    )
      .subscribe({
        next: (res) => {
          if (res?.status === 'fail') {
            this.notify.showMessage('Fail', res?.message);
            return;
          }
          this.loadAttendance(0,5);
        },
  
        error: (err) => {
          this.notify.showError(err);
        }
      });
  }

  checkOut(): void {
    const employeeId = localStorage.getItem('employeeId');
    if (!employeeId) return;
  
    if (!this.dataSource?.data[0]?.firstIn) {
      this.notify.showWarning('Warning', 'Please check in first');
      return;
    }

    const startTime = Date.now();
    this.loader.show()
    this.attendanceService.checkOut(employeeId)
    .pipe(
      finalize(() => {
        this.loader.hide(startTime);
      })
    )
  .subscribe({
    next: (res) => {
      if (res.status === 'fail') {
        this.notify.showMessage('Fail', res?.message);
        return;
      }
      this.loadAttendance(0,5);
    },

    error: (err) => {
      this.notify.showError(err);
    }
  });
  }

  calculateWorkTime(inTime: string, outTime: string): string {
    const inDate = new Date(inTime);
    const outDate = new Date(outTime);
  
    const minutes = (outDate.getTime() - inDate.getTime()) / 60000;

    if (minutes > 540) {
      return `9.00 hrs`;
    }

    if (minutes < 60) {
      return `${Math.floor(minutes)} mins`;
    }
  
    return `${(minutes / 60).toFixed(2)} hrs`;
  }

  getToday(): string {
    const d = new Date();
    const day = d.toLocaleDateString('en-US', { weekday: 'long' });
    const date = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${date}-${month}-${year} [${day}]`;
  }

  formatDate(date: string): string {
    const d = new Date(date);
  
    const day = d.toLocaleDateString('en-US', {weekday: 'long'});
  
    const dd =
      String(d.getDate()).padStart(2, '0');
  
    const mm =
      String(d.getMonth() + 1).padStart(2, '0');
  
    const yyyy =
      d.getFullYear();  
  
    return `${dd}-${mm}-${yyyy} [${day}]`;
  }

  formatTime(time: string): string {
    return new Date(time).toLocaleTimeString('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  }

  onPageChange(event: any): void {
    const offset =
      event.pageIndex * event.pageSize;
  
    const limit =
      event.pageSize;
  
    this.loadAttendance(offset, limit);
  }

  loadAttendance(offset: number, limit: number): void {
    const employeeId = localStorage.getItem('employeeId');
  
    if (!employeeId) return;

    const startTime = Date.now();
    this.loader.show();
    this.attendanceService.getAttendance(employeeId, limit, offset)
    .pipe(
      finalize(() => {
        this.loader.hide(startTime);
      })
    )
      .subscribe(res => {

        this.totalRecords = res.data.length;
  
        const rows = (res.data || []).reverse().map((item: any, index: number) => ({
              
              slNo: offset + index + 1,
  
              date: this.formatDate(item.date),
  
              firstIn: item.in_time ? this.formatTime(item.in_time) : '',
  
              lastOut: item.out_time ? this.formatTime(item.out_time) : '',
  
          actualWorkTime: item.in_time && item.out_time ?
            this.calculateWorkTime(item.in_time, item.out_time) :
            (item.in_time && new Date(item.in_time).toDateString() !== new Date().toDateString() ?
              '9.00 hrs' : ''),
  
              status: item.status === 1 ? 'Present' : item.status === 2 ? 'Leave' : item.status === 3 ? 'WFH' : 'Absent'
            })
        );
        
        this.totalPresent = res.data.filter((row: any) => row.status === 1).length;
        this.totalAbsent = res.data.filter((row: any) => row.status === 0).length;
        // this.totalLeave = res.data.filter((row: any) => row.status === 2).length;
        // this.totalWFH = res.data.filter((row: any) => row.status === 3).length;

        this.allAttendance = rows;
        this.dataSource.data = rows;
        this.addTodayRow();
        this.applyFilters();
      });
  }

  addTodayRow(): void {
    const today = this.getToday();
  
    const exists =
      this.dataSource.data.some(row => row.date === today);
  
    if (!exists) {
      this.dataSource.data.unshift({
        date: today,
        firstIn: '',
        lastOut: '',
        actualWorkTime: 'NA',
        status: 'Absent'
      });
    }
  
      this.dataSource.data = this.dataSource.data.map((row, index) => ({
        ...row,
        slNo: index + 1
      }));
    
      this.totalRecords = this.dataSource.data.length;
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  filterAttendance(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
  }

  sortAttendance(): void {
    this.dataSource.data.sort((a, b) => {
      const first = new Date(
        a.date.split(' ')[0].split('-').reverse().join('-')
      ).getTime();
  
      const second = new Date(
        b.date.split(' ')[0].split('-').reverse().join('-')
      ).getTime();
  
      return second - first;
    });
  
    this.dataSource.data = this.dataSource.data.map((row, index) => ({
      ...row,
      slNo: index + 1
    }));
  
    this.totalRecords = this.dataSource.data.length;
  }

  onMonthChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let rows = [...this.allAttendance];
  
    if (this.selectedMonth !== 'All') {
      const monthMap: any = {
        Jan: '01',
        Feb: '02',
        Mar: '03',
        Apr: '04',
        May: '05',
        Jun: '06',
        Jul: '07',
        Aug: '08',
        Sep: '09',
        Oct: '10',
        Nov: '11',
        Dec: '12'
      };
  
      const month =
        this.selectedMonth.split('-')[0];
  
      const year =
        this.selectedMonth.split('-')[1];
  
      const monthNumber =
        monthMap[month];
  
      rows = rows.filter(row =>
        row.date.includes(`-${monthNumber}-${year}`)
      );
    }
  
    if (this.selectedStatus !== 'All Status') {
      rows = rows.filter(row =>
        row.status === this.selectedStatus
      );
    }
  
    this.dataSource.data = rows;
    this.totalRecords = rows.length;
  
    this.totalPresent =
      rows.filter(row => row.status === 'Present').length;
  
    this.totalAbsent =
      rows.filter(row => row.status === 'Absent').length;
  
    this.sortAttendance();
  }

  createDate(): void {
    this.months.push('All');
  
    const now = new Date();
  
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
  
      const month = d.toLocaleString('en-US', { month: 'short' }) + '-' + d.getFullYear();
  
      this.months.push(month);
  
      if (i === 0) this.selectedMonth = month;
    }
  }
}