import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CardComponent } from '../../shared/components/card/card.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, CardComponent],
  template: `
    <div class="profile-container">
      @if (authService.user(); as user) {
        <app-card [elevated]="true" class="profile-header">
          <div class="avatar-large">
            {{ user.name.charAt(0) }}
          </div>
          <h1 class="user-name">{{ user.name }}</h1>
          <span class="pastoral-badge" [attr.data-pastoral]="user.pastoral">
            {{ user.pastoral }}
          </span>
          <span class="role-badge">{{ getRoleLabel(user.role) }}</span>
        </app-card>

        <app-card [elevated]="true" class="profile-section">
          <h2 class="section-title">Informações Pessoais</h2>
          <div class="info-list">
            <div class="info-item">
              <span class="info-label">E-mail</span>
              <span class="info-value">{{ user.email }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Telefone</span>
              <span class="info-value">{{ user.phone }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Membro desde</span>
              <span class="info-value">{{ formatDate(user.joinDate) }}</span>
            </div>
          </div>
        </app-card>

        <app-card [elevated]="true" class="profile-section">
          <h2 class="section-title">Meus Grupos</h2>
          <div class="groups-list">
            @for (group of user.groups; track group) {
              <div class="group-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>{{ group }}</span>
              </div>
            }
          </div>
        </app-card>

        <button class="logout-btn" (click)="logout()">
          Sair
        </button>
      }
    </div>
  `,
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      'user': 'Membro',
      'group_coordinator': 'Coordenador de Grupo',
      'general_coordinator': 'Coordenador Geral'
    };
    return labels[role] || role;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
