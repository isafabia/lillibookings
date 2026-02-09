import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <mat-card style="margin:16px">
      <h2>profile</h2>
      <p>login / user settings will go here</p>
    </mat-card>
  `,
})
export class ProfileComponent {}