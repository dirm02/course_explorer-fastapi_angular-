import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { University, City, Country, CourseService, Currency } from '../course.service';

@Component({
  selector: 'app-add-course',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    HttpClientModule
  ],
  templateUrl: './add-course.component.html',
  styleUrls: ['./add-course.component.scss']
})
export class AddCourseComponent {
  courseForm: FormGroup;

  universities: University[] = [];
  countries: Country[] = [];
  cities: City[] = [];
  currencies: Currency[] = [];
  currencySymbols: String[] = [];

  filteredUniversities: Observable<University[]>;
  filteredCountries: Observable<Country[]>;
  filteredCities: Observable<City[]>;

  constructor(private courseService: CourseService, private router: Router) {
    this.courseForm = new FormGroup({
      courseName: new FormControl(''),
      university: new FormControl(''),
      country: new FormControl(''),
      city: new FormControl(''),
      price: new FormControl(0),
      currency: new FormControl(''),
      startDate: new FormControl(''),
      endDate: new FormControl(''),
      description: new FormControl('')
    });

    this.filteredUniversities = this.courseForm.controls['university'].valueChanges.pipe(
      startWith(''),
      map(value => this._filterUniversities(value))
    );

    this.filteredCountries = this.courseForm.controls['country'].valueChanges.pipe(
      startWith(''),
      map(value => this._filterCountries(value))
    );

    this.filteredCities = this.courseForm.controls['city'].valueChanges.pipe(
      startWith(''),
      map(value => this._filterCities(value))
    );

    this.courseService.getUniversities().subscribe(
      data => {
        if (data) this.universities = data;
        else console.error('Universities data is null or undefined');
      },
      error => {
        console.error('Error fetching universities:', error);
      }
    );

    this.courseService.getCities().subscribe(
      data => {
        if (data) this.cities = data;
        else console.error('Cities data is null or undefined');
      },
      error => {
        console.error('Error fetching cities:', error);
      }
    );

    this.courseService.getCountries().subscribe(
      data => {
        if (data) this.countries = data;
        else console.error('Countries data is null or undefined');
      },
      error => {
        console.error('Error fetching countries:', error);
      }
    );

    this.courseService.getCurrencies().subscribe(
      data => {
        if (data) {
          this.currencies = data; 
          this.currencies.map(currency => this.currencySymbols.push(currency.Currency))
        }
        else console.error('Countries data is null or undefined');
      },
      error => {
        console.error('Error fetching countries:', error);
      }
    );
  }

  private _filterUniversities(value: string): University[] {
    const filterValue = value.toLowerCase();
    return this.universities.filter(university => university.University.toLowerCase().includes(filterValue));
  }

  private _filterCountries(value: string): Country[] {
    const filterValue = value.toLowerCase();
    return this.countries.filter(country => country.Country.toLowerCase().includes(filterValue));
  }

  private _filterCities(value: string): City[] {
    const filterValue = value.toLowerCase();
    return this.cities.filter(city => city.City.toLowerCase().includes(filterValue));
  }

  private formatDate(date: any): string {
    const d = new Date(date);
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();

    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
  }

  saveCourse() {
    const newCourse = {
      CourseName: this.courseForm.value.courseName,
      CourseDescription: this.courseForm.value.description,
      StartDate: this.formatDate(this.courseForm.value.startDate),
      EndDate: this.formatDate(this.courseForm.value.endDate),
      Price: this.courseForm.value.price,
      CurrencyID: this.courseForm.value.currency,
      UniversityID: this.universities.find(u => u.University === this.courseForm.value.university)?.UniversityID,
      CountryID: this.countries.find(c => c.Country === this.courseForm.value.country)?.CountryID,
      CityID: this.cities.find(c => c.City === this.courseForm.value.city)?.CityID,
    };
    console.log("new course: ", newCourse)

    this.courseService.addCourse(newCourse).subscribe(
      response => {
        console.log('Course saved successfully:', response);
        this.router.navigate(['/']); // Navigate to the home page
      },
      error => {
        console.error('Error saving course:', error);
      }
    );

    this.router.navigate(['/']); // Navigate to the home page
  }

  cancel() {
    console.log('Course addition canceled');
    this.router.navigate(['/']); // Navigate to the home page
  }
}
