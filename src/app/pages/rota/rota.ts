import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rota',
  standalone: true,
  template: '',
})
export class RotaComponent {
  constructor(private router: Router) {
    this.router.navigate(['/rota/admin']);
  }
}
