import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NotificacaoService } from '../../../core/services/notificacao.service';
import { GrupoService } from '../../../core/services/grupo.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../shared/services/toast.service';
import { Grupo } from '../../../core/models/grupo.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-enviar-notificacao-coord',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './enviar-notificacao-coord.component.html',
  styleUrl: './enviar-notificacao-coord.component.scss'
})
export class EnviarNotificacaoCoordComponent implements OnInit {
  private notificacaoService = inject(NotificacaoService);
  private grupoService = inject(GrupoService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  grupos = signal<Grupo[]>([]);
  usuarios = signal<User[]>([]);
  isLoading = signal(false);

  tipoDestino = signal<'grupo' | 'pessoa'>('grupo');
  grupoId = signal<string | null>(null);
  usuarioId = signal<string | null>(null);
  titulo = signal('');
  mensagem = signal('');
  
  coordenadorName = signal('');

  ngOnInit(): void {
    this.loadData();
    this.loadCoordenadorName();
  }

  loadData(): void {
    Promise.all([
      this.grupoService.getAll().toPromise(),
      this.userService.getAll().toPromise()
    ]).then(([grupos, usuarios]) => {
      this.grupos.set(grupos || []);
      this.usuarios.set(usuarios || []);
    });
  }

  loadCoordenadorName(): void {
    const currentUser = this.authService.currentUser();
    if (currentUser) {
      this.coordenadorName.set(currentUser.name);
    }
  }

  onTipoDestinoChange(tipo: 'grupo' | 'pessoa'): void {
    this.tipoDestino.set(tipo);
    this.grupoId.set(null);
    this.usuarioId.set(null);
  }

  enviarNotificacao(): void {
    if (!this.titulo().trim()) {
      this.toastService.error('O título é obrigatório');
      return;
    }

    if (!this.mensagem().trim()) {
      this.toastService.error('A mensagem é obrigatória');
      return;
    }

    if (this.tipoDestino() === 'grupo' && !this.grupoId()) {
      this.toastService.error('Selecione um grupo');
      return;
    }

    if (this.tipoDestino() === 'pessoa' && !this.usuarioId()) {
      this.toastService.error('Selecione um usuário');
      return;
    }

    this.isLoading.set(true);

    const notificacao = {
      titulo: this.titulo(),
      mensagem: this.mensagem(),
      enviadoPor: this.coordenadorName(),
      tipo: this.tipoDestino(),
      grupoId: this.tipoDestino() === 'grupo' ? this.grupoId() : null,
      usuarioId: this.tipoDestino() === 'pessoa' ? this.usuarioId() : null
    };

    this.notificacaoService.enviar(notificacao).subscribe({
      next: () => {
        this.toastService.success('Notificação enviada com sucesso!');
        this.resetForm();
        this.isLoading.set(false);
      },
      error: (err) => {
        this.toastService.error('Erro ao enviar notificação');
        this.isLoading.set(false);
      }
    });
  }

  resetForm(): void {
    this.titulo.set('');
    this.mensagem.set('');
    this.grupoId.set(null);
    this.usuarioId.set(null);
  }

  getGrupoNome(id: string | null): string {
    if (!id) return '';
    const grupo = this.grupos().find(g => g.id.toString() === id);
    return grupo?.name || '';
  }

  getUsuarioNome(id: string | null): string {
    if (!id) return '';
    const usuario = this.usuarios().find(u => u.id.toString() === id);
    return usuario?.name || '';
  }
}
