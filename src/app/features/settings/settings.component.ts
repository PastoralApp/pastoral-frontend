import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);

  showLogoutConfirm = signal(false);

  get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  get currentUser() {
    return this.authService.currentUser();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  openLogoutConfirm(): void {
    this.showLogoutConfirm.set(true);
  }

  closeLogoutConfirm(): void {
    this.showLogoutConfirm.set(false);
  }

  logout(): void {
    this.authService.logout();
  }

  goToProfile(): void {
    this.router.navigate(['/perfil']);
  }
}
