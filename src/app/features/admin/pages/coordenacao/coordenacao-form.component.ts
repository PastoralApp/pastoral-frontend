import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { RoleService } from '../../../../core/services/role.service';
import { GrupoService } from '../../../../core/services/grupo.service';
import { Role } from '../../../../core/models/role.model';
import { Grupo } from '../../../../core/models/pastoral.model';
import { User } from '../../../../core/models/user.model';
import { ToastService } from '../../../../shared/services/toast.service';
import { ConfirmationService } from '../../../../shared/components/confirmation-modal';

@Component({
  selector: 'app-coordenacao-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './coordenacao-form.component.html',
  styleUrl: './coordenacao-form.component.scss'
})
export class CoordenacaoFormComponent implements OnInit {
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private grupoService = inject(GrupoService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isEditMode = signal(false);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  
  allRoles = signal<Role[]>([]);
  allGrupos = signal<Grupo[]>([]);
  currentUser = signal<User | null>(null);
  
  userId: string | null = null;

  formData = signal({
    name: '',
    email: '',
    password: '',
    roleId: '',
    telefone: '',
    birthDate: '',
    isActive: true
  });

  selectedGrupos = signal<string[]>([]);

  coordenacaoRoles = computed(() => {
    return this.allRoles().filter(role => 
      role.name === 'Coordenador de Grupo' || 
      role.name === 'Coordenador Geral' ||
      role.name === 'Administrador'
    );
  });

  gruposPorPastoral = computed(() => {
    const grupos = this.allGrupos();
    const grouped: { [key: string]: Grupo[] } = {};
    
    grupos.forEach(grupo => {
      const pastoral = grupo.pastoralName || 'Sem Pastoral';
      if (!grouped[pastoral]) {
        grouped[pastoral] = [];
      }
      grouped[pastoral].push(grupo);
    });
    
    return grouped;
  });

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEditMode.set(!!this.userId);

    this.roleService.getAll().subscribe({
      next: (roles) => this.allRoles.set(roles)
    });

    this.grupoService.getAll(true).subscribe({
      next: (grupos) => this.allGrupos.set(grupos)
    });

    if (this.isEditMode() && this.userId) {
      this.userService.getById(this.userId).subscribe({
        next: (user) => {
          this.currentUser.set(user);
          this.formData.set({
            name: user.name,
            email: user.email,
            password: '',
            roleId: user.roleId,
            telefone: user.telefone || '',
            birthDate: user.birthDate || '',
            isActive: user.isActive
          });
          
          this.selectedGrupos.set(user.grupos.map(g => g.grupoId));
        },
        error: (error) => {
          console.error('Erro ao carregar usuário:', error);
          this.toastService.error('Erro ao carregar dados do coordenador');
        }
      });
    }
  }

  toggleGrupo(grupoId: string): void {
    const current = this.selectedGrupos();
    if (current.includes(grupoId)) {
      this.selectedGrupos.set(current.filter(id => id !== grupoId));
    } else {
      if (current.length >= 4) {
        this.toastService.warning('Um coordenador pode estar em no máximo 4 grupos');
        return;
      }
      this.selectedGrupos.set([...current, grupoId]);
    }
  }

  isGrupoSelected(grupoId: string): boolean {
    return this.selectedGrupos().includes(grupoId);
  }

  updateName(value: string): void {
    this.formData.update(v => ({ ...v, name: value }));
  }

  updateEmail(value: string): void {
    this.formData.update(v => ({ ...v, email: value }));
  }

  updateTelefone(value: string): void {
    this.formData.update(v => ({ ...v, telefone: value }));
  }

  updateBirthDate(value: string): void {
    this.formData.update(v => ({ ...v, birthDate: value }));
  }

  updatePassword(value: string): void {
    this.formData.update(v => ({ ...v, password: value }));
  }

  updateRoleId(value: string): void {
    this.formData.update(v => ({ ...v, roleId: value }));
  }

  async save(): Promise<void> {
    const data = this.formData();
    
    if (!data.name.trim()) {
      this.toastService.warning('Nome é obrigatório');
      return;
    }
    if (!data.email.trim()) {
      this.toastService.warning('Email é obrigatório');
      return;
    }
    if (!data.roleId) {
      this.toastService.warning('Selecione uma role');
      return;
    }
    if (!this.isEditMode() && !data.password) {
      this.toastService.warning('Senha é obrigatória para novo coordenador');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    try {
      if (this.isEditMode() && this.userId) {
        await this.userService.updateAdmin(this.userId, {
          name: data.name,
          telefone: data.telefone,
          birthDate: data.birthDate,
          roleId: data.roleId
        }).toPromise();

        await this.updateUserGrupos(this.userId);
        this.toastService.success('Coordenador atualizado com sucesso!');
      } else {
        const newUser = await this.userService.createAdmin({
          name: data.name,
          email: data.email,
          password: data.password,
          roleId: data.roleId,
          telefone: data.telefone,
          birthDate: data.birthDate
        }).toPromise();

        if (newUser?.id) {
          await this.updateUserGrupos(newUser.id);
          this.toastService.success('Coordenador criado com sucesso!');
        }
      }

      this.router.navigate(['/admin/coord-grupo']);
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      this.toastService.error(error.error?.message || 'Erro ao salvar coordenador');
      this.isSubmitting.set(false);
    }
  }

  private async updateUserGrupos(userId: string): Promise<void> {
    const currentGrupos = this.currentUser()?.grupos.map(g => g.grupoId) || [];
    const selectedGrupos = this.selectedGrupos();

    for (const grupoId of currentGrupos) {
      if (!selectedGrupos.includes(grupoId)) {
        await this.userService.removeFromGrupo(userId, grupoId).toPromise();
      }
    }
    for (const grupoId of selectedGrupos) {
      if (!currentGrupos.includes(grupoId)) {
        await this.userService.addToGrupo(userId, grupoId).toPromise();
      }
    }
  }

  cancel(): void {
    this.router.navigate(['/admin/coord-grupo']);
  }
}
