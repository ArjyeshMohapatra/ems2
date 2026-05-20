// src/app/auth/signup/signup.component.ts
import { Component, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; // Standard directives
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { MatFormFieldModule } from "@angular/material/form-field";

// Existing Service and Validator Imports
import { AuthService, NotificationService, EventLoggerService } from '@core/services';
import { EmailValidator } from '@core/validators';

interface AuthResponse {
  success?: boolean;
  message?: string;
}

@Component({
  selector: 'app-sign-up',
  standalone: true, // Mark as standalone
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule
  ], // Moved from the old SignupModule
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignUpComponent implements OnDestroy {
  isSubmitting = signal(false);
  isRedirecting = signal(false);
  private redirectTimerId?: ReturnType<typeof setTimeout>;

  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private notify = inject(NotificationService);
  private logger = inject(EventLoggerService);

  signupForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, EmailValidator]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['', Validators.required]
  });

  ngOnDestroy(): void {
    if (this.redirectTimerId !== undefined) {
      clearTimeout(this.redirectTimerId);
    }
  }

  onSignUp(): void {
    this.logger.log('SignupComponent', 'USER_CLICKED_ON_SIGNUP', {});
    if (this.signupForm.invalid || this.isSubmitting() || this.isRedirecting()) {
      this.signupForm.markAllAsTouched();
      this.logger.log('SignupComponent', 'INCOMPLETE_SUBMISSION', {});
      this.notify.showWarning('Invalid form', 'Please complete the form correctly.');
      return;
    }

    const email = this.signupForm.controls.email.value;
    const password = this.signupForm.controls.password.value;
    const role = this.signupForm.controls.role.value;

    this.isSubmitting.set(true);

    this.auth.signUp(email, password, role)
      .pipe(finalize(() => {
        this.isSubmitting.set(false);
      }))
      .subscribe({
        next: (res: AuthResponse) => {
          this.logger.log('SignupComponent', 'AUTH_RESPONSE_RECEIVED', {result: res});
        if (res?.success) {
          this.notify.showSuccess('Signup successful', 'Redirecting to login...');
          this.isRedirecting.set(true);
          this.logger.log('SignupComponent', 'REDIRECTING_TO_LOGIN', {});
          this.redirectTimerId = setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1200);
          return;
        }
          this.notify.showWarning('Signup failed', res?.message || 'Please try again.');
          this.logger.log('SignupComponent', 'SIGNUP_FAILED', {result: res?.message});
      },
      error: (err) => {
        this.notify.showWarning('Signup unavailable', 'Unable to sign up right now. Please try again.');
        this.logger.log('SignupComponent', 'UNABLE_TO_SIGNUP_TRY_LATER', {err});
      }
    });
  }
}