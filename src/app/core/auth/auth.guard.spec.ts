import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { authGuard } from './auth.guard';

describe('authGuard (CanMatch)', () => {
  it('debe permitir acceso si hay token', () => {
    const auth = { hasToken: () => true } as AuthService;
    const router = { parseUrl: (u: string) => u } as unknown as Router;

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: router },
      ],
    });

    const result = TestBed.runInInjectionContext(() =>
      authGuard(null as any, null as any),
    );

    expect(result).toBeTrue();
  });
});
