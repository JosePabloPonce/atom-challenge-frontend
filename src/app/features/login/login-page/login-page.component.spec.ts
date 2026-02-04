import { TestBed } from '@angular/core/testing';
import { LoginPageComponent } from './login-page.component';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';

describe('LoginPageComponent', () => {
  let auth: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', [
      'findUserByEmail',
      'createUser',
    ]);

    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();
  });

  it('debe navegar a /tasks cuando el usuario existe', () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    const comp = fixture.componentInstance;

    auth.findUserByEmail.and.returnValue(
      of({ user: { id: '1', email: 'test@mail.com' }, token: 'x' } as any),
    );

    comp.form.controls.email.setValue('test@mail.com');
    comp.submit();

    expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
  });

  it('si no existe y el usuario cancela el confirm, no navega', () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    const comp = fixture.componentInstance;

    spyOn(window, 'confirm').and.returnValue(false);

    auth.findUserByEmail.and.returnValue(throwError(() => ({ status: 404 })));

    comp.form.controls.email.setValue('new@mail.com');
    comp.submit();

    expect(router.navigate).not.toHaveBeenCalled();
  });
});
