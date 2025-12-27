import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EventoService } from '../../../core/services/evento.service';
import { GrupoService } from '../../../core/services/grupo.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { CreateEventoDto, UpdateEventoDto, Evento, EventoType } from '../../../core/models/evento.model';
import { ToastService } from '../../../shared/services/toast.service';
import { Grupo } from '../../../core/models/pastoral.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-evento-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evento-form.component.html',
  styleUrl: './evento-form.component.scss'
})
export class EventoFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eventoService = inject(EventoService);
  private grupoService = inject(GrupoService);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  isEditMode = signal(false);
  eventoId = signal<string | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);
  
  grupos = signal<Grupo[]>([]);
  coordenadores = signal<User[]>([]);
  
  coresDisponiveis = [
    { nome: 'Padrão', valor: '' },
    { nome: 'Azul', valor: '#3b82f6' },
    { nome: 'Verde', valor: '#22c55e' },
    { nome: 'Vermelho', valor: '#ef4444' },
    { nome: 'Amarelo', valor: '#eab308' },
    { nome: 'Roxo', valor: '#a855f7' },
    { nome: 'Rosa', valor: '#ec4899' },
    { nome: 'Laranja', valor: '#f97316' },
    { nome: 'Ciano', valor: '#06b6d4' },
  ];
  
  currentUserRole = computed(() => this.authService.currentUser()?.roleName || '');
  isAdmin = computed(() => this.currentUserRole() === 'Administrador');
  isCoordGeral = computed(() => this.currentUserRole() === 'Coordenador Geral');
  isCoordGrupo = computed(() => this.currentUserRole() === 'Coordenador de Grupo');
  
  userGrupoId = computed(() => this.authService.currentUser()?.grupoId || null);
  canSelectGrupo = computed(() => this.isAdmin() || this.isCoordGeral());
  canSelectResponsavel = computed(() => this.isAdmin() || this.isCoordGeral());

  form = signal<CreateEventoDto>({
    title: '',
    description: '',
    eventDate: '',
    location: '',
    imageUrl: '',
    maxParticipants: 0,
    requireInscription: false,
    type: EventoType.Comum,
    grupoId: undefined,
    responsavelUserId: undefined,
    cor: ''
  });

  ngOnInit(): void {
    this.loadGrupos();
    this.loadCoordenadores();
    
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.eventoId.set(id);
      this.loadEvento(id);
    } else if (this.isCoordGrupo() && this.userGrupoId()) {
      this.form.update(f => ({ ...f, grupoId: this.userGrupoId()! }));
    }
  }
  
  loadGrupos(): void {
    this.grupoService.getAll().subscribe({
      next: (grupos) => this.grupos.set(grupos),
      error: () => console.error('Erro ao carregar grupos')
    });
  }
  
  loadCoordenadores(): void {
    this.userService.getAll().subscribe({
      next: (users) => {
        const coordenadores = users.filter(u => 
          u.roleName === 'Coordenador Geral' || 
          u.roleName === 'Coordenador de Grupo' ||
          u.roleName === 'Administrador'
        );
        this.coordenadores.set(coordenadores);
      },
      error: () => console.error('Erro ao carregar coordenadores')
    });
  }

  loadEvento(id: string): void {
    this.isLoading.set(true);
    this.eventoService.getById(id).subscribe({
      next: (evento) => {
        this.form.set({
          title: evento.title,
          description: evento.description,
          eventDate: this.formatDateForInput(evento.eventDate),
          location: evento.location || '',
          imageUrl: evento.imageUrl || '',
          maxParticipants: evento.maxParticipants,
          requireInscription: evento.requireInscription,
          type: evento.type,
          grupoId: evento.grupoId || undefined,
          responsavelUserId: evento.responsavelUserId || undefined,
          cor: evento.cor || ''
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.error('Erro ao carregar evento');
        this.isLoading.set(false);
      }
    });
  }

  formatDateForInput(date: string): string {
    const d = new Date(date);
    return d.toISOString().slice(0, 16);
  }

  updateField<K extends keyof CreateEventoDto>(field: K, value: CreateEventoDto[K]): void {
    this.form.update(f => ({ ...f, [field]: value }));
  }

  onSubmit(): void {
    if (this.isSaving()) return;

    const formData = this.form();
    if (!formData.title || !formData.description || !formData.eventDate) {
      this.toastService.warning('Preencha todos os campos obrigatórios');
      return;
    }
    
    if (this.isCoordGrupo() && !formData.grupoId) {
      this.toastService.warning('Você deve vincular o evento ao seu grupo');
      return;
    }

    this.isSaving.set(true);

    if (this.isEditMode() && this.eventoId()) {
      const updateData: UpdateEventoDto = {
        title: formData.title,
        description: formData.description,
        eventDate: new Date(formData.eventDate).toISOString(),
        location: formData.location || undefined,
        imageUrl: formData.imageUrl || undefined,
        maxParticipants: formData.maxParticipants,
        requireInscription: formData.requireInscription,
        type: formData.type,
        grupoId: formData.grupoId || undefined,
        responsavelUserId: formData.responsavelUserId || undefined,
        cor: formData.cor || undefined
      };

      this.eventoService.update(this.eventoId()!, updateData).subscribe({
        next: () => {
          this.toastService.success('Evento atualizado com sucesso!');
          this.router.navigate(['/eventos', this.eventoId()]);
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Erro ao atualizar evento');
          this.isSaving.set(false);
        }
      });
    } else {
      const createData: CreateEventoDto = {
        title: formData.title,
        description: formData.description,
        eventDate: new Date(formData.eventDate).toISOString(),
        location: formData.location || undefined,
        imageUrl: formData.imageUrl || undefined,
        maxParticipants: formData.maxParticipants,
        requireInscription: formData.requireInscription,
        type: formData.type,
        grupoId: formData.grupoId || undefined,
        responsavelUserId: formData.responsavelUserId || undefined,
        cor: formData.cor || undefined
      };

      this.eventoService.create(createData).subscribe({
        next: (evento) => {
          this.toastService.success('Evento criado com sucesso!');
          this.router.navigate(['/eventos', evento.id]);
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Erro ao criar evento');
          this.isSaving.set(false);
        }
      });
    }
  }

  goBack(): void {
    if (this.isEditMode() && this.eventoId()) {
      this.router.navigate(['/eventos', this.eventoId()]);
    } else {
      this.router.navigate(['/eventos']);
    }
  }

  get pageTitle(): string {
    return this.isEditMode() ? 'Editar Evento' : 'Novo Evento';
  }

  get submitButtonText(): string {
    if (this.isSaving()) {
      return this.isEditMode() ? 'Salvando...' : 'Criando...';
    }
    return this.isEditMode() ? 'Salvar Alterações' : 'Criar Evento';
  }
  
  get grupoSelecionadoNome(): string {
    const grupoId = this.form().grupoId;
    if (!grupoId) return 'Seu grupo';
    const grupo = this.grupos().find(g => g.id === grupoId);
    return grupo?.name || 'Seu grupo';
  }
}
