import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
selector: 'app-add-booking',
standalone: true,
imports: [
ReactiveFormsModule,
RouterLink,
MatCardModule,
MatButtonModule,
MatFormFieldModule,
MatInputModule,
MatSelectModule,
MatIconModule,
MatDatepickerModule,
MatNativeDateModule,
],
templateUrl: './add-booking.html',
styleUrl: './add-booking.scss',
})
export class AddBookingComponent {
// simple activity list for now (you can change later)
activities = [
'kayaking',
'stand up paddle boarding',
'forest activities',
'rock wall climbing',
];


form: any;
constructor(private fb: FormBuilder) {
this.form = this.fb.group({
groupName: ['', [Validators.required, Validators.minLength(2)]],
date: [null as Date | null, [Validators.required]],
startTime: ['', [Validators.required]],
endTime: ['', [Validators.required]],
activity: ['', [Validators.required]],
kidsCount: [null as number | null, [Validators.required, Validators.min(0)]],
teachersCount: [null as number | null, [Validators.required, Validators.min(0)]],
medicalNotes: [''],
});
}



// later this will call the API
save(): void {
if (this.form.invalid) {
this.form.markAllAsTouched();
return;
}

console.log('booking payload:', this.form.value);
alert('booking saved (demo) ✅');
}
}
