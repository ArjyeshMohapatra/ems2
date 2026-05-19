import { Pipe, PipeTransform } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

@Pipe({
  name: 'errorMsg',
  standalone: true
})
export class ErrorMsgPipe implements PipeTransform {
  transform(errors: ValidationErrors | null | undefined, label: string): string {
    if (!errors) return '';

    const errorMessages: Record<string, string> = {
      required: `${label} is required`,
      pattern: `Invalid format for ${label}.`,
      invalidPhoneNumber: 'Please enter a valid phone number.',
      invalidAadharNumber: 'Aadhar must be 12 digits.',
      scriptDetected: 'Special characters/scripts are not allowed.',
      invalidSalary: 'Enter a valid salary amount.',
      invalidEmail: 'Please enter a valid email id.',
      invalidPassword: 'Please enter a valid password.'
    };

    for (const key in errors) {
      if (errorMessages[key]) return errorMessages[key];
    }
    
    return 'Invalid input';
  }
}