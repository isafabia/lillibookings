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
import { EmployeesComponent } from './pages/employees/employees';

import { InvoicesComponent } from './pages/invoices/invoices';
import { CreateInvoiceComponent } from './pages/create-invoice/create-invoice';

import { adminGuard } from './guards/admin.guard';
import { employeeGuard } from './guards/employee.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },

  // admin
  { path: 'home', component: HomeComponent, canActivate: [adminGuard] },
  { path: 'payroll', component: PayrollComponent, canActivate: [adminGuard] },
  { path: 'employees', component: EmployeesComponent, canActivate: [adminGuard] },
  { path: 'invoices', component: InvoicesComponent, canActivate: [adminGuard] },
  { path: 'create-invoice/:bookingId', component: CreateInvoiceComponent, canActivate: [adminGuard] },

  // employee
  { path: 'employee-home', component: EmployeeHomeComponent, canActivate: [employeeGuard] },

  // bookings
  { path: 'add-booking', component: AddBookingComponent },
  { path: 'booking/:id', component: BookingDetailsComponent },
  { path: 'booking/:id/edit', component: EditBookingComponent },
  { path: 'bookings', component: BookingsComponent },

  // rota
  { path: 'rota/admin', component: RotaAdminComponent },
  { path: 'rota/employee', component: RotaEmployeeComponent, canActivate: [employeeGuard] },
  { path: 'rota', component: RotaComponent },

  // shared
  { path: 'profile', component: ProfileComponent },
  { path: 'documents', component: DocumentsComponent },
  { path: 'programs', component: ProgramsComponent },

  // fallback must always be last
  { path: '**', redirectTo: 'login' },
];