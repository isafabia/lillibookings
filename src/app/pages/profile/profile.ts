import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { TranslateService } from '../../services/translate.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgIf, RouterLink],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
})
export class ProfileComponent {
  user: any = null;
  currentTheme = localStorage.getItem('theme') || 'light';

  constructor(
    private router: Router,
    public translate: TranslateService
  ) {
    this.loadUser();
    this.applyTheme(this.currentTheme);
  }

  get currentLanguage(): string {
    return this.translate.currentLang;
  }

  private loadUser(): void {
    const savedUser = localStorage.getItem('user');

    if (!savedUser) {
      this.router.navigate(['/login']);
      return;
    }

    this.user = JSON.parse(savedUser);
  }

  private applyTheme(theme: string): void {
    document.body.classList.remove('light-mode', 'dark-mode');
    document.body.classList.add(`${theme}-mode`);
  }

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.currentTheme);
    this.applyTheme(this.currentTheme);
  }

  setLanguage(language: string): void {
    this.translate.setLanguage(language);
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('selectedBooking');
    this.router.navigate(['/login']);
  }
}