import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormArray } from '@angular/forms';
import { debounceTime, tap, switchMap } from 'rxjs';
import { CountriesService } from 'src/app/services/countries.service';
import { CustomErrorStateMatcher } from 'src/app/helpers/customErrorStateMatcher';
import { CitiesService } from 'src/app/services/cities.service';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css'],
})
export class BookingComponent implements OnInit {
  countries: any;
  formGroup: FormGroup;
  customErrorStateMatcher: CustomErrorStateMatcher =
    new CustomErrorStateMatcher();
  cities: any[] = [];
  isCitiesLoading: boolean = false;
  hobbies: any[] = [
    { id: 1, hobbyName: 'Music' },
    { id: 2, hobbyName: 'Travel' },
    { id: 3, hobbyName: 'Dance' },
    { id: 4, hobbyName: 'Eat' },
    { id: 5, hobbyName: 'Watch' },
  ];

  constructor(
    private countriesService: CountriesService,
    private citiesService: CitiesService
  ) {
    this.formGroup = new FormGroup({
      email: new FormControl(null, [Validators.required, Validators.email]),
      customerName: new FormControl(null, [
        Validators.required,
        Validators.maxLength(30),
        Validators.pattern('^[A-Za-z. ]*$'),
      ]),
      country: new FormControl(null, Validators.required),
      city: new FormControl(null),
      receiveNewsLetters: new FormControl(null),
      hobbies: new FormArray([]),
      allHobbies: new FormControl(false),
    });

    //add form controls to form array
    this.hobbies.forEach(() => {
      this.hobbiesFormArray.push(new FormControl(false));
    });
  }

  get hobbiesFormArray(): FormArray {
    return this.formGroup.get('hobbies') as FormArray;
  }

  //returns the form control from form array based on the index
  hobbiesFormArrayControl(i: number): FormControl {
    return this.hobbiesFormArray.controls[i] as FormControl;
  }

  onAllHobbiesCheckBoxChange() {
    this.hobbiesFormArray.controls.forEach((hobby, index) => {
      this.hobbiesFormArray
        .at(index)
        .patchValue(this.formGroup.value.allHobbies);
    });
  }

  // returns true if all hobby checkboxes are checked
  allHobbiesSelected() {
    return this.hobbiesFormArray.value.every((val: boolean) => val === true);
  }

  // returns true if all hobby checkboxes are unchecked
  noHobbiesSelected() {
    return this.hobbiesFormArray.value.every((val: boolean) => val === false);
  }

  onHobbyChange(i: any) {
    if (this.allHobbiesSelected())
      this.formGroup.patchValue({ allHobbies: true });
    else this.formGroup.patchValue({ allHobbies: false });
  }

  ngOnInit(): void {
    // Fetch countries data
    this.countriesService.getCountries().subscribe(
      (response) => {
        this.countries = response;
      },
      (error) => {
        console.log(error);
      }
    );

    // Fetch cities data
    // this.citiesService.getCities().subscribe(
    //   (response) => {
    //     this.cities = response;
    //   },
    //   (error) => {
    //     console.log(error);
    //   }
    // );

    // Fetch cities data based on search text
    this.getFormControl('city')
      .valueChanges.pipe(
        //debounceTime: waits for atleast 500ms after typing in textbox
        debounceTime(500),

        //tap: do something before making http request
        tap(() => {
          this.cities = [];
          this.isCitiesLoading = true;
        }),

        //switchMap: fetch data based on search text(value)
        switchMap((value) => {
          return this.citiesService.getCities(value);
        })
      )
      .subscribe((response) => {
        this.cities = response;
        this.isCitiesLoading = false;
      });
  }

  //returns the form control instance based on the control name
  getFormControl(controlName: string): FormControl {
    return this.formGroup.get(controlName) as FormControl;
  }

  //returns the error message based on the given control and error
  getErrorMessage(controlName: string, errorType: string): string {
    switch (controlName) {
      case 'customerName': {
        if (errorType === 'required')
          return 'You must specify <strong>Name</strong>';
        else if (errorType === 'maxlength')
          return '<strong>Name</strong> can contain up to 30 characters only';
        else if (errorType === 'pattern')
          return '<strong>Name</strong> can contain alphabets or dot(.) or space only';
        else return '';
      }

      case 'email': {
        if (errorType === 'required')
          return "<strong>Email</strong> can't be blank";
        else if (errorType === 'email')
          return '<strong>Email</strong> shoul be in correct format e.g. someone@example.com';
        else return '';
      }

      case 'country': {
        if (errorType === 'required')
          return 'You must choose a <strong>Country</strong>';
        else return '';
      }

      default:
        return '';
    }
  }
}
