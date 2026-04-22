import { Injectable } from '@angular/core';

export type AppRole = 'admin' | 'employee';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly storageKey = 'lilliput-role';

  getRole(): AppRole {
    const role = localStorage.getItem(this.storageKey);
    return role === 'employee' ? 'employee' : 'admin';
  }

  setRole(role: AppRole): void {
    localStorage.setItem(this.storageKey, role);
  }

  isAdmin(): boolean {
    return this.getRole() === 'admin';
  }

  isEmployee(): boolean {
    return this.getRole() === 'employee';
  }
}