import { Component } from '@angular/core';
import { AsyncPipe, CurrencyPipe, NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { combineLatest, map, Observable } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';

import { RotaApiService } from '../../services/rota-api.service';
import { UsersApiService, AppUser } from '../../services/users-api.service';
import { RotaShift } from '../../models/rota-shift.model';

interface PayrollRow {
  employeeName: string;
  workedShifts: number;
  dayRate: number;
  totalPay: number;
}

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, RouterLink, MatIconModule, CurrencyPipe],
  templateUrl: './payroll.html',
  styleUrls: ['./payroll.scss']
})
export class PayrollComponent {
  payroll$!: Observable<PayrollRow[]>;
  grandTotal$!: Observable<number>;

  constructor(
    private rotaApi: RotaApiService,
    private usersApi: UsersApiService
  ) {
    this.loadPayroll();
  }

  private loadPayroll(): void {
    this.payroll$ = combineLatest([
      this.rotaApi.getAll(),
      this.usersApi.getAll()
    ]).pipe(
      map(([shifts, users]: [RotaShift[], AppUser[]]) => {
        const today = new Date();
        const weekStart = this.getStartOfWeek(today);
        const weekEnd = this.getEndOfWeek(today);

        const workedThisWeek = shifts.filter((s: RotaShift) => {
          if (s.confirmedWorked !== true) return false;

          const shiftDate = this.parseShiftDate(s.date);
          return shiftDate >= weekStart && shiftDate <= weekEnd;
        });

        const grouped: { [key: string]: PayrollRow } = {};

        for (const shift of workedThisWeek) {
          const employeeName = shift.employeeName?.trim() || 'unknown';
          const key = employeeName.toLowerCase();

          const matchedUser = users.find((u: AppUser) =>
            u.name?.trim().toLowerCase() === key
          );

          const dayRate = Number(matchedUser?.dayRate ?? 0);

          if (!grouped[key]) {
            grouped[key] = {
              employeeName,
              workedShifts: 0,
              dayRate,
              totalPay: 0
            };
          }

          grouped[key].workedShifts += 1;
          grouped[key].totalPay = grouped[key].workedShifts * grouped[key].dayRate;
        }

        return Object.values(grouped).sort((a, b) => b.totalPay - a.totalPay);
      })
    );

    this.grandTotal$ = this.payroll$.pipe(
      map((rows: PayrollRow[]) => rows.reduce((sum, row) => sum + row.totalPay, 0))
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