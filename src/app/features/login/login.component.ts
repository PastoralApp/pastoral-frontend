import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1 class="login-title">Pastoral App</h1>
          <p class="login-subtitle">Bem-vindo de volta</p>
        </div>

        <form class="login-form" (ngSubmit)="onLogin()">
          <div class="form-group">
            <label for="email">E-mail</label>
            <input
              id="email"
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Senha</label>
            <input
              id="password"
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            class="login-button"
            [disabled]="loading()"
          >
            {{ loading() ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <div class="theme-selector">
          <p class="theme-label">Selecione sua pastoral:</p>
          <div class="theme-buttons">
            <button
              type="button"
              class="theme-btn"
              [class.active]="themeService.theme() === 'pa'"
              (click)="themeService.setTheme('pa')"
            >
              PA
            </button>
            <button
              type="button"
              class="theme-btn"
              [class.active]="themeService.theme() === 'pj'"
              (click)="themeService.setTheme('pj')"
            >
              PJ
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  themeService = inject(ThemeService);

  email = '';
  password = '';
  loading = signal(false);

  onLogin(): void {
    if (!this.email || !this.password) return;

    this.loading.set(true);
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/feed']);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }
}
