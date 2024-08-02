import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { Course, CourseService } from '../course.service';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatTooltipModule, HttpClientModule, FormsModule],
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.scss']
})
export class CourseListComponent implements OnInit {
  courses: Course[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 0;
  searchQuery: string = '';

  constructor(private courseService: CourseService, private router: Router) { }

  ngOnInit(): void {
    this.loadCourses(this.currentPage);
  }

  loadCourses(page: number): void {
    this.courseService.getCourses(page, this.searchQuery).subscribe(
      data => {
        if (data) {
          this.courses = data.courses;
          this.totalPages = data.total_pages;
          this.currentPage = data.current_page;
        } else {
          console.error('Course data is null or undefined');
        }
      },
      error => {
        console.error('Error fetching courses:', error);
      }
    );
  }

  searchCourses(): void {
    this.loadCourses(1); // Reset to first page on new search
  }

  editCourse(course: Course): void {
    if (course && course._id) {
      this.router.navigate(['/edit', course._id]);
    } else {
      console.error('Invalid course data:', course);
    }
  }

  deleteCourse(course: Course): void {
    if (course && course._id) {
      this.courseService.deleteCourse(course._id).subscribe(
        response => {
          console.log('Course deleted successfully:', response);
          this.loadCourses(this.currentPage); // Reload the courses list
        },
        error => console.error('Error deleting course:', error)
      );
    } else {
      console.error('Invalid course data:', course);
    }
  }

  changePage(page: number): void {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadCourses(page);
    }
  }

  getPaginationRange(): number[] {
    const range: number[] = [];
    const delta = 2;
    const left = Math.max(2, this.currentPage - delta);
    const right = Math.min(this.totalPages - 1, this.currentPage + delta);

    range.push(1);
    if (left > 2) {
      range.push(-1);
    }
    for (let i = left; i <= right; i++) {
      range.push(i);
    }
    if (right < this.totalPages - 1) {
      range.push(-1);
    }
    if (this.totalPages > 1) {
      range.push(this.totalPages);
    }

    return range;
  }
}
