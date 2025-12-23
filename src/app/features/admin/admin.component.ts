import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { PastoralService } from '../../core/services/pastoral.service';
import { GrupoService } from '../../core/services/grupo.service';
import { RoleService } from '../../core/services/role.service';
import { User } from '../../core/models/user.model';
import { Pastoral } from '../../core/models/pastoral.model';
import { Role } from '../../core/models/role.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  private userService = inject(UserService);
  private pastoralService = inject(PastoralService);
  private grupoService = inject(GrupoService);
  private roleService = inject(RoleService);

  activeTab = signal<'users' | 'pastorais' | 'roles'>('users');
  users = signal<User[]>([]);
  pastorais = signal<Pastoral[]>([]);
  roles = signal<Role[]>([]);
  isLoading = signal(true);
  searchTerm = signal('');

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);

    this.roleService.getAll().subscribe({
      next: (roles) => this.roles.set(roles)
    });

    this.userService.getAll().subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      }
    });

    this.pastoralService.getAll().subscribe({
      next: (pastorais) => this.pastorais.set(pastorais)
    });
  }

  setTab(tab: 'users' | 'pastorais' | 'roles'): void {
    this.activeTab.set(tab);
    this.searchTerm.set('');
  }

  get filteredUsers(): User[] {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.users();
    return this.users().filter(u =>
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  }

  get filteredPastorais(): Pastoral[] {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.pastorais();
    return this.pastorais().filter(p =>
      p.name.toLowerCase().includes(term)
    );
  }

  toggleUserStatus(user: User): void {
    if (user.isActive) {
      this.userService.desativar(user.id).subscribe({
        next: () => {
          this.users.update(list =>
            list.map(u => u.id === user.id ? { ...u, isActive: false } : u)
          );
        }
      });
    } else {
      this.userService.ativar(user.id).subscribe({
        next: () => {
          this.users.update(list =>
            list.map(u => u.id === user.id ? { ...u, isActive: true } : u)
          );
        }
      });
    }
  }

  changeUserRole(userId: string, roleId: string): void {
    this.userService.updateRole(userId, { roleId }).subscribe({
      next: () => {
        this.users.update(list =>
          list.map(u => u.id === userId ? { ...u, roleId } : u)
        );
      }
    });
  }

  togglePastoralStatus(pastoral: Pastoral): void {
    if (pastoral.isActive) {
      this.pastoralService.desativar(pastoral.id).subscribe({
        next: () => {
          this.pastorais.update(list =>
            list.map(p => p.id === pastoral.id ? { ...p, isActive: false } : p)
          );
        }
      });
    } else {
      this.pastoralService.ativar(pastoral.id).subscribe({
        next: () => {
          this.pastorais.update(list =>
            list.map(p => p.id === pastoral.id ? { ...p, isActive: true } : p)
          );
        }
      });
    }
  }
}
