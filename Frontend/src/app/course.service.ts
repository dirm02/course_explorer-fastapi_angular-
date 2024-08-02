import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';

export interface Course {
  _id: string;
  CourseName: string;
  CourseDescription: string;
  StartDate: string;
  EndDate: string;
  Price: number;
  createdAt: string;
  University: string;
  City: string;
  Country: string;
  Currency: string;
  Length?: number; // Add a Length field
  CurrencySymbol?: string; // Add a CurrencySymbol field
}

export interface University {
  UniversityID: number;
  University: string;
}

export interface City {
  CityID: number;
  City: string;
}

export interface Country {
  CountryID: number;
  Country: string;
}

export interface Currency {
  CurrencyID: number;
  Currency: string;
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  
  private apiUrl = 'https://4b13-83-234-227-37.ngrok-free.app/courses';
  private categoryUrl = 'https://4b13-83-234-227-37.ngrok-free.app/categories'; 
  

  private courses: Course[] = [];
  private countries: Country[] = [];
  private cities: City[] = [];
  private universities: University[] = [];
  private currencies: Currency[] = [];
  
  private currentPage: number = 0;
  private totalPage: number = 0;

  private currencySymbols: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'JPY': '¥',
    'GBP': '£',
    'AUD': 'A$',
    'CAD': 'C$',
    'CHF': 'CHF',
    'CNY': '¥',
    'SEK': 'kr',
    'NZD': 'NZ$',
    'MXN': 'Mex$',  // Mexican Peso
    'SGD': 'S$',   // Singapore Dollar
    'HKD': 'HK$',  // Hong Kong Dollar
    'NOK': 'kr',   // Norwegian Krone
    'KRW': '₩',    // South Korean Won
    'TRY': '₺',    // Turkish Lira
    'RUB': '₽',    // Russian Ruble
    'INR': '₹',    // Indian Rupee
    'BRL': 'R$',   // Brazilian Real
    'ZAR': 'R',    // South African Rand
    'DKK': 'kr',   // Danish Krone
    'PLN': 'zł',   // Polish Zloty
    'THB': '฿',    // Thai Baht
    'MYR': 'RM',   // Malaysian Ringgit
    'IDR': 'Rp',   // Indonesian Rupiah
    'CZK': 'Kč',   // Czech Koruna
    'HUF': 'Ft',   // Hungarian Forint
    'AED': 'د.إ',  // United Arab Emirates Dirham
    'SAR': '﷼',    // Saudi Riyal
    'ILS': '₪',    // Israeli New Shekel
    'PHP': '₱',    // Philippine Peso
    'COP': 'COL$', // Colombian Peso
    'CLP': 'CLP$', // Chilean Peso
    'PEN': 'S/',   // Peruvian Sol
    'VND': '₫',    // Vietnamese Dong
    'NGN': '₦',    // Nigerian Naira
    'BDT': '৳',    // Bangladeshi Taka
    'PKR': '₨',    // Pakistani Rupee
    'EGP': '£',    // Egyptian Pound
    'KWD': 'KD',   // Kuwaiti Dinar
    'QAR': 'QR',   // Qatari Riyal
    'OMR': 'OMR',  // Omani Rial
    'BHD': 'BD',   // Bahraini Dinar
    'JOD': 'JD',   // Jordanian Dinar
    'LBP': 'ل.ل',  // Lebanese Pound
    'MAD': 'MAD',  // Moroccan Dirham
    'DZD': 'DA',   // Algerian Dinar
    'TND': 'DT',   // Tunisian Dinar
    'LYD': 'LYD',  // Libyan Dinar
    'IQD': 'IQD',  // Iraqi Dinar
    'MZN': 'MT',   // Mozambican Metical
    // Add more currency codes and symbols as needed
  };

  constructor(private http: HttpClient) { }

  getCourses(page: number = 1, query: string = ''): Observable<{ courses: Course[], total_pages: number, current_page: number }> {
    const url = `${this.apiUrl}?page=${page}`;
    
    let params = new HttpParams().set('page', page.toString());
    if (query) {
      params = params.set('query', query);
    }

    return this.http.get<{ courses: Course[], total_pages: number, current_page: number }>(this.apiUrl, { params }).pipe(
      tap(data => {
        this.courses = data.courses.map(course => {
          course.Length = this.calculateLength(course.StartDate, course.EndDate);
          course.CurrencySymbol = this.getCurrencySymbol(course.Currency);
          return course;
        });
      })
    );
  }

  calculateLength(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  getCurrencySymbol(currencyCode: string): string {
    return this.currencySymbols[currencyCode] || currencyCode;
  }

  addCourse(newCourse: any): Observable<any> {
    return this.http.post(this.apiUrl, newCourse).pipe(
      tap(response => {
        console.log('Add response:', response);
        console.log("response---------", response)
      })
    );
  }

  deleteCourse(id: string): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete(url).pipe(
      tap(response => {
        console.log('Delete response:', response);
        this.courses = this.courses.filter(course => course._id !== id);
      })
    );
  }

  getCourseById(id: string): Course | undefined {
    return this.courses.find(course => course._id === id);
  }

  updateCourse(courseId: string, updatedCourse: any): Observable<any> {
    const url = `${this.apiUrl}/${courseId}`;
    console.log(courseId)
    return this.http.put(url, updatedCourse).pipe(
      tap(response => {
        console.log('Update response:', response);
        const index = this.courses.findIndex(course => course._id === courseId);
        if (index !== -1) {
          this.courses[index] = { ...this.courses[index], ...updatedCourse };
        }
      })
    );
  }

  getUniversities(): Observable<University[]> {
    return this.http.get<University[]>(`${this.categoryUrl}/universities`).pipe(
      tap(data => this.universities = data)
    );
  }

  getCities(): Observable<City[]> {
    return this.http.get<City[]>(`${this.categoryUrl}/cities`).pipe(
      tap(data => this.cities = data)
    );
  }

  getCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(`${this.categoryUrl}/countries`).pipe(
      tap(data => this.countries = data)
    );
  }

  getCurrencies(): Observable<Currency[]> {
    return this.http.get<Currency[]>(`${this.categoryUrl}/currencies`).pipe(
      tap(data => this.currencies = data)
    );
  }
  
  getCurrentPage(): number{
    return this.currentPage;
  }

  getTotalPage(): number{
    return this.totalPage;
  }
  
}
