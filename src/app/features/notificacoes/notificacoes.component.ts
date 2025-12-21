import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificacaoService } from '../../core/services/notificacao.service';
import { Notificacao } from '../../core/models/notificacao.model';

@Component({
  selector: 'app-notificacoes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notificacoes.component.html',
  styleUrls: ['./notificacoes.component.scss']
})
export class NotificacoesComponent implements OnInit {
  notificacoes: Notificacao[] = [];
  naoLidas: Notificacao[] = [];
  loading = true;
  showOnlyUnread = false;

  constructor(private notificacaoService: NotificacaoService) {}

  ngOnInit(): void {
    this.loadNotificacoes();
  }

  loadNotificacoes(): void {
    this.loading = true;
    this.notificacaoService.getMinhasNotificacoes().subscribe({
      next: (data) => {
        this.notificacoes = data;
        this.naoLidas = data.filter(n => !n.lida);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar notificações:', error);
        this.loading = false;
      }
    });
  }

  marcarComoLida(notificacao: Notificacao): void {
    if (!notificacao.lida) {
      this.notificacaoService.marcarComoLida(notificacao.id).subscribe({
        next: () => {
          notificacao.lida = true;
          this.naoLidas = this.notificacoes.filter(n => !n.lida);
        },
        error: (error) => console.error('Erro ao marcar como lida:', error)
      });
    }
  }

  toggleFilter(): void {
    this.showOnlyUnread = !this.showOnlyUnread;
  }

  get filteredNotificacoes(): Notificacao[] {
    return this.showOnlyUnread 
      ? this.notificacoes.filter(n => !n.lida)
      : this.notificacoes;
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return 'Agora';
    if (hours < 24) return `${hours}h atrás`;
    if (days === 1) return 'Ontem';
    if (days < 7) return `${days} dias atrás`;

    return d.toLocaleDateString('pt-BR');
  }
}
