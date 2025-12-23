import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { UpdateUserDto, User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);

  user = signal<User | null>(null);
  isLoading = signal(true);
  isEditing = signal(false);
  isSaving = signal(false);
  error = signal('');
  successMessage = signal('');

  editForm = signal<UpdateUserDto>({
    name: ''
  });

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading.set(true);
    this.error.set('');

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
        this.error.set('Erro ao carregar perfil');
        this.isLoading.set(false);
      }
    });
  }

  startEditing(): void {
    this.isEditing.set(true);
    this.successMessage.set('');
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
    this.error.set('');
    this.successMessage.set('');

    this.userService.updateMyProfile(this.editForm()).subscribe({
      next: () => {
        this.loadProfile();
        this.isEditing.set(false);
        this.isSaving.set(false);
        this.successMessage.set('Perfil atualizado com sucesso!');
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Erro ao atualizar perfil');
        this.isSaving.set(false);
      }
    });
  }

  updateFormField(field: keyof UpdateUserDto, value: string | undefined): void {
    this.editForm.update(form => ({
      ...form,
      [field]: value || undefined
    }));
  }

  logout(): void {
    this.authService.logout();
  }

  get userInitial(): string {
    return this.user()?.name?.charAt(0).toUpperCase() || '?';
  }

  formatDate(date: string | null): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR');
  }
}
