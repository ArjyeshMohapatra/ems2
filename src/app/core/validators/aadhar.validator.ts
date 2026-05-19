import { AbstractControl, ValidationErrors } from "@angular/forms";

export function AadharValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    const pattern = /^\d{12}$/;
    if (!pattern.test(value)) return { invalidAadharNumber: true };
    return null;
}