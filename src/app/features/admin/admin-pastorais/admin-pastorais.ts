import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-pastorais',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-pastorais.html',
  styleUrl: './admin-pastorais.scss'
})
export class AdminPastorais implements OnInit {
  pastorais: any[] = [];
  filteredPastorais: any[] = [];
  searchTerm = '';
  loading = false;

  ngOnInit(): void {
    this.loadPastorais();
  }

  loadPastorais(): void {
    this.loading = true;
    setTimeout(() => {
      this.pastorais = [
        { id: 1, nome: 'Pastoral da Juventude', descricao: 'Pastoral voltada para jovens de 15 a 30 anos', membros: 45, coordenador: 'Maria Santos', ativa: true },
        { id: 2, nome: 'Pastoral Familiar', descricao: 'Acompanhamento de famílias', membros: 32, coordenador: 'João Silva', ativa: true },
        { id: 3, nome: 'Pastoral da Criança', descricao: 'Cuidado integral das crianças', membros: 28, coordenador: 'Ana Costa', ativa: true },
        { id: 4, nome: 'Pastoral Social', descricao: 'Ações sociais e caridade', membros: 18, coordenador: 'Pedro Oliveira', ativa: false }
      ];
      this.filteredPastorais = [...this.pastorais];
      this.loading = false;
    }, 500);
  }

  applyFilters(): void {
    this.filteredPastorais = this.pastorais.filter(pastoral => {
      return !this.searchTerm || 
        pastoral.nome.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        pastoral.coordenador.toLowerCase().includes(this.searchTerm.toLowerCase());
    });
  }

  deletePastoral(pastoral: any): void {
    if (confirm(`Deseja realmente excluir a pastoral "${pastoral.nome}"?`)) {
      this.pastorais = this.pastorais.filter(p => p.id !== pastoral.id);
      this.applyFilters();
    }
  }

  toggleStatus(pastoral: any): void {
    pastoral.ativa = !pastoral.ativa;
  }
}
