import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; // Standard Angular directives (ngIf, ngFor)
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { finalize, switchMap } from 'rxjs/operators';

// Existing Service and Validator Imports
import { AuthService, CheckRegistrationService, SessionService, NotificationService } from '@core/services';
import { EmailValidator } from '@core/validators';

interface AuthResponse {
  message?: string;
  token?: {
    token?: string;
  };
}

@Component({
  selector: 'app-login',
  standalone: true, // Mark as standalone
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
  ], // Moved from AppModule
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isSubmitting = signal(false);

  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private crs = inject(CheckRegistrationService);
  private session = inject(SessionService);
  private notify = inject(NotificationService);

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, EmailValidator]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onLogin(): void {
    if (this.loginForm.invalid || this.isSubmitting()) {
      this.loginForm.markAllAsTouched();
      this.notify.showWarning('Warning', 'Please complete the form correctly.');
      return;
    }

    const email = this.loginForm.controls.email.value;
    const password = this.loginForm.controls.password.value;
    this.isSubmitting.set(true);

    this.auth.login(email, password)
      .pipe(
        switchMap((res: AuthResponse) => {
          if (res?.message !== 'success') throw res;
          const token = res?.token?.token;
          if (!token) {
            throw { message: 'Token missing from response.' };
          }
          this.session.startSession(token);
          return this.crs.checkRegistrationStatus();
        }),
        finalize(() => {
          this.isSubmitting.set(false);
        })
      )
      .subscribe({
        next: (isRegistered: boolean) => {
          if (isRegistered) {
            this.router.navigate(['/dashboard']);
          } else {
            this.router.navigate(['/emp-basic-regis']);
          }
        },
        error: (err) => {
          this.notify.showError(err);
        }
      });
  }
}