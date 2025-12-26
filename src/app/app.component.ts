import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';
import { ConfirmationService, ConfirmationRequest, ConfirmationModalComponent, ConfirmationConfig } from './shared/components/confirmation-modal';
import { ToastComponent } from './shared/components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, ConfirmationModalComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  host: {
    'style': 'display: block; min-height: 100vh;'
  }
})
export class AppComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private confirmationService = inject(ConfirmationService);
  private confirmationSub?: Subscription;

  showConfirmationModal = signal(false);
  confirmationConfig = signal<ConfirmationConfig>({
    title: 'Confirmação',
    message: 'Deseja continuar?'
  });
  private currentResolve?: (confirmed: boolean) => void;

  ngOnInit(): void {
    this.authService.loadUserFromToken();
    this.themeService.initTheme();

    this.confirmationSub = this.confirmationService.requests$.subscribe((request: ConfirmationRequest) => {
      this.confirmationConfig.set(request.config);
      this.currentResolve = request.resolve;
      this.showConfirmationModal.set(true);
    });
  }

  ngOnDestroy(): void {
    this.confirmationSub?.unsubscribe();
  }

  onConfirmed(): void {
    this.currentResolve?.(true);
    this.showConfirmationModal.set(false);
  }

  onCancelled(): void {
    this.currentResolve?.(false);
    this.showConfirmationModal.set(false);
  }
}
