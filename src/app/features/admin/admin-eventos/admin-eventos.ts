import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-eventos',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-eventos.html',
  styleUrl: './admin-eventos.scss'
})
export class AdminEventos implements OnInit {
  eventos: any[] = [];
  filteredEventos: any[] = [];
  searchTerm = '';
  filterStatus = '';
  loading = false;

  ngOnInit(): void {
    this.loadEventos();
  }

  loadEventos(): void {
    this.loading = true;
    setTimeout(() => {
      const now = new Date();
      this.eventos = [
        { id: 1, title: 'Retiro de Carnaval', description: 'Retiro espiritual para jovens', location: 'Casa de Retiros', eventDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), requireInscription: true },
        { id: 2, title: 'Missa de Páscoa', description: 'Celebração pascal', location: 'Igreja Matriz', eventDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), requireInscription: true },
        { id: 3, title: 'Encontro de Casais', description: 'Formação para casais', location: 'Salão Paroquial', eventDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), requireInscription: false },
        { id: 4, title: 'Curso de Biblia', description: 'Estudo bíblico semanal', location: 'Sala de Catequese', eventDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), requireInscription: true }
      ];
      this.filteredEventos = [...this.eventos];
      this.loading = false;
    }, 500);
  }

  applyFilters(): void {
    const now = new Date();
    this.filteredEventos = this.eventos.filter(evento => {
      const matchesSearch = !this.searchTerm || 
        evento.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        evento.location.toLowerCase().includes(this.searchTerm.toLowerCase());

      let matchesStatus = true;
      if (this.filterStatus === 'upcoming') {
        matchesStatus = new Date(evento.eventDate) > now;
      } else if (this.filterStatus === 'past') {
        matchesStatus = new Date(evento.eventDate) <= now;
      } else if (this.filterStatus === 'open') {
        matchesStatus = evento.requireInscription;
      }

      return matchesSearch && matchesStatus;
    });
  }

  getStatusBadge(evento: any): { class: string; label: string } {
    const now = new Date();
    if (new Date(evento.eventDate) <= now) {
      return { class: 'bg-secondary', label: 'Encerrado' };
    }
    if (evento.requireInscription) {
      return { class: 'bg-success', label: 'Inscrições Abertas' };
    }
    return { class: 'bg-warning text-dark', label: 'Em Breve' };
  }

  deleteEvento(evento: any): void {
    if (confirm(`Deseja realmente excluir o evento "${evento.title}"?`)) {
      this.eventos = this.eventos.filter(e => e.id !== evento.id);
      this.applyFilters();
    }
  }

  toggleInscricoes(evento: any): void {
    evento.requireInscription = !evento.requireInscription;
  }
}
