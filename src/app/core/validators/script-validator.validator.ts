import { AbstractControl, ValidationErrors } from "@angular/forms";

export function ScriptValidator(control: AbstractControl): ValidationErrors | null{
    const value = control.value;
    if (!value) return null;
    const pattern = /<[^>]+>|&lt;.*?&gt;/i;
    if (pattern.test(value)) return { scriptDetected: true };
    return null;
}