import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { TipoPastoral } from '../../../core/models/pastoral.model';
import { AuthUser } from '../../../core/models/auth.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);

  @Input() selectedPastoral: TipoPastoral | null = null;
  @Input() showMobileMenu = false;
  @Output() toggleMobileMenu = new EventEmitter<void>();
  @Output() toggleSidebar = new EventEmitter<void>();

  get currentUser(): AuthUser | null {
    return this.authService.currentUser();
  }

  get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  get userInitial(): string {
    return this.currentUser?.name?.charAt(0).toUpperCase() || '?';
  }

  onToggleTheme(): void {
    this.themeService.toggleTheme();
  }

  onToggleMobileMenu(): void {
    this.toggleMobileMenu.emit();
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  getUserInitials(name: string): string {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }
}
