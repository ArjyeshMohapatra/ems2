import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common'; // Replaces CommonModule from the old module
import { RouterModule } from '@angular/router'; // Required for routerLink in HTML

// Services
import { AttendanceService, LeaveService, CheckRegistrationService, LoadingService } from '@core/services';

// Shared UI Components/Modules
import { PageLayoutComponent } from '@shared/ui';

@Component({
  selector: 'app-dashboard',
  standalone: true, // Mark as standalone
  imports: [
    CommonModule,
    RouterModule,
    PageLayoutComponent
  ], // Moved from DashboardModule (or your config.ts)
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy{
  dailyWorkTime = '0';
  leaveStatus = 'No Info';
  private timerId: ReturnType<typeof setInterval> | null = null;

  constructor(
    private attendanceService: AttendanceService,
    private leaveService: LeaveService,
    private crs: CheckRegistrationService,
    private loader: LoadingService
  ) { }

  ngOnInit(): void {
    const startTime = Date.now();
    // Wait for the service to provide a valid ID
    this.crs.employeeId$.subscribe(id => {
      if (id) {
        this.loader.show();
        
        this.loadDailyWorkTime();
        this.loadLeaveStatus();

        setTimeout(() => {
          this.loader.hide(startTime);
        }, 1000);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timerId) clearInterval(this.timerId);
  }

  loadLeaveStatus(): void{
    const employeeId = localStorage.getItem('employeeId');
    if (!employeeId) {
      this.leaveStatus = 'No Info';
      return;
    }
    this.leaveService.getLeavesByEmpId(employeeId).subscribe({
      next: (res: any) => {
        const leaves = res?.data || [];
        const latestLeave = leaves[0];
        this.leaveStatus = latestLeave?.status ?? 'No Info';
      },
      error: () => {
        this.leaveStatus = 'No Info';
      }
    })
  }

  loadDailyWorkTime(): void {
    const employeeId = localStorage.getItem('employeeId');
    if (!employeeId) return;

    this.attendanceService.getAttendance(employeeId, 1, 0).subscribe({
      next: (res: any) => {
        const item = res?.data?.[0];

        if (!item?.in_time) {
          this.dailyWorkTime = '0';
          return;
        }

        const updateTime = () => {
          this.dailyWorkTime = this.formatDailyDuration(item.in_time, item.out_time || undefined);
        };

        updateTime();

        if (this.timerId) {
          clearInterval(this.timerId);
          this.timerId = null;
        }

        if (!item.out_time) this.timerId = setInterval(updateTime, 60000);
      },
      error: () => {
        this.dailyWorkTime = '0';
      }
    });
  }

  private formatDailyDuration(start: string, end?: string): string {
    const startDate = new Date(start);
    const startMs = startDate.getTime();
    const endMs = end ? new Date(end).getTime() : Date.now();

    // check if its a new day (reset to 0 after 12 AM if no check-in exist for today)
    const today = new Date();
    if (startDate.toDateString() !== today.toDateString() && !end) {
      if (this.timerId) clearInterval(this.timerId);
      return '0';
    }

    if (isNaN(startMs) || isNaN(endMs)) return '0';

    // calculate duration
    const totalSeconds = Math.max(0, Math.floor((endMs - startMs) / 1000));
    const totalHours = totalSeconds / 3600;

    // auto limit to 9 hrs i.e. auto checkout
    if (totalHours >= 9 && !end) {
      if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
      }

      const empId = localStorage.getItem('employeeId');
      if (empId) {
        this.attendanceService.checkOut(empId).subscribe(() => {
          this.loadDailyWorkTime(); // Refresh UI with actual database values
        });
      }
      
      return '9 hrs 0 mins (Auto-Ended)';
    }

    if (totalSeconds < 60) {
      return `${totalSeconds} sec`;
    }

    const totalMinutes = Math.floor(totalSeconds / 60);
    if (totalMinutes < 60) {
      return `${totalMinutes} mins`;
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return minutes > 0 ? `${hours} hrs ${minutes} mins` : `${hours} hrs`;
  }
}
