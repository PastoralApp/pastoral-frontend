import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-coordenacao-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './coordenacao-dashboard.html',
  styleUrl: './coordenacao-dashboard.scss'
})
export class CoordenacaoDashboard implements OnInit {
  stats = {
    totalGrupos: 0,
    totalMembros: 0,
    eventosAtivos: 0,
    pendencias: 0
  };

  grupos: any[] = [];
  proximosEventos: any[] = [];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.stats = {
      totalGrupos: 8,
      totalMembros: 156,
      eventosAtivos: 5,
      pendencias: 3
    };

    this.grupos = [
      { id: 1, nome: 'Grupo de Jovens', membros: 25, coordenador: 'João Silva', proximoEncontro: new Date() },
      { id: 2, nome: 'Grupo de Casais', membros: 18, coordenador: 'Maria Santos', proximoEncontro: new Date() },
      { id: 3, nome: 'Grupo de Oração', membros: 32, coordenador: 'Pedro Costa', proximoEncontro: new Date() }
    ];

    this.proximosEventos = [
      { id: 1, titulo: 'Encontro de Formação', data: new Date(), local: 'Salão Paroquial' },
      { id: 2, titulo: 'Retiro Espiritual', data: new Date(), local: 'Casa de Retiros' },
      { id: 3, titulo: 'Reunião de Coordenadores', data: new Date(), local: 'Sala de Reuniões' }
    ];
  }
}
