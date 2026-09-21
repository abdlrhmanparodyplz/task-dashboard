import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Rejects a value that is empty once surrounding whitespace is stripped (`"   "`, tabs, etc.). */
export function notBlankValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value as string | null)?.trim();
    return value ? null : { blank: true };
  };
}

/** Rejects a due date earlier than today — only meaningful for newly created tasks. */
export function notInPastValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const value = new Date(control.value as string | Date);
    value.setHours(0, 0, 0, 0);
    return value < today ? { pastDate: true } : null;
  };
}
