import { Component, inject, OnInit, OnDestroy, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificacaoService } from '../../core/services/notificacao.service';
import { SignalRService } from '../../core/services/signal-r.service';
import { AuthService } from '../../core/services/auth.service';
import { Notificacao, NotificacaoNaoLida } from '../../core/models/notificacao.model';
import { ToastService } from '../../shared/services/toast.service';

@Component({
  selector: 'app-notificacoes',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notificacoes.component.html',
  styleUrl: './notificacoes.component.scss'
})
export class NotificacoesComponent implements OnInit, OnDestroy {
  private notificacaoService = inject(NotificacaoService);
  private signalRService = inject(SignalRService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  notificacoes = signal<Notificacao[]>([]);
  naoLidas = signal<NotificacaoNaoLida[]>([]);
  isLoading = signal(true);
  isConnected = signal(false);
  
  // Permissões
  isAdmin = computed(() => this.authService.hasRole('Administrador'));
  isCoordenadorGeral = computed(() => this.authService.hasRole('Coordenador Geral'));
  isCoordenadorGrupo = computed(() => this.authService.hasRole('Coordenador de Grupo'));
  
  // Pode enviar notificação se for Admin, Coord Geral ou Coord Grupo
  canSendNotification = computed(() => 
    this.isAdmin() || this.isCoordenadorGeral() || this.isCoordenadorGrupo()
  );

  constructor() {
    // Monitorar notificações em tempo real
    effect(() => {
      const novaNotificacao = this.signalRService.novaNotificacao();
      if (novaNotificacao) {
        this.handleNovaNotificacao(novaNotificacao);
      }
    });

    // Monitorar conexão SignalR
    effect(() => {
      this.isConnected.set(this.signalRService.isConnected());
    });
  }

  ngOnInit(): void {
    this.loadNotificacoes();
    this.setupSignalR();
  }

  private setupSignalR(): void {
    this.signalRService.connect().catch((err) => {
      console.error('Erro ao conectar SignalR:', err);
    });
  }

  private handleNovaNotificacao(notificacao: Notificacao): void {
    // Adiciona a nova notificação à lista
    this.notificacoes.update(list => [notificacao, ...list]);
    
    // Adiciona às não lidas se não tiver sido lida
    if (!notificacao.lida) {
      this.naoLidas.update(list => [
        {
          id: notificacao.id,
          titulo: notificacao.titulo,
          mensagem: notificacao.mensagem,
          dataEnvio: notificacao.dataEnvio,
          lida: false
        },
        ...list
      ]);
    }
  }

  ngOnDestroy(): void {
    this.signalRService.disconnect().catch((err) => {
      console.error('Erro ao desconectar SignalR:', err);
    });
  }

  loadNotificacoes(): void {
    this.isLoading.set(true);

    this.notificacaoService.getNaoLidas().subscribe({
      next: (notificacoes) => {
        this.naoLidas.set(notificacoes);
      },
      error: () => {
        this.toastService.error('Erro ao carregar notificações não lidas');
      }
    });

    this.notificacaoService.getMinhas().subscribe({
      next: (notificacoes) => {
        this.notificacoes.set(notificacoes);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.toastService.error('Erro ao carregar notificações');
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
      },
      error: () => {
        this.toastService.error('Erro ao marcar notificação como lida');
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
