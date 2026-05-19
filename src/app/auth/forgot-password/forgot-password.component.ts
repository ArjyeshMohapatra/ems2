import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Replaces CommonModule from your module
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  standalone: true, // Mark as standalone
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ], // These were previously in ForgetPasswordModule
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {

  private fb = inject(FormBuilder);
  forgotPasswordForm = this.fb.nonNullable.group({
      email: ['', [Validators.required, Validators.email]]
    });

  onSendLink(): void {
    if (this.forgotPasswordForm.valid) {
      console.log('Sending link to:', this.forgotPasswordForm.controls.email.value);
    }
  }
}