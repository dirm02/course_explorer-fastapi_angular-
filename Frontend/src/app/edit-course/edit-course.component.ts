import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { University, City, Country, Currency, CourseService } from '../course.service';

@Component({
  selector: 'app-edit-course',
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
  templateUrl: './edit-course.component.html',
  styleUrls: ['./edit-course.component.scss']
})
export class EditCourseComponent implements OnInit {
  courseForm: FormGroup;

  universities: University[] = [];
  countries: Country[] = [];
  cities: City[] = [];
  currencies: Currency[] = [];
  currencySymbols: String[] = [];

  filteredUniversities: Observable<string[]>;
  filteredCountries: Observable<string[]>;
  filteredCities: Observable<string[]>;

  editMode = false;
  editCourseId: string | null = null;

  constructor(
    private courseService: CourseService,
    private router: Router,
    private route: ActivatedRoute
  ) {
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
      map(value => this._filter(this.universities.map(u => u.University), value))
    );

    this.filteredCountries = this.courseForm.controls['country'].valueChanges.pipe(
      startWith(''),
      map(value => this._filter(this.countries.map(c => c.Country), value))
    );

    this.filteredCities = this.courseForm.controls['city'].valueChanges.pipe(
      startWith(''),
      map(value => this._filter(this.cities.map(c => c.City), value))
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
          this.currencies.map(currency => this.currencySymbols.push(currency.Currency));
        }
        else console.error('Currencies data is null or undefined');
      },
      error => {
        console.error('Error fetching currencies:', error);
      }
    );
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.editMode = true;
        this.editCourseId = params['id'];
        if (this.editCourseId) {
          this.loadCourseData(this.editCourseId);
        }
      }
    });
  }

  private _filter(options: string[], value: string): string[] {
    const filterValue = value.toLowerCase();
    return options.filter(option => option.toLowerCase().includes(filterValue));
  }

  loadCourseData(courseId: string) {
    const course = this.courseService.getCourseById(courseId);
    if (course) {
      this.courseForm.setValue({
        courseName: course.CourseName,
        university: course.University,
        country: course.Country,
        city: course.City,
        price: course.Price,
        currency: course.Currency,
        startDate: new Date(course.StartDate),
        endDate: new Date(course.EndDate),
        description: course.CourseDescription
      });
    }
  }

  private formatDate(date: any): string {
    const d = new Date(date);
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();

    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
  }
  saveCourse() {
    const courseData = {
      CourseName: this.courseForm.value.courseName,
      CourseDescription: this.courseForm.value.description,
      StartDate: this.formatDate(this.courseForm.value.startDate),
      EndDate: this.formatDate(this.courseForm.value.endDate),
      Price: this.courseForm.value.price,
      CurrencyID: this.currencies.find(c => c.Currency === this.courseForm.value.currency)?.CurrencyID,
      UniversityID: this.universities.find(u => u.University === this.courseForm.value.university)?.UniversityID,
      CountryID: this.countries.find(c => c.Country === this.courseForm.value.country)?.CountryID,
      CityID: this.cities.find(c => c.City === this.courseForm.value.city)?.CityID,
    };

    console.log("new coursedata----", courseData)

    if (this.editMode && this.editCourseId) {
      this.courseService.updateCourse(this.editCourseId, courseData).subscribe(
        response => {
          console.log('Course updated successfully:', response);
          this.router.navigate(['/']);
        },
        error => {
          console.error('Error updating course:', error);
        }
      );
    } else {
      this.courseService.addCourse(courseData).subscribe(
        response => {
          console.log('Course saved successfully:', response);
          this.router.navigate(['/']);
        },
        error => {
          console.error('Error saving course:', error);
        }
      );
    }
  }

  cancel() {
    this.router.navigate(['/']);
  }
}
