import { AbstractControl, ValidationErrors } from "@angular/forms";

export function PasswordValidator(control: AbstractControl): ValidationErrors | null{
    const value = control.value;
    if (!value) return null;
    const pattern = /.*[A-Z].*[A-Z]|.*[a-z].*[z-z]|.*\d.*\d|.*[^A-Za-z0-9].*[A-Za-z0-9].*/;
    if (!pattern.test(value)) return { invalidPassword: true };
    return null;
}