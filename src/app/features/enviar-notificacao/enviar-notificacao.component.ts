import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificacaoService } from '../../core/services/notificacao.service';
import { UserService } from '../../core/services/user.service';
import { GrupoService } from '../../core/services/grupo.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../shared/services/toast.service';
import { CreateNotificacaoDto } from '../../core/models/notificacao.model';
import { UserSimple, User } from '../../core/models/user.model';
import { Grupo } from '../../core/models/grupo.model';

type DestinatarioTipo = 'individual' | 'grupo' | 'geral';

@Component({
  selector: 'app-enviar-notificacao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './enviar-notificacao.component.html',
  styleUrl: './enviar-notificacao.component.scss'
})
export class EnviarNotificacaoComponent implements OnInit {
  private router = inject(Router);
  private notificacaoService = inject(NotificacaoService);
  private userService = inject(UserService);
  private grupoService = inject(GrupoService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  isLoading = signal(false);
  isSaving = signal(false);
  
  isAdmin = computed(() => this.authService.hasRole('Administrador'));
  isCoordenadorGeral = computed(() => this.authService.hasRole('Coordenador Geral'));
  isCoordenadorGrupo = computed(() => this.authService.hasRole('Coordenador de Grupo'));
  
  usuarios = signal<UserSimple[]>([]);
  usuariosFiltrados = signal<UserSimple[]>([]);
  usuarioSelecionado = signal<UserSimple | null>(null);
  
  grupos = signal<Grupo[]>([]);
  gruposFiltrados = signal<Grupo[]>([]);
  grupoSelecionado = signal<Grupo | null>(null);
  
  currentUserData = signal<User | null>(null);
  
  searchUsuario = '';
  searchGrupo = '';
  
  destinatarioTipo = signal<DestinatarioTipo>('individual');
  
  notificacao = {
    titulo: '',
    mensagem: '',
    sendEmail: false
  };

  ngOnInit(): void {
    this.checkPermissions();
    this.loadCurrentUserData();
    this.loadUsuarios();
    this.loadGrupos();
  }

  checkPermissions(): void {
    if (!this.isAdmin() && !this.isCoordenadorGeral() && !this.isCoordenadorGrupo()) {
      this.toastService.error('Você não tem permissão para enviar notificações');
      this.router.navigate(['/notificacoes']);
    }
    
    // Coord Grupo só pode enviar para grupos
    if (this.isCoordenadorGrupo() && !this.isAdmin() && !this.isCoordenadorGeral()) {
      this.destinatarioTipo.set('grupo');
    }
  }

  loadCurrentUserData(): void {
    this.userService.getMe().subscribe({
      next: (user) => {
        this.currentUserData.set(user);
      },
      error: () => {
        this.toastService.error('Erro ao carregar dados do usuário');
      }
    });
  }

  canUseDestinatarioTipo(tipo: DestinatarioTipo): boolean {
    if (this.isAdmin()) return true;
    if (this.isCoordenadorGeral()) return true; // Coord Geral pode tudo
    if (this.isCoordenadorGrupo()) return tipo === 'grupo'; // Coord Grupo só pode grupo
    return false;
  }

  setDestinatarioTipo(tipo: DestinatarioTipo): void {
    if (this.canUseDestinatarioTipo(tipo)) {
      this.destinatarioTipo.set(tipo);
      this.limparSelecao();
    }
  }

  loadUsuarios(): void {
    this.isLoading.set(true);

    this.userService.getAll().subscribe({
      next: (data) => {
        const currentUser = this.authService.currentUser();
        const usuarios = currentUser 
          ? data.filter(u => u.id !== currentUser.id && u.isActive)
          : data.filter(u => u.isActive);
        
        this.usuarios.set(usuarios);
        this.usuariosFiltrados.set(usuarios);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.toastService.error('Erro ao carregar usuários');
        this.isLoading.set(false);
      }
    });
  }

  loadGrupos(): void {
    this.grupoService.getAll().subscribe({
      next: (data) => {
        const currentUser = this.currentUserData();
        
        if (this.isCoordenadorGrupo() && !this.isAdmin() && !this.isCoordenadorGeral() && currentUser) {
          const meusGruposIds = currentUser.grupos.map(g => g.grupoId);
          const gruposFiltrados = data.filter(g => meusGruposIds.includes(g.id) && g.isActive);
          this.grupos.set(gruposFiltrados);
          this.gruposFiltrados.set(gruposFiltrados);
        } else {
          const gruposAtivos = data.filter(g => g.isActive);
          this.grupos.set(gruposAtivos);
          this.gruposFiltrados.set(gruposAtivos);
        }
      },
      error: () => {
        this.toastService.error('Erro ao carregar grupos');
      }
    });
  }

  onSearchUsuario(term: string): void {
    this.searchUsuario = term;
    
    if (!term.trim()) {
      this.usuariosFiltrados.set(this.usuarios());
      return;
    }

    const termoLower = term.toLowerCase();
    const filtrados = this.usuarios().filter(u => 
      u.name.toLowerCase().includes(termoLower) ||
      u.email.toLowerCase().includes(termoLower)
    );

    this.usuariosFiltrados.set(filtrados);
  }

  onSearchGrupo(term: string): void {
    this.searchGrupo = term;
    
    if (!term.trim()) {
      this.gruposFiltrados.set(this.grupos());
      return;
    }

    const termoLower = term.toLowerCase();
    const filtrados = this.grupos().filter(g => 
      g.name.toLowerCase().includes(termoLower) ||
      (g.sigla && g.sigla.toLowerCase().includes(termoLower))
    );

    this.gruposFiltrados.set(filtrados);
  }

  selecionarUsuario(usuario: UserSimple): void {
    this.usuarioSelecionado.set(usuario);
    this.searchUsuario = '';
    this.usuariosFiltrados.set([]);
  }

  selecionarGrupo(grupo: Grupo): void {
    this.grupoSelecionado.set(grupo);
    this.searchGrupo = '';
    this.gruposFiltrados.set([]);
  }

  limparSelecao(): void {
    this.usuarioSelecionado.set(null);
    this.grupoSelecionado.set(null);
    this.searchUsuario = '';
    this.searchGrupo = '';
  }

  validate(): boolean {
    if (!this.notificacao.titulo.trim()) {
      this.toastService.warning('Por favor, preencha o título');
      return false;
    }

    if (!this.notificacao.mensagem.trim()) {
      this.toastService.warning('Por favor, preencha a mensagem');
      return false;
    }

    const tipo = this.destinatarioTipo();
    
    if (tipo === 'individual' && !this.usuarioSelecionado()) {
      this.toastService.warning('Por favor, selecione um usuário');
      return false;
    }

    if (tipo === 'grupo' && !this.grupoSelecionado()) {
      this.toastService.warning('Por favor, selecione um grupo');
      return false;
    }

    if (this.notificacao.titulo.length > 100) {
      this.toastService.warning('O título não pode ter mais de 100 caracteres');
      return false;
    }

    if (this.notificacao.mensagem.length > 1000) {
      this.toastService.warning('A mensagem não pode ter mais de 1000 caracteres');
      return false;
    }

    return true;
  }

  send(): void {
    if (!this.validate()) return;

    this.isSaving.set(true);

    const currentUser = this.authService.currentUser();
    if (!currentUser) {
      this.toastService.error('Usuário não autenticado');
      this.isSaving.set(false);
      return;
    }

    const tipo = this.destinatarioTipo();
    let createDto: CreateNotificacaoDto;

    if (tipo === 'individual') {
      const usuario = this.usuarioSelecionado();
      if (!usuario) {
        this.toastService.error('Usuário não selecionado');
        this.isSaving.set(false);
        return;
      }

      createDto = {
        titulo: this.notificacao.titulo,
        mensagem: this.notificacao.mensagem,
        remetenteId: currentUser.id,
        destinatarioId: usuario.id,
        grupoId: undefined,
        isGeral: false,
        sendEmail: this.notificacao.sendEmail
      };
    } else if (tipo === 'grupo') {
      const grupo = this.grupoSelecionado();
      if (!grupo) {
        this.toastService.error('Grupo não selecionado');
        this.isSaving.set(false);
        return;
      }

      createDto = {
        titulo: this.notificacao.titulo,
        mensagem: this.notificacao.mensagem,
        remetenteId: currentUser.id,
        grupoId: grupo.id,
        destinatarioId: undefined,
        isGeral: false,
        sendEmail: this.notificacao.sendEmail
      };
    } else { 
      createDto = {
        titulo: this.notificacao.titulo,
        mensagem: this.notificacao.mensagem,
        remetenteId: currentUser.id,
        grupoId: undefined,
        destinatarioId: undefined,
        isGeral: true,
        sendEmail: this.notificacao.sendEmail
      };
    }

    this.notificacaoService.create(createDto).subscribe({
      next: () => {
        this.toastService.success('Notificação enviada com sucesso!');
        this.isSaving.set(false);
        this.limpar();
      },
      error: (error) => {
        this.toastService.error('Erro ao enviar notificação');
        this.isSaving.set(false);
      }
    });
  }

  limpar(): void {
    this.notificacao = {
      titulo: '',
      mensagem: '',
      sendEmail: false
    };
    this.usuarioSelecionado.set(null);
    this.searchUsuario = '';
    this.usuariosFiltrados.set([]);
  }

  voltar(): void {
    this.router.navigate(['/notificacoes']);
  }
}
