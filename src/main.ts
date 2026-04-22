import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { provideHttpClient } from '@angular/common/http';

const savedTheme = localStorage.getItem('theme') || 'light';
document.body.classList.remove('light-mode', 'dark-mode');
document.body.classList.add(`${savedTheme}-mode`);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
