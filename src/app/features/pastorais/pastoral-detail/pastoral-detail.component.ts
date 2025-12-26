import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PastoralService } from '../../../core/services/pastoral.service';
import { AuthService } from '../../../core/services/auth.service';
import { Pastoral, Grupo } from '../../../core/models/pastoral.model';

@Component({
  selector: 'app-pastoral-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './pastoral-detail.component.html',
  styleUrl: './pastoral-detail.component.scss'
})
export class PastoralDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pastoralService = inject(PastoralService);
  private authService = inject(AuthService);

  pastoral = signal<Pastoral | null>(null);
  isLoading = signal(true);
  error = signal('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPastoral(id);
    } else {
      this.router.navigate(['/pastorais']);
    }
  }

  loadPastoral(id: string): void {
    this.isLoading.set(true);
    this.error.set('');

    this.pastoralService.getById(id).subscribe({
      next: (pastoral) => {
        this.pastoral.set(pastoral);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Pastoral não encontrada');
        this.isLoading.set(false);
      }
    });
  }

  canEdit(): boolean {
    const user = this.authService.currentUser();
    if (!user) return false;
    return user.role === 'Administrador' || user.role === 'Coordenador Geral';
  }

  goBack(): void {
    this.router.navigate(['/pastorais']);
  }

  getTipoPastoralLabel(tipo: string): string {
    const labels: Record<string, string> = {
      'PA': 'Pastoral de Adolescentes',
      'PJ': 'Pastoral da Juventude',
      'Geral': 'Pastoral Geral'
    };
    return labels[tipo] || tipo;
  }

  getTotalMembros(): number {
    const pastoral = this.pastoral();
    if (!pastoral?.grupos) return 0;
    return pastoral.grupos.reduce((total, grupo) => total + (grupo.membersCount || 0), 0);
  }

  getActiveGrupos(): Grupo[] {
    return this.pastoral()?.grupos?.filter(g => g.isActive) || [];
  }
}
