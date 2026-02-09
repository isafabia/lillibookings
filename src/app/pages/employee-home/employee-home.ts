import { Component } from '@angular/core';
import { AsyncPipe, NgClass, NgFor, NgIf, DatePipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { RotaService } from '../../services/rota.service';
import { RotaShift } from '../../models/rota-shift.model';

@Component({
  selector: 'app-employee-home',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    NgClass,
    AsyncPipe,
    DatePipe,
    RouterLink,
    RouterLinkActive,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './employee-home.html',
  styleUrl: './employee-home.scss',
})
export class EmployeeHomeComponent {
  view: 'today' | 'tomorrow' = 'today';

  shifts$!: Observable<RotaShift[]>;
  preview$!: Observable<RotaShift[]>;

  constructor(private rotaService: RotaService) {
    this.shifts$ = this.rotaService.shifts$;

    // preview list (filtered + max 3 items)
    this.preview$ = this.shifts$.pipe(
      map((items: RotaShift[]) =>
        items
          .filter(s => this.isInSelectedDay(s.date))
          .slice(0, 3)
      )
    );
  }

  setView(v: 'today' | 'tomorrow'): void {
    this.view = v;

    this.preview$ = this.shifts$.pipe(
      map((items: RotaShift[]) =>
        items
          .filter(s => this.isInSelectedDay(s.date))
          .slice(0, 3)
      )
    );
  }

  get dayLabel(): string {
    return this.view === 'today' ? 'today' : 'tomorrow';
  }

  private isInSelectedDay(isoDate: string): boolean {
    const shiftDay = this.stripTime(new Date(isoDate));

    const base = new Date();
    if (this.view === 'tomorrow') base.setDate(base.getDate() + 1);

    const selectedDay = this.stripTime(base);
    return shiftDay.getTime() === selectedDay.getTime();
  }

  private stripTime(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
}