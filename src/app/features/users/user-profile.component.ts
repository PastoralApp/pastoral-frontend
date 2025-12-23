import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  user = signal<User | null>(null);
  isLoading = signal(true);
  error = signal('');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadUser(id);
    } else {
      this.router.navigate(['/feed']);
    }
  }

  loadUser(id: string): void {
    this.isLoading.set(true);
    this.error.set('');

    this.userService.getById(id).subscribe({
      next: (user) => {
        this.user.set(user);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Usuário não encontrado');
        this.isLoading.set(false);
      }
    });
  }

  goBack(): void {
    history.back();
  }

  isCurrentUser(): boolean {
    const currentUser = this.authService.currentUser();
    const viewedUser = this.user();
    return currentUser?.name === viewedUser?.name;
  }

  getUserInitial(): string {
    return this.user()?.name?.charAt(0).toUpperCase() || '?';
  }

  formatDate(date: string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  getMemberSince(): string {
    const user = this.user();
    if (!user?.createdAt) return '-';
    return new Date(user.createdAt).toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    });
  }
}
