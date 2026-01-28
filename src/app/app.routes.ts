import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import {AddBookingComponent} from './pages/add-booking/add-booking';

export const routes: Routes = [
{path: '',component: HomeComponent,},
{path: 'add-booking', component: AddBookingComponent}
];