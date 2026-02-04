import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { tap } from 'rxjs';

export type UserDto = { id: string; email: string };
export type AuthResponse = { user: UserDto; token: string };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'todo_token';
  private readonly userKey = 'todo_user';

  constructor(private http: HttpClient) {}

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  get user(): UserDto | null {
    const raw = localStorage.getItem(this.userKey);
    return raw ? (JSON.parse(raw) as UserDto) : null;
  }

  hasToken(): boolean {
    return (
      !!localStorage.getItem(this.tokenKey) || !!localStorage.getItem('token')
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  findUserByEmail(email: string) {
    const params = new HttpParams().set('email', email);
    return this.http
      .get<AuthResponse>(`${environment.apiBaseUrl}/users`, { params })
      .pipe(tap((r) => this.persist(r)));
  }

  createUser(email: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiBaseUrl}/users`, { email })
      .pipe(tap((r) => this.persist(r)));
  }

  private persist(r: AuthResponse) {
    localStorage.setItem(this.tokenKey, r.token);
    localStorage.setItem(this.userKey, JSON.stringify(r.user));
    localStorage.setItem('token', r.token);
    localStorage.setItem('user', JSON.stringify(r.user));
  }
}
