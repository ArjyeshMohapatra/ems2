import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Replaces CommonModule from the module file
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Services
import { EmployeeService, NotificationService, CheckRegistrationService } from '@core/services';

// Custom Form Validators
import { AadharValidator, PhoneValidator, SalaryValidator } from '@core/validators';

@Component({
  selector: 'app-emp-basic-details',
  standalone: true, // Mark as standalone
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ], // Dependencies directly provided here
  templateUrl: './emp-basic-details.component.html',
  styleUrls: ['./emp-basic-details.component.css']
})
export class EmpBasicDetailsComponent {

  empForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private employeeService: EmployeeService,
    private notify: NotificationService,
    private crs : CheckRegistrationService
  ) {

    this.empForm = this.fb.group({

      // employee details
      employee: this.fb.group({
        first_name: ['', Validators.required],
        last_name: ['', Validators.required],
        phone: ['', [Validators.required, PhoneValidator]],
        date_of_birth: ['', Validators.required],
        gender: ['', Validators.required],
      }),

      // employee's personal details
      employeeDetails: this.fb.group({
        address: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        country: ['India'],
        pincode: ['', Validators.required],
        emergency_contact: ['', [Validators.required, PhoneValidator]],
        marital_status: ['', Validators.required],
        aadhar_no: ['', [Validators.required, AadharValidator]],
        father_name: ['', Validators.required],
        mother_name: ['', Validators.required],
      }),

      // job details
      jobDetails: this.fb.group({
        designation: ['', Validators.required],
        department: ['', Validators.required],
        salary: ['', [Validators.required, SalaryValidator]],
        joining_date: ['', Validators.required],
        employee_type: ['', Validators.required],
        status: ['ACTIVE'],
        skills: [''],
        prev_org: [''],
        experience_duration: ['', Validators.required]
      })

    });
  }

  onSubmit() {
    this.empForm.markAllAsTouched();

    if (this.empForm.invalid) {
      this.notify.showWarning('Missing details', 'Please fill all required fields.');
      return;
    }

    const formValue = this.empForm.value;

    // conversion of comma separated values into array
    const payload = {
      ...formValue,
      jobDetails: {
        ...formValue.jobDetails,
        skills: formValue.jobDetails.skills
          ? formValue.jobDetails.skills.split(',').map((x: string) => x.trim())
          : [],

        prev_org: formValue.jobDetails.prev_org
          ? formValue.jobDetails.prev_org.split(',').map((x: string) => x.trim())
          : []
      }
    };
    this.employeeService.registerEmployee(payload).subscribe({
      next: (res: any) => {
        this.notify.showSuccess('Employee registered', res?.message || 'Employee registered successfully.');

        const empId = res?.data?.employee.id;
        console.log(`Inside Register Employee ${res}`);
        localStorage.setItem('employeeId', empId);

        // 1. Update the service cache so guards permit entry to dashboard
        this.crs.setRegistered();

        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 800);
      },

      error: (err) => {
        if (err.status === 409) {
          this.notify.showWarning('Duplicate employee', 'Employee already exists.');
        } else {
          this.notify.showError(err);
        }
      }
    });
  }

  public get canLeave(): boolean {
    return !this.empForm.dirty || this.empForm.pristine;
  }
}
