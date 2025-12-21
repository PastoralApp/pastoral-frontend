import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-coordenacao-grupos',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './coordenacao-grupos.html',
  styleUrl: './coordenacao-grupos.scss'
})
export class CoordenacaoGrupos implements OnInit {
  grupos: any[] = [];
  filteredGrupos: any[] = [];
  searchTerm = '';
  loading = false;
  showModal = false;
  selectedGrupo: any = null;

  ngOnInit(): void {
    this.loadGrupos();
  }

  loadGrupos(): void {
    this.loading = true;
    setTimeout(() => {
      this.grupos = [
        { id: 1, nome: 'Grupo de Jovens', descricao: 'Jovens de 15 a 30 anos', membros: 25, coordenador: 'João Silva', diaEncontro: 'Sábados', horario: '19:00', ativo: true },
        { id: 2, nome: 'Grupo de Casais', descricao: 'Encontros para casais', membros: 18, coordenador: 'Maria Santos', diaEncontro: 'Quintas', horario: '20:00', ativo: true },
        { id: 3, nome: 'Grupo de Oração', descricao: 'Oração e adoração', membros: 32, coordenador: 'Pedro Costa', diaEncontro: 'Terças', horario: '19:30', ativo: true },
        { id: 4, nome: 'Grupo Bíblico', descricao: 'Estudo da Palavra', membros: 15, coordenador: 'Ana Oliveira', diaEncontro: 'Quartas', horario: '19:00', ativo: false }
      ];
      this.filteredGrupos = [...this.grupos];
      this.loading = false;
    }, 500);
  }

  applyFilters(): void {
    this.filteredGrupos = this.grupos.filter(grupo => {
      return !this.searchTerm || 
        grupo.nome.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        grupo.coordenador.toLowerCase().includes(this.searchTerm.toLowerCase());
    });
  }

  openModal(grupo?: any): void {
    this.selectedGrupo = grupo ? { ...grupo } : { nome: '', descricao: '', coordenador: '', diaEncontro: '', horario: '', ativo: true };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedGrupo = null;
  }

  saveGrupo(): void {
    if (this.selectedGrupo.id) {
      const index = this.grupos.findIndex(g => g.id === this.selectedGrupo.id);
      if (index >= 0) {
        this.grupos[index] = { ...this.selectedGrupo };
      }
    } else {
      this.selectedGrupo.id = Date.now();
      this.selectedGrupo.membros = 0;
      this.grupos.push(this.selectedGrupo);
    }
    this.applyFilters();
    this.closeModal();
  }

  deleteGrupo(grupo: any): void {
    if (confirm(`Deseja realmente excluir o grupo "${grupo.nome}"?`)) {
      this.grupos = this.grupos.filter(g => g.id !== grupo.id);
      this.applyFilters();
    }
  }

  toggleStatus(grupo: any): void {
    grupo.ativo = !grupo.ativo;
  }
}
