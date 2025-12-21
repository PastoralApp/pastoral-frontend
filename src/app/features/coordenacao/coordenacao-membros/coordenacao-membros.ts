import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-coordenacao-membros',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './coordenacao-membros.html',
  styleUrl: './coordenacao-membros.scss'
})
export class CoordenacaoMembros implements OnInit {
  membros: any[] = [];
  filteredMembros: any[] = [];
  searchTerm = '';
  selectedGrupo = '';
  loading = false;

  grupos = [
    { id: 1, nome: 'Grupo de Jovens' },
    { id: 2, nome: 'Grupo de Casais' },
    { id: 3, nome: 'Grupo de Oração' },
    { id: 4, nome: 'Grupo Bíblico' }
  ];

  ngOnInit(): void {
    this.loadMembros();
  }

  loadMembros(): void {
    this.loading = true;
    setTimeout(() => {
      this.membros = [
        { id: 1, nome: 'João Silva', email: 'joao@email.com', telefone: '(11) 99999-1111', grupo: 'Grupo de Jovens', funcao: 'Coordenador', ativo: true },
        { id: 2, nome: 'Maria Santos', email: 'maria@email.com', telefone: '(11) 99999-2222', grupo: 'Grupo de Casais', funcao: 'Coordenadora', ativo: true },
        { id: 3, nome: 'Pedro Costa', email: 'pedro@email.com', telefone: '(11) 99999-3333', grupo: 'Grupo de Jovens', funcao: 'Membro', ativo: true },
        { id: 4, nome: 'Ana Oliveira', email: 'ana@email.com', telefone: '(11) 99999-4444', grupo: 'Grupo de Oração', funcao: 'Membro', ativo: false },
        { id: 5, nome: 'Carlos Ferreira', email: 'carlos@email.com', telefone: '(11) 99999-5555', grupo: 'Grupo Bíblico', funcao: 'Coordenador', ativo: true }
      ];
      this.filteredMembros = [...this.membros];
      this.loading = false;
    }, 500);
  }

  applyFilters(): void {
    this.filteredMembros = this.membros.filter(membro => {
      const matchesSearch = !this.searchTerm || 
        membro.nome.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        membro.email.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesGrupo = !this.selectedGrupo || membro.grupo === this.selectedGrupo;

      return matchesSearch && matchesGrupo;
    });
  }

  deleteMembro(membro: any): void {
    if (confirm(`Deseja realmente remover "${membro.nome}" do grupo?`)) {
      this.membros = this.membros.filter(m => m.id !== membro.id);
      this.applyFilters();
    }
  }

  toggleStatus(membro: any): void {
    membro.ativo = !membro.ativo;
  }
}
