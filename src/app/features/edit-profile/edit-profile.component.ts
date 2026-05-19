import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';

// Material and Shared UI Imports
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from "@angular/material/form-field";
import { PageLayoutComponent } from '@shared/ui';
import { ErrorControlComponent } from '@shared';
import { ErrorMsgPipe } from '@core/pipes';

// Logic and Service Imports
import { NotificationService, EmployeeService, LoadingService, CheckRegistrationService } from '@core/services';
import { Subscription, finalize } from 'rxjs';

// Custom Validators
import { PhoneValidator, ScriptValidator, AadharValidator, SalaryValidator } from '@core/validators';

export interface EmployeeProfileForm{
  employee: FormGroup<{
    first_name: FormControl<string | null>;
    last_name: FormControl<string | null>;
    phone: FormControl<string | null>;
    date_of_birth: FormControl<string | null>;
    gender: FormControl<string | null>;
  }>;
  employeeDetails: FormGroup<{
    address: FormControl<string | null>;
    city: FormControl<string | null>;
    state: FormControl<string | null>;
    country: FormControl<string | null>;
    pincode: FormControl<string | null>;
    emergency_contact: FormControl<string | null>;
    marital_status: FormControl<string | null>;
    aadhar_no: FormControl<string | null>;
    father_name: FormControl<string | null>;
    mother_name: FormControl<string | null>;
  }>;
  jobDetails: FormGroup<{
    designation: FormControl<string | null>;
    department: FormControl<string | null>;
    employee_type: FormControl<string | null>;
    salary: FormControl<string | null>;
    joining_date: FormControl<string | null>;
    experience_duration: FormControl<string | null>;
    skills: FormControl<string | null>;
    prev_org: FormControl<string | null>;
  }>;
}

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PageLayoutComponent,
    ErrorControlComponent,
    ErrorMsgPipe,
    MatButtonModule,
    MatFormFieldModule
  ],
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent implements OnInit, OnDestroy {
 
  editForm!: FormGroup<EmployeeProfileForm>
  employeeId!: string;
  isEditing: boolean = false;
  hasChanges: boolean = false;
  isApplying: boolean = false;
  activeSection: 'employee' | 'employeeDetails' | 'jobDetails' = 'employee';

  private originalFormValue = '';
  private formChanges?: Subscription;
 
  constructor(
    private fb: FormBuilder,
    private empService: EmployeeService,
    private notify: NotificationService,
    private loader: LoadingService,
    private crs: CheckRegistrationService
  ) {}
 
  ngOnInit(): void {
    this.initForm();
    
    // Use the reactive stream instead of manual localStorage check
    this.crs.employeeId$.subscribe(id => {
      if (id) {
        this.employeeId = id;
        this.loadEmployeeData();
      } else {
        this.notify.showWarning('Employee ID missing', 'Waiting for user profile...');
      }
    });
  }
  
  ngOnDestroy(): void {
    this.formChanges?.unsubscribe();
  }
 
  // ---------------- FORM ----------------
  initForm() {
    this.editForm = this.fb.group<EmployeeProfileForm>({
      employee: this.fb.group({
        first_name: ['', [Validators.required,ScriptValidator]],
        last_name: ['', [Validators.required, ScriptValidator]],
        phone: ['', [Validators.required,PhoneValidator]],
        date_of_birth: ['', Validators.required],
        gender: ['', Validators.required]
      }),
      employeeDetails: this.fb.group({
        address: ['', [Validators.required, ScriptValidator]],
        city: ['', [Validators.required, ScriptValidator]],
        state: ['', [Validators.required, ScriptValidator]],
        country: ['', [Validators.required, ScriptValidator]],
        pincode: [''],
        emergency_contact: ['', [Validators.required, PhoneValidator]],
        marital_status: ['', Validators.required],
        aadhar_no: ['', [Validators.required, AadharValidator]],
        father_name: ['',Validators.required],
        mother_name: ['', Validators.required]
      }),
      jobDetails: this.fb.group({
        designation: ['', ScriptValidator],
        department: ['', Validators.required],
        employee_type: ['', Validators.required],
        salary: ['', [Validators.required, SalaryValidator]],
        joining_date: ['', Validators.required],
        experience_duration: ['', Validators.required],
        skills: ['', Validators.required],
        prev_org: ['', Validators.required]
      })
    });

    this.editForm.disable();
    this.formChanges = this.editForm.valueChanges.subscribe(() => {
      this.hasChanges = this.serializeFormValue() !== this.originalFormValue;
    });
  }
 
  // ---------------- LOAD DATA ----------------
  loadEmployeeData() {
    const startTime = Date.now();
    this.loader.show();
    this.empService.getEmployeeById(this.employeeId)
    .pipe(
      finalize(() => {
        this.loader.hide(startTime);
      })
    )
      .subscribe({
      next: (res: any) => {
 
        const data = res.data;
 
        this.employeeId = data.employee.id;
 
        this.editForm.patchValue({
          employee: {
            ...data.employee,
            date_of_birth: this.formatDate(data.employee.date_of_birth)
          },
          employeeDetails: data.employeeDetails,
          jobDetails: {
            ...data.jobDetails,
            joining_date: this.formatDate(data.jobDetails.joining_date),
 
            skills: data.jobDetails.skills?.join(', '),
 
            prev_org: data.jobDetails.prev_org
              ?.map((x: any) => x.company)
              .join(', ')
          }
        });

        this.originalFormValue = this.serializeFormValue();
        this.hasChanges = false;
        this.isEditing = false;
        this.isApplying = false;
        this.editForm.disable();
      },
      error: (err) => {
        this.isApplying = false;
        this.notify.showError(err);
      }
    });
  }
 
  // ---------------- DATE FORMAT ----------------
  formatDate(date: string) {
    return date ? date.split('T')[0] : '';
  }

  enableEditing(): void {
    this.isEditing = true;
    this.hasChanges = false;
    this.originalFormValue = this.serializeFormValue();
    this.editForm.enable();
  }

  selectSection(section: 'employee' | 'employeeDetails' | 'jobDetails'): void {
    this.activeSection = section;
  }

  get canApply(): boolean {
    return this.isEditing && this.hasChanges && !this.isApplying;
  }
 
  // ---------------- UPDATE ----------------
  onUpdate() {
    if (!this.canApply) return;

    this.isApplying = true;
 
    const form = this.editForm.getRawValue();
 
    const payload = {
      employee: {
        ...form.employee
      },
 
      employeeDetails: {
        ...form.employeeDetails
      },
 
      jobDetails: {
        ...form.jobDetails,
 
        skills: form.jobDetails.skills
          ? form.jobDetails.skills.split(',').map((s: string) => s.trim())
          : [],
 
        prev_org: form.jobDetails.prev_org
          ? form.jobDetails.prev_org.split(',').map((c: string) => ({
              company: c.trim(),
              years: 0
            }))
          : []
      }
    };

    const startTime = Date.now();
    this.loader.show();
    this.empService.updateEmployee(this.employeeId, payload)
    .pipe(
      finalize(() => {
        this.loader.hide(startTime);
      })
    )
      .subscribe({
      next: () => {
          setTimeout(() => {
            this.notify.showSuccess('Profile updated', 'Your profile changes were applied successfully.');
        }, 1000);
        this.loadEmployeeData();
      },
      error: (err) => {
        this.isApplying = false;
        this.notify.showError(err);
      }
    });
  }

  private serializeFormValue(): string {
    return JSON.stringify(this.editForm.getRawValue());
  }

  get employeeGroup() {
    return this.editForm.controls.employee;
  }
  
  get detailsGroup() {
    return this.editForm.controls.employeeDetails;
  }
  
  get jobGroup() {
    return this.editForm.controls.jobDetails;
  }

  public get canLeave(): boolean{
    return !this.hasChanges;
  }
}
