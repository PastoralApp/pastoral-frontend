import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TrofeuService } from '../../../core/services/trofeu.service';
import { Trofeu } from '../../../core/models/jogos.model';

@Component({
  selector: 'app-trofeus-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="trofeus-container">
      <header class="page-header">
        <div class="header-content">
          <h1><i class="fas fa-trophy"></i> Troféus</h1>
          <button class="btn btn-primary" (click)="concederTrofeu()">
            <i class="fas fa-plus"></i> Conceder Troféu
          </button>
        </div>
      </header>

      <div class="filters">
        <select [(ngModel)]="filtroAno" (change)="filtrar()" class="filter-select">
          <option value="">Todos os Anos</option>
          @for (ano of anos(); track ano) {
            <option [value]="ano">{{ ano }}</option>
          }
        </select>

        <select [(ngModel)]="filtroCategoria" (change)="filtrar()" class="filter-select">
          <option value="">Todas as Categorias</option>
          @for (cat of categorias(); track cat) {
            <option [value]="cat">{{ cat }}</option>
          }
        </select>
      </div>

      @if (carregando()) {
        <div class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Carregando troféus...</p>
        </div>
      } @else if (trofeusFiltrados().length > 0) {
        <div class="trofeus-stats">
          <div class="stat-card">
            <i class="fas fa-trophy"></i>
            <div class="stat-info">
              <span class="stat-value">{{ trofeusFiltrados().length }}</span>
              <span class="stat-label">Total de Troféus</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-users"></i>
            <div class="stat-info">
              <span class="stat-value">{{ gruposUnicos().length }}</span>
              <span class="stat-label">Grupos Premiados</span>
            </div>
          </div>
          <div class="stat-card">
            <i class="fas fa-calendar"></i>
            <div class="stat-info">
              <span class="stat-value">{{ anosUnicos().length }}</span>
              <span class="stat-label">Anos de Competição</span>
            </div>
          </div>
        </div>

        <div class="trofeus-grid">
          @for (trofeu of trofeusFiltrados(); track trofeu.id) {
            <div class="trofeu-card">
              <div class="trofeu-header">
                @if (trofeu.imagemUrl) {
                  <div class="trofeu-image">
                    <img [src]="trofeu.imagemUrl" [alt]="trofeu.nome">
                  </div>
                } @else {
                  <div class="trofeu-icon">
                    <i class="fas fa-trophy"></i>
                  </div>
                }
                <div class="trofeu-title">
                  <h3>{{ trofeu.nome }}</h3>
                  <span class="trofeu-ano">{{ trofeu.ano }}</span>
                </div>
              </div>

              <div class="trofeu-content">
                @if (trofeu.descricao) {
                  <p class="trofeu-descricao">{{ trofeu.descricao }}</p>
                }

                <div class="trofeu-info">
                  <div class="info-item">
                    <i class="fas fa-gamepad"></i>
                    <span>{{ trofeu.jogoNome }}</span>
                  </div>

                  <div class="info-item">
                    <i class="fas fa-users"></i>
                    <span>{{ trofeu.grupoNome }}</span>
                  </div>

                  @if (trofeu.categoria) {
                    <div class="info-item">
                      <i class="fas fa-tag"></i>
                      <span>{{ trofeu.categoria }}</span>
                    </div>
                  }

                  @if (trofeu.posicao) {
                    <div class="info-item posicao">
                      <i class="fas fa-award"></i>
                      <span>{{ getPosicaoLabel(trofeu.posicao) }}</span>
                    </div>
                  }
                </div>

                @if (trofeu.observacoes) {
                  <div class="trofeu-observacoes">
                    <strong>Observações:</strong>
                    <p>{{ trofeu.observacoes }}</p>
                  </div>
                }

                <div class="trofeu-footer">
                  <i class="fas fa-calendar"></i>
                  <span>{{ formatDate(trofeu.dataConquista) }}</span>
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="empty-state">
          <i class="fas fa-trophy"></i>
          <p>Nenhum troféu encontrado</p>
          <button class="btn btn-primary" (click)="concederTrofeu()">
            <i class="fas fa-plus"></i> Conceder Primeiro Troféu
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .trofeus-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .page-header {
      margin-bottom: 2rem;

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);

        h1 {
          margin: 0;
          color: #2c3e50;
          display: flex;
          align-items: center;
          gap: 0.75rem;

          i {
            color: #f39c12;
          }
        }
      }
    }

    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;

      .filter-select {
        padding: 0.75rem 1rem;
        border: 2px solid #ecf0f1;
        border-radius: 8px;
        background: white;
        cursor: pointer;
        font-size: 1rem;

        &:focus {
          outline: none;
          border-color: #f39c12;
        }
      }
    }

    .trofeus-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;

      .stat-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        display: flex;
        align-items: center;
        gap: 1rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);

        i {
          font-size: 2.5rem;
          color: #f39c12;
        }

        .stat-info {
          display: flex;
          flex-direction: column;

          .stat-value {
            font-size: 2rem;
            font-weight: 700;
            color: #2c3e50;
          }

          .stat-label {
            color: #7f8c8d;
            font-size: 0.9rem;
          }
        }
      }
    }

    .trofeus-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 1.5rem;

      .trofeu-card {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        transition: transform 0.2s;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }

        .trofeu-header {
          background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          color: white;

          .trofeu-image {
            width: 70px;
            height: 70px;
            border-radius: 8px;
            overflow: hidden;
            flex-shrink: 0;
            background: white;

            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }

          .trofeu-icon {
            width: 70px;
            height: 70px;
            background: rgba(255,255,255,0.2);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            flex-shrink: 0;
          }

          .trofeu-title {
            flex: 1;

            h3 {
              margin: 0 0 0.5rem 0;
              font-size: 1.3rem;
            }

            .trofeu-ano {
              background: rgba(255,255,255,0.2);
              padding: 0.25rem 0.75rem;
              border-radius: 20px;
              font-size: 0.9rem;
              font-weight: 600;
            }
          }
        }

        .trofeu-content {
          padding: 1.5rem;

          .trofeu-descricao {
            color: #555;
            line-height: 1.6;
            margin: 0 0 1rem 0;
          }

          .trofeu-info {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
            margin-bottom: 1rem;

            .info-item {
              display: flex;
              align-items: center;
              gap: 0.75rem;
              color: #555;
              font-size: 0.95rem;

              i {
                color: #f39c12;
                width: 20px;
              }

              &.posicao {
                font-weight: 600;
                color: #2c3e50;
              }
            }
          }

          .trofeu-observacoes {
            background: #fff8e1;
            border-left: 4px solid #f39c12;
            padding: 1rem;
            border-radius: 4px;
            margin-bottom: 1rem;

            strong {
              color: #f57c00;
              font-size: 0.9rem;
            }

            p {
              margin: 0.5rem 0 0 0;
              color: #555;
              font-size: 0.95rem;
            }
          }

          .trofeu-footer {
            padding-top: 1rem;
            border-top: 1px solid #ecf0f1;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #7f8c8d;
            font-size: 0.9rem;

            i {
              color: #f39c12;
            }
          }
        }
      }
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;

      &.btn-primary {
        background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
        color: white;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(243, 156, 18, 0.4);
        }
      }
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);

      i {
        font-size: 3rem;
        color: #f39c12;
        margin-bottom: 1rem;
      }

      p {
        font-size: 1.1rem;
        color: #7f8c8d;
        margin-bottom: 1rem;
      }
    }
  `]
})
export class TrofeusListComponent implements OnInit {
  private trofeuService = inject(TrofeuService);
  private router = inject(Router);

  trofeus = signal<Trofeu[]>([]);
  trofeusFiltrados = signal<Trofeu[]>([]);
  anos = signal<number[]>([]);
  categorias = signal<string[]>([]);
  carregando = signal(true);

  filtroAno = '';
  filtroCategoria = '';

  ngOnInit() {
    this.loadTrofeus();
  }

  loadTrofeus() {
    this.carregando.set(true);
    this.trofeuService.getAll().subscribe({
      next: (data) => {
        this.trofeus.set(data);
        this.trofeusFiltrados.set(data);
        this.extractAnos(data);
        this.extractCategorias(data);
        this.carregando.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar troféus:', err);
        this.carregando.set(false);
      }
    });
  }

  extractAnos(trofeus: Trofeu[]) {
    const anosSet = new Set(trofeus.map(t => t.ano));
    this.anos.set(Array.from(anosSet).sort((a, b) => b - a));
  }

  extractCategorias(trofeus: Trofeu[]) {
    const catSet = new Set(trofeus.filter(t => t.categoria).map(t => t.categoria!));
    this.categorias.set(Array.from(catSet).sort());
  }

  filtrar() {
    let filtrados = this.trofeus();

    if (this.filtroAno) {
      filtrados = filtrados.filter(t => t.ano === parseInt(this.filtroAno));
    }

    if (this.filtroCategoria) {
      filtrados = filtrados.filter(t => t.categoria === this.filtroCategoria);
    }

    this.trofeusFiltrados.set(filtrados);
  }

  gruposUnicos(): string[] {
    const grupos = new Set(this.trofeusFiltrados().map(t => t.grupoId));
    return Array.from(grupos);
  }

  anosUnicos(): number[] {
    const anos = new Set(this.trofeusFiltrados().map(t => t.ano));
    return Array.from(anos);
  }

  getPosicaoLabel(posicao: number): string {
    const labels: Record<number, string> = {
      1: '1º Lugar',
      2: '2º Lugar',
      3: '3º Lugar'
    };
    return labels[posicao] || `${posicao}º Lugar`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  concederTrofeu() {
    console.log('Conceder troféu');
  }
}
