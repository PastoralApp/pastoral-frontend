import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <div class="header-content">
        <h1 class="logo">Pastoral App</h1>
        <div class="header-actions">
          <button class="theme-toggle" (click)="toggleTheme()">
            {{ themeService.theme() === 'pa' ? 'PA' : 'PJ' }}
          </button>
          @if (authService.user(); as user) {
            <div class="user-info">
              <span class="user-name">{{ user.name }}</span>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  themeService = inject(ThemeService);
  authService = inject(AuthService);

  toggleTheme(): void {
    const newTheme = this.themeService.theme() === 'pa' ? 'pj' : 'pa';
    this.themeService.setTheme(newTheme);
  }
}
