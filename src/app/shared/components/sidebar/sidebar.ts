import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {
  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();
  
  currentUser: User | null = null;

  menuItems = [
    { path: '/dashboard', icon: 'dashboard', label: 'Dashboard', roles: [0, 1, 2, 3] },
    { path: '/posts', icon: 'article', label: 'Posts', roles: [0, 1, 2, 3] },
    { path: '/eventos', icon: 'event', label: 'Eventos', roles: [0, 1, 2, 3] },
    { path: '/users', icon: 'people', label: 'Usuários', roles: [2, 3] }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
    });
  }

  canAccessRoute(requiredRoles: number[]): boolean {
    if (!this.currentUser?.role) return false;
    return requiredRoles.includes(this.currentUser.role.type);
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
    this.close();
  }

  close(): void {
    this.closeSidebar.emit();
  }

  logout(): void {
    if (confirm('Deseja realmente sair?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
      this.close();
    }
  }
}
