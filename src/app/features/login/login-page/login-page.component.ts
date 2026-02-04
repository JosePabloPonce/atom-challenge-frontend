import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent {
  loading = false;
  errorMsg = '';

  form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {}

  submit() {
    this.errorMsg = '';
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const email = this.form.controls.email.value.trim().toLowerCase();
    this.loading = true;

    this.auth
      .findUserByEmail(email)
      .pipe(
        catchError((err) => {
          if (err?.status === 404) {
            const ok = window.confirm(
              'Este usuario no existe. ¿Deseas crearlo?',
            );
            if (!ok) {
              this.loading = false;
              return of(null);
            }
            return this.auth.createUser(email);
          }

          this.errorMsg = 'Ocurrió un error al iniciar sesión.';
          this.loading = false;
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (!res) return;
        this.loading = false;
        this.router.navigate(['/tasks']);
      });
  }
}
