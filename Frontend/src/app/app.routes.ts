import { Routes } from '@angular/router';
import { CourseListComponent } from './course-list/course-list.component';
import { AddCourseComponent } from './add-course/add-course.component';
import { EditCourseComponent } from './edit-course/edit-course.component';

export const routes: Routes = [
  { path: '', component: CourseListComponent },
  { path: 'add', component: AddCourseComponent },
  { path: 'edit/:id', component: EditCourseComponent }
  // Add other routes here if needed
];
