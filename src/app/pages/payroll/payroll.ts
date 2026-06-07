import { Component } from '@angular/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { map, Observable } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';

import { RotaApiService } from '../../services/rota-api.service';
import { RotaShift } from '../../models/rota-shift.model';

interface PayrollRow {
  employeeName: string;
  daysWorked: number;
  fullDays: number;
  birthdayParties: number;
}

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, RouterLink, MatIconModule],
  templateUrl: './payroll.html',
  styleUrls: ['./payroll.scss']
})
export class PayrollComponent {
  payroll$!: Observable<PayrollRow[]>;
  totalDaysWorked$!: Observable<number>;

  constructor(private rotaApi: RotaApiService) {
    this.loadPayroll();
  }

  private loadPayroll(): void {
    this.payroll$ = this.rotaApi.getAll().pipe(
      map((shifts: RotaShift[]) => {
        const today = new Date();
        const weekStart = this.getStartOfWeek(today);
        const weekEnd = this.getEndOfWeek(today);

        // only count shifts marked as worked this week
        const workedThisWeek = shifts.filter((s: RotaShift) => {
          if (s.confirmedWorked !== true) return false;

          const shiftDate = this.parseShiftDate(s.date);
          return shiftDate >= weekStart && shiftDate <= weekEnd;
        });

        const grouped: { [key: string]: PayrollRow } = {};

        for (const shift of workedThisWeek) {
          const employeeName = shift.employeeName?.trim() || 'unknown';
          const key = employeeName.toLowerCase();

          if (!grouped[key]) {
            grouped[key] = {
              employeeName,
              daysWorked: 0,
              fullDays: 0,
              birthdayParties: 0
            };
          }

          grouped[key].daysWorked += 1;

          if (this.isBirthdayParty(shift.assignmentType)) {
            grouped[key].birthdayParties += 1;
          } else {
            grouped[key].fullDays += 1;
          }
        }

        return Object.values(grouped).sort((a, b) => b.daysWorked - a.daysWorked);
      })
    );

    this.totalDaysWorked$ = this.payroll$.pipe(
      map((rows: PayrollRow[]) => rows.reduce((sum, row) => sum + row.daysWorked, 0))
    );
  }

  private isBirthdayParty(value: string | null | undefined): boolean {
    const type = (value ?? '').trim().toLowerCase();

    return (
      type.includes('birthday') ||
      type.includes('party')
    );
  }

  private parseShiftDate(value: string): Date {
    const datePart = value.includes('T') ? value.split('T')[0] : value;
    const [y, m, d] = datePart.split('-').map(Number);
    return new Date(y, m - 1, d);
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private getEndOfWeek(date: Date): Date {
    const start = this.getStartOfWeek(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return end;
  }
}