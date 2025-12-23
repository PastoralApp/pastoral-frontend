import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacaoService } from '../../core/services/notificacao.service';
import { Notificacao, NotificacaoNaoLida } from '../../core/models/notificacao.model';

@Component({
  selector: 'app-notificacoes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificacoes.component.html',
  styleUrl: './notificacoes.component.scss'
})
export class NotificacoesComponent implements OnInit {
  private notificacaoService = inject(NotificacaoService);

  notificacoes = signal<Notificacao[]>([]);
  naoLidas = signal<NotificacaoNaoLida[]>([]);
  isLoading = signal(true);
  error = signal('');

  ngOnInit(): void {
    this.loadNotificacoes();
  }

  loadNotificacoes(): void {
    this.isLoading.set(true);
    this.error.set('');

    this.notificacaoService.getNaoLidas().subscribe({
      next: (notificacoes) => {
        this.naoLidas.set(notificacoes);
      }
    });

    this.notificacaoService.getMinhas().subscribe({
      next: (notificacoes) => {
        this.notificacoes.set(notificacoes);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Erro ao carregar notificações');
        this.isLoading.set(false);
      }
    });
  }

  marcarComoLida(notificacao: Notificacao): void {
    if (notificacao.lida) return;

    this.notificacaoService.marcarLida(notificacao.id).subscribe({
      next: () => {
        this.notificacoes.update(list =>
          list.map(n => n.id === notificacao.id ? { ...n, lida: true } : n)
        );
        this.naoLidas.update(list => list.filter(n => n.id !== notificacao.id));
      }
    });
  }

  getIcone(notificacao: Notificacao): string {
    if (notificacao.isGeral) return 'public';
    if (notificacao.grupoId) return 'groups';
    return 'notifications';
  }

  formatDate(date: string): string {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return d.toLocaleDateString('pt-BR');
  }
}
