import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login';

import { HomeComponent } from './pages/home/home';
import { AddBookingComponent } from './pages/add-booking/add-booking';
import { BookingDetailsComponent } from './pages/booking-details/booking-details';
import { EditBookingComponent } from './pages/edit-booking/edit-booking';

import { BookingsComponent } from './pages/bookings/bookings';

import { RotaComponent } from './pages/rota/rota';
import { RotaAdminComponent } from './pages/rota/admin/rota-admin';
import { RotaEmployeeComponent } from './pages/rota/employee/rota-employee';

import { ProfileComponent } from './pages/profile/profile';
import { EmployeeHomeComponent } from './pages/employee-home/employee-home';

import { DocumentsComponent } from './pages/documents/documents';
import { ProgramsComponent } from './pages/programs/programs';
import { PayrollComponent } from './pages/payroll/payroll';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },

  // admin
  { path: 'home', component: HomeComponent },
  { path: 'payroll', component: PayrollComponent },

  // employee
  { path: 'employee-home', component: EmployeeHomeComponent },

  { path: 'add-booking', component: AddBookingComponent },
  { path: 'booking/:id', component: BookingDetailsComponent },
  { path: 'booking/:id/edit', component: EditBookingComponent },
  { path: 'bookings', component: BookingsComponent },

  { path: 'rota/admin', component: RotaAdminComponent },
  { path: 'rota/employee', component: RotaEmployeeComponent },

  { path: 'profile', component: ProfileComponent },

  { path: 'rota', component: RotaComponent },

  { path: 'documents', component: DocumentsComponent },
  { path: 'programs', component: ProgramsComponent },

  { path: '**', redirectTo: 'login' }
];