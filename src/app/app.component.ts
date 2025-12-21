import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Navbar],
  template: `
    @if (showLayout()) {
      <app-navbar></app-navbar>
    }

    <main class="main-content" [class.with-navbar]="showLayout()">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #f5f7fa;
    }

    .main-content {
      flex: 1;
      min-height: 100vh;

      &.with-navbar {
        padding-top: 70px;
      }
    }
  `]
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  showLayout(): boolean {
    const publicRoutes = ['/login', '/register'];
    return !publicRoutes.includes(this.router.url);
  }

  ngOnInit(): void {
    // Carregar usuário do localStorage ao iniciar app
    const token = localStorage.getItem('token');
    if (token) {
      this.authService.loadUserFromToken();
    }
  }
}
