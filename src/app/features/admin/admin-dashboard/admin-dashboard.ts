import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})
export class AdminDashboard implements OnInit {
  stats = {
    totalUsers: 0,
    totalPosts: 0,
    totalEventos: 0,
    totalPastorais: 0
  };

  recentUsers: any[] = [];
  recentPosts: any[] = [];

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.stats = {
      totalUsers: 156,
      totalPosts: 42,
      totalEventos: 18,
      totalPastorais: 8
    };

    this.recentUsers = [
      { id: 1, name: 'João Silva', email: 'joao@email.com', createdAt: new Date() },
      { id: 2, name: 'Maria Santos', email: 'maria@email.com', createdAt: new Date() },
      { id: 3, name: 'Pedro Costa', email: 'pedro@email.com', createdAt: new Date() }
    ];

    this.recentPosts = [
      { id: 1, titulo: 'Encontro de Jovens', tipo: 0, createdAt: new Date() },
      { id: 2, titulo: 'Missa de Páscoa', tipo: 1, createdAt: new Date() },
      { id: 3, titulo: 'Retiro Espiritual', tipo: 2, createdAt: new Date() }
    ];
  }
}
