import { AbstractControl, ValidationErrors } from "@angular/forms";

export function EmailValidator(control: AbstractControl): ValidationErrors | null{
    const value = control.value;
    if (!value) return null;
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(value)) return { invalidEmail: true };
    return null;
}