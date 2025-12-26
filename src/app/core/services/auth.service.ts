import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import {
  LoginDto,
  LoginResponse,
  GoogleLoginDto,
  GoogleLoginResponse,
  GoogleLoginExistingResponse,
  GoogleCompleteDto,
  GoogleCompleteResponse,
  AuthUser,
  SendCodeDto,
  SendCodeResponse,
  RegisterDto,
  RegisterResponse,
  ResendCodeDto,
  ResendCodeResponse
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  private currentUserSubject = new BehaviorSubject<AuthUser | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();
  public currentUser = signal<AuthUser | null>(this.getStoredUser());

  private isAuthenticatedSignal = signal<boolean>(this.hasToken());
  public isAuthenticated = this.isAuthenticatedSignal.asReadonly();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  login(data: LoginDto): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/login`, data).pipe(
      tap(response => this.handleAuthSuccess(response.token, response.user))
    );
  }

  googleLogin(data: GoogleLoginDto): Observable<GoogleLoginResponse> {
    return this.http.post<GoogleLoginResponse>(`${this.API_URL}/google`, data).pipe(
      tap(response => {
        if (!response.requiresCompletion) {
          const existingResponse = response as GoogleLoginExistingResponse;
          this.handleAuthSuccess(existingResponse.token, existingResponse.user);
        }
      })
    );
  }

  googleComplete(data: GoogleCompleteDto): Observable<GoogleCompleteResponse> {
    return this.http.post<GoogleCompleteResponse>(`${this.API_URL}/google/complete`, data).pipe(
      tap(response => this.handleAuthSuccess(response.token, response.user))
    );
  }

  sendVerificationCode(data: SendCodeDto): Observable<SendCodeResponse> {
    return this.http.post<SendCodeResponse>(`${this.API_URL}/register/send-code`, data);
  }

  register(data: RegisterDto): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.API_URL}/register`, data).pipe(
      tap(response => this.handleAuthSuccess(response.token, response.user))
    );
  }

  resendVerificationCode(data: ResendCodeDto): Observable<ResendCodeResponse> {
    return this.http.post<ResendCodeResponse>(`${this.API_URL}/resend-verification-code`, data);
  }

  getGoogleLoginUrl(): string {
    return `${this.API_URL}/google-login`;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.currentUser.set(null);
    this.isAuthenticatedSignal.set(false);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  getCurrentUserId(): string {
    return this.currentUserSubject.value?.id || '';
  }

  loadUserFromToken(): void {
    const user = this.getStoredUser();
    if (user) {
      this.currentUserSubject.next(user);
      this.currentUser.set(user);
      this.isAuthenticatedSignal.set(true);
    }
  }

  hasRole(roleName: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === roleName;
  }

  hasAnyRole(roleNames: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roleNames.includes(user.role) : false;
  }

  loginWithToken(token: string): void {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const user: AuthUser = {
        id: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload.sub,
        name: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || payload.name,
        email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || payload.email,
        photoUrl: payload['photo_url'],
        role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role
      };
      this.handleAuthSuccess(token, user);
    } catch (e) {
      console.error('Erro ao decodificar token:', e);
    }
  }

  private handleAuthSuccess(token: string, user: AuthUser): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.currentUser.set(user);
    this.isAuthenticatedSignal.set(true);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredUser(): AuthUser | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }
}
