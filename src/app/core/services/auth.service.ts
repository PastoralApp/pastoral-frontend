import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '../models/user.model';
import { AuthResponse, LoginRequest, GoogleLoginRequest } from '../models/auth.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  constructor(private http: HttpClient) {
    const storedUser = this.getUserFromToken();
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser);
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  public getApiUrl(): string {
    return environment.apiUrl;
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.token) {
            localStorage.setItem('token', response.token);
            this.currentUserSubject.next(response.user);
          }
        })
      );
  }

  loginWithGoogle(request: GoogleLoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/google`, request)
      .pipe(
        tap(response => {
          if (response.token) {
            localStorage.setItem('token', response.token);
            this.currentUserSubject.next(response.user);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  loadUserFromToken(): void {
    const user = this.getUserFromToken();
    this.currentUserSubject.next(user);
  }

  private getUserFromToken(): User | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.nameid || payload.sub,
        name: payload.unique_name || payload.name,
        email: payload.email,
        roleId: payload.RoleId,
        role: {
          id: payload.RoleId,
          name: payload.role,
          type: parseInt(payload.role) || 0,
          description: ''
        }
      } as User;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.currentUserValue !== null && !!localStorage.getItem('token');
  }
}
