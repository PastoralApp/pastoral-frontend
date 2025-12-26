import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { UpdateProfileDto, User } from '../../core/models/user.model';
import { ToastService } from '../../shared/services/toast.service';
import { ConfirmationService } from '../../shared/components/confirmation-modal';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);

  user = signal<User | null>(null);
  isLoading = signal(true);
  isEditing = signal(false);
  isSaving = signal(false);

  editForm = signal<UpdateProfileDto>({
    name: ''
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);

    this.userService.getMe().subscribe({
      next: (user) => {
        this.user.set(user);
        this.editForm.set({
          name: user.name,
          birthDate: user.birthDate || undefined,
          photoUrl: user.photoUrl || undefined
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        this.toastService.error('Erro ao carregar perfil');
        this.isLoading.set(false);
      }
    });
  }

  startEditing(): void {
    this.isEditing.set(true);
  }

  cancelEditing(): void {
    this.isEditing.set(false);
    const user = this.user();
    if (user) {
      this.editForm.set({
        name: user.name,
        birthDate: user.birthDate || undefined,
        photoUrl: user.photoUrl || undefined
      });
    }
  }

  saveProfile(): void {
    if (this.isSaving()) return;

    this.isSaving.set(true);

    this.userService.updateMyProfile(this.editForm()).subscribe({
      next: () => {
        this.loadProfile();
        this.isEditing.set(false);
        this.isSaving.set(false);
        this.toastService.success('Perfil atualizado com sucesso!');
      },
      error: (err) => {
        this.toastService.error(err.error?.message || 'Erro ao atualizar perfil');
        this.isSaving.set(false);
      }
    });
  }

  updateFormField(field: keyof UpdateProfileDto, value: string | undefined): void {
    this.editForm.update(form => ({
      ...form,
      [field]: value || undefined
    }));
  }

  async logout(): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      title: 'Sair da conta',
      message: 'Tem certeza que deseja sair da sua conta?',
      confirmText: 'Sim, sair',
      cancelText: 'Cancelar',
      type: 'warning'
    });
    if (confirmed) {
      this.authService.logout();
    }
  }

  get userInitial(): string {
    return this.user()?.name?.charAt(0).toUpperCase() || '?';
  }

  formatDate(date: string | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  }
}
