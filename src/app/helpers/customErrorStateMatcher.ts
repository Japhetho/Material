import { FormControl, FormGroupDirective } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

export class CustomErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | null) {
    return form &&
      control &&
      control.invalid &&
      (control.dirty || control.touched || form.submitted)
      ? true
      : false;
  }
}
