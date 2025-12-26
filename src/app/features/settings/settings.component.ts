import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { ConfirmationService } from '../../shared/components/confirmation-modal';

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
  private confirmationService = inject(ConfirmationService);

  get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  get currentUser() {
    return this.authService.currentUser();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  async logout(): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      title: 'Sair da conta?',
      message: 'Você precisará fazer login novamente para acessar o aplicativo.',
      confirmText: 'Sair',
      cancelText: 'Cancelar',
      type: 'danger',
      icon: 'material-icons logout'
    });

    if (confirmed) {
      this.authService.logout();
    }
  }

  goToProfile(): void {
    this.router.navigate(['/perfil']);
  }
}
