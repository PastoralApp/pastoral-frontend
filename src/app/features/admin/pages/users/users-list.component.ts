import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/user.model';
import { ConfirmationService } from '../../../../shared/components/confirmation-modal';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent implements OnInit {
  private userService = inject(UserService);
  private confirmationService = inject(ConfirmationService);
  private toastService = inject(ToastService);

  users = signal<User[]>([]);
  filteredUsers = signal<User[]>([]);
  isLoading = signal(true);
  searchTerm = '';

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading.set(true);
    this.userService.getAll().subscribe({
      next: (users) => {
        this.users.set(users);
        this.filteredUsers.set(users);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    const lower = term.toLowerCase();
    if (!lower) {
      this.filteredUsers.set(this.users());
      return;
    }
    this.filteredUsers.set(
      this.users().filter(u =>
        u.name.toLowerCase().includes(lower) ||
        u.email.toLowerCase().includes(lower)
      )
    );
  }

  async toggleStatus(user: User): Promise<void> {
    if (user.isActive) {
      const confirmed = await this.confirmationService.confirm({
        title: 'Desativar Usuário',
        message: `Deseja desativar "${user.name}"?`,
        confirmText: 'Sim, desativar',
        cancelText: 'Cancelar',
        type: 'warning'
      });
      if (!confirmed) return;

      this.userService.desativar(user.id).subscribe({
        next: () => this.loadUsers()
      });
    } else {
      this.userService.ativar(user.id).subscribe({
        next: () => this.loadUsers()
      });
    }
  }

  async deleteUser(user: User): Promise<void> {
    const confirmed = await this.confirmationService.confirm({
      title: 'Excluir Usuário',
      message: `Deseja realmente excluir o usuário "${user.name}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Sim, excluir',
      cancelText: 'Cancelar',
      type: 'danger'
    });

    if (!confirmed) return;

    this.userService.delete(user.id).subscribe({
      next: () => {
        this.toastService.success('Usuário excluído com sucesso');
        this.loadUsers();
      },
      error: (err) => {
        console.error('Erro ao excluir usuário:', err);
        this.toastService.error(err.error?.message || 'Erro ao excluir usuário');
      }
    });
  }
}
