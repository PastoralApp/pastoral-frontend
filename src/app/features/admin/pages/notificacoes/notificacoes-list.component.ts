import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificacaoService } from '../../../../core/services/notificacao.service';
import { Notificacao } from '../../../../core/models/notificacao.model';

@Component({
  selector: 'app-notificacoes-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './notificacoes-list.component.html',
  styleUrl: './notificacoes-list.component.scss'
})
export class NotificacoesListComponent implements OnInit {
  private notificacaoService = inject(NotificacaoService);

  notificacoes = signal<Notificacao[]>([]);
  searchTerm = '';
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  filteredNotificacoes = computed(() => {
    const term = this.searchTerm.toLowerCase();
    if (!term) return this.notificacoes();
    return this.notificacoes().filter(n => 
      n.titulo.toLowerCase().includes(term) ||
      n.mensagem.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.loadNotificacoes();
  }

  loadNotificacoes(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    
    this.notificacaoService.getAllAdmin().subscribe({
      next: (data) => {
        this.notificacoes.set(data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar notificações:', error);
        this.errorMessage.set('Erro ao carregar notificações. Tente novamente.');
        this.isLoading.set(false);
      }
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
  }

  toggleStatus(notif: Notificacao): void {
    const action = notif.isAtiva 
      ? this.notificacaoService.desativar(notif.id)
      : this.notificacaoService.ativar(notif.id);

    action.subscribe({
      next: () => {
        this.notificacoes.update(list => 
          list.map(n => n.id === notif.id ? { ...n, isAtiva: !n.isAtiva } : n)
        );
      },
      error: (error) => {
        console.error('Erro ao alterar status da notificação:', error);
        this.errorMessage.set('Erro ao alterar status da notificação. Tente novamente.');
      }
    });
  }

  delete(notif: Notificacao): void {
    if (confirm(`Deseja realmente excluir a notificação "${notif.titulo}"?`)) {
      this.notificacaoService.delete(notif.id).subscribe({
        next: () => {
          this.notificacoes.update(list => list.filter(n => n.id !== notif.id));
        },
        error: (error) => {
          console.error('Erro ao excluir notificação:', error);
          this.errorMessage.set('Erro ao excluir notificação. Tente novamente.');
        }
      });
    }
  }
}
