import { AfterViewInit, ViewChild, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

// Material and Shared UI Imports
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { PageLayoutComponent, SearchBarComponent } from '@shared/ui';
import { TableComponent } from '@shared';

// External Library and Services
import Chart from 'chart.js/auto';
import { EmployeeService, LoadingService } from '@core/services';

@Component({
  selector: 'app-employees-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatTableModule,
    PageLayoutComponent,
    TableComponent,
    SearchBarComponent
  ],
  templateUrl: './employees-details.component.html',
  styleUrls: ['./employees-details.component.css']
})
export class EmployeesDetailsComponent implements OnInit, AfterViewInit {

  chart: any;

  defaultColumnWidths: { [key: string]: number } = {
    slNo:100,
    name: 180,
    designation: 180,
    emp_type: 180,
    gender: 130,
    joining_date: 170,
    phone: 180,
    email: 250
  };

  displayedColumns: string[] = [
    'slNo',
    'name',
    'designation',
    'emp_type',
    'gender',
    'joining_date',
    'phone',
    'email'
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  dataSource = new MatTableDataSource<any>([]);
  departments: string[] = [
    'BUSINESS',
    'IT',
    'WEBDEV',
    'AI',
    'MOBILEDEV',
    'IOSDEV'
  ];
  selectedDepartment: string = 'ALL';
  totalRecords: number = 0;

  constructor(
    private employeeService: EmployeeService,
    private loader: LoadingService
  ) { }

  ngOnInit(): void {
    this.loadEmployees(0, 5);
    this.loadChartData();

    this.dataSource.filterPredicate = (row: any, filter: string) => {
      return (
        row.name?.toLowerCase().includes(filter) ||
        row.email?.toLowerCase().includes(filter) ||
        row.designation?.toLowerCase().includes(filter) ||
        row.gender?.toLowerCase().includes(filter) ||
        row.emp_type?.toLowerCase().includes(filter)
      );
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadEmployees(offset: number, limit: number): void {
    const startTime = Date.now();
    this.loader.show();
    this.employeeService
      .getEmployeeData(this.selectedDepartment, offset, limit)
      .pipe(
        finalize(() => {
          this.loader.hide(startTime);
        })
      )
      .subscribe({
        next: (result: any) => {
          const rows = (result.data || []).map((res: any, index: number) => ({
            slNo: offset + index + 1,
            name: `${res?.first_name ?? ''} ${res?.last_name ?? ''}`.trim(),
            designation: res?.jobDetails?.designation ?? '',
            emp_type: res?.jobDetails?.employee_type ?? '',
            gender: res?.gender ?? '',
            joining_date: this.formatDate(res?.jobDetails?.joining_date) ?? '',
            department: res?.jobDetails?.department ?? '',
            phone: res?.phone ?? '',
            email: res?.additionalInfo?.email ?? ''
          }));

          this.dataSource.data = rows;
          this.totalRecords = this.dataSource.filteredData.length;
        },
        error: (err) => {
          // If the API throws no data/404, we MUST explicitly wipe the table
          this.dataSource.data = [];
          this.totalRecords = 0;
        }
      });
  }

  filterByDepartment(dept: string): void {
    this.selectedDepartment = dept;
    this.loadEmployees(0, 5);
  }

  onPageChange(event: any): void {
    const offset = event.pageIndex * event.pageSize;
    const limit = event.pageSize;

    this.loadEmployees(offset, limit);
  }

  loadChartData(): void {
    const startTime = Date.now();
    this.loader.show();
    this.employeeService.getAllEmployees()
    .pipe(
      finalize(() => {
        this.loader.hide(startTime);
      })
    )
      .subscribe((result: any) => {
   
      const employees = result.data || [];
      const deptCount: any = {};
   
      employees.forEach((emp: any) => {
        const dept = emp?.jobDetails?.department;

        if (
          dept === 'IT' ||
          dept === 'AI' ||
          dept === 'WEBDEV' ||
          dept === 'BUSINESS' ||
          dept === 'IOSDEV' ||
          dept === 'MOBILEDEV') {
            deptCount[dept] = (deptCount[dept] || 0) + 1;
        }
      });

      const labels = Object.keys(deptCount);
      const values = Object.values(deptCount) as number[];
   
      this.renderChart(labels, values);
    });
  }
   
  renderChart(labels: string[], data: number[]): void {
    if (this.chart) {
      this.chart.destroy();
    }
   
    this.chart = new Chart('deptChart', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Employees per Department',
            data: data,
            // barThickness: 100
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  }

  filterEmployees(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
    this.totalRecords = this.dataSource.filteredData.length;
  }

  formatDate(date: string): string {
    if (!date) return '';
  
    const d = new Date(date);
    const day = d.toLocaleDateString('en-US', {weekday: 'long'});
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
  
    return `${dd}-${mm}-${yyyy} [${day}]`;
  }
}
