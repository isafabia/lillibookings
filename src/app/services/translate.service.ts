import { Injectable } from '@angular/core';
import { TRANSLATIONS } from '../core/i18n';

@Injectable({
  providedIn: 'root'
})
export class TranslateService {
  private language = localStorage.getItem('language') || 'english';

  get currentLang(): string {
    return this.language;
  }

  setLanguage(lang: string): void {
    this.language = lang;
    localStorage.setItem('language', lang);
  }

  t(key: string): string {
    const translations = TRANSLATIONS[this.language] as Record<string, string>;
    return translations[key] || key;
  }
}