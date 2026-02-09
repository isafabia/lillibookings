import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <mat-card style="margin:16px">
      <h2>bookings</h2>
      <p>this page will show all bookings later</p>
    </mat-card>
  `,
})
export class BookingsComponent {}