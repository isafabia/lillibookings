import { Injectable } from '@angular/core';
import { ProgramItem } from '../models/program.model';

@Injectable({
  providedIn: 'root'
})
export class ProgramService {
  private storageKey = 'lilliput-programs';

  getAll(): ProgramItem[] {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? JSON.parse(raw) : [];
  }

  save(program: ProgramItem): void {
    const existing = this.getAll();
    const updated = [program, ...existing];
    localStorage.setItem(this.storageKey, JSON.stringify(updated));
  }
}