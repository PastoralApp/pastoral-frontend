import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificacaoService } from '../../../../core/services/notificacao.service';
import { GrupoService } from '../../../../core/services/grupo.service';
import { UserService } from '../../../../core/services/user.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CreateNotificacaoDto, UpdateNotificacaoDto } from '../../../../core/models/notificacao.model';
import { Grupo } from '../../../../core/models/pastoral.model';
import { UserSimple } from '../../../../core/models/user.model';

@Component({
  selector: 'app-notificacao-form',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './notificacao-form.component.html',
  styleUrl: './notificacao-form.component.scss'
})
export class NotificacaoFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notificacaoService = inject(NotificacaoService);
  private grupoService = inject(GrupoService);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  isEditMode = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  
  notificacaoId: string | null = null;
  grupos = signal<Grupo[]>([]);
  usuarios = signal<UserSimple[]>([]);
  
  tipoNotificacao: 'geral' | 'grupo' | 'individual' = 'geral';
  
  notificacao = {
    titulo: '',
    mensagem: '',
    grupoId: '',
    destinatarioId: '',
    sendEmail: false
  };

  ngOnInit(): void {
    this.loadGrupos();
    this.loadUsuarios();
    
    this.notificacaoId = this.route.snapshot.paramMap.get('id');
    if (this.notificacaoId) {
      this.isEditMode.set(true);
      this.loadNotificacao(this.notificacaoId);
    }
  }

  loadGrupos(): void {
    this.grupoService.getAll(false).subscribe({
      next: (data) => {
        this.grupos.set(data);
      },
      error: (error) => {
        console.error('Erro ao carregar grupos:', error);
      }
    });
  }

  loadUsuarios(): void {
    this.userService.getAll().subscribe({
      next: (data) => {
        this.usuarios.set(data);
      },
      error: (error) => {
        console.error('Erro ao carregar usuários:', error);
      }
    });
  }

  onTipoChange(): void {
    this.notificacao.grupoId = '';
    this.notificacao.destinatarioId = '';
  }

  loadNotificacao(id: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    
    this.notificacaoService.getById(id).subscribe({
      next: (notif) => {
        this.notificacao = {
          titulo: notif.titulo,
          mensagem: notif.mensagem,
          grupoId: notif.grupoId || '',
          destinatarioId: notif.destinatarioId || '',
          sendEmail: notif.sendEmail
        };
        
        if (notif.destinatarioId) {
          this.tipoNotificacao = 'individual';
        } else if (notif.grupoId) {
          this.tipoNotificacao = 'grupo';
        } else if (notif.isGeral) {
          this.tipoNotificacao = 'geral';
        }
        
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Erro ao carregar notificação:', error);
        this.errorMessage.set('Erro ao carregar dados da notificação. Tente novamente.');
        this.isLoading.set(false);
      }
    });
  }

  save(): void {
    if (!this.validate()) return;

    this.isSaving.set(true);
    this.errorMessage.set(null);

    if (this.isEditMode() && this.notificacaoId) {
      const updateDto: UpdateNotificacaoDto = {
        titulo: this.notificacao.titulo,
        mensagem: this.notificacao.mensagem
      };

      this.notificacaoService.update(this.notificacaoId, updateDto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/admin/notificacoes']);
        },
        error: (error) => {
          console.error('Erro ao atualizar notificação:', error);
          this.errorMessage.set('Erro ao atualizar notificação. Tente novamente.');
          this.isSaving.set(false);
        }
      });
    } else {
      const currentUser = this.authService.currentUser();
      if (!currentUser) {
        this.errorMessage.set('Usuário não autenticado.');
        this.isSaving.set(false);
        return;
      }

      const createDto: CreateNotificacaoDto = {
        titulo: this.notificacao.titulo,
        mensagem: this.notificacao.mensagem,
        remetenteId: currentUser.id,
        isGeral: this.tipoNotificacao === 'geral',
        sendEmail: this.notificacao.sendEmail,
        grupoId: this.tipoNotificacao === 'grupo' ? this.notificacao.grupoId : undefined,
        destinatarioId: this.tipoNotificacao === 'individual' ? this.notificacao.destinatarioId : undefined
      };

      this.notificacaoService.create(createDto).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/admin/notificacoes']);
        },
        error: (error) => {
          console.error('Erro ao criar notificação:', error);
          this.errorMessage.set('Erro ao cadastrar notificação. Tente novamente.');
          this.isSaving.set(false);
        }
      });
    }
  }

  private validate(): boolean {
    if (!this.notificacao.titulo || !this.notificacao.mensagem) {
      this.errorMessage.set('Preencha todos os campos obrigatórios');
      return false;
    }

    if (this.tipoNotificacao === 'grupo' && !this.notificacao.grupoId) {
      this.errorMessage.set('Selecione um grupo para enviar a notificação');
      return false;
    }

    if (this.tipoNotificacao === 'individual' && !this.notificacao.destinatarioId) {
      this.errorMessage.set('Selecione um usuário para enviar a notificação');
      return false;
    }

    return true;
  }
}
