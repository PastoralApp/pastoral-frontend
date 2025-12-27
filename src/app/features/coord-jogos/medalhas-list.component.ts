import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MedalhaService } from '../../../core/services/medalha.service';
import { Medalha, TipoMedalha } from '../../../core/models/jogos.model';

@Component({
  selector: 'app-medalhas-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="medalhas-container">
      <header class="page-header">
        <div class="header-content">
          <h1><i class="fas fa-medal"></i> Medalhas</h1>
          <button class="btn btn-primary" (click)="concederMedalha()">
            <i class="fas fa-plus"></i> Conceder Medalha
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

        <select [(ngModel)]="filtroTipo" (change)="filtrar()" class="filter-select">
          <option value="">Todos os Tipos</option>
          <option [value]="TipoMedalha.Ouro">Ouro</option>
          <option [value]="TipoMedalha.Prata">Prata</option>
          <option [value]="TipoMedalha.Bronze">Bronze</option>
        </select>
      </div>

      @if (carregando()) {
        <div class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Carregando medalhas...</p>
        </div>
      } @else if (medalhasFiltradas().length > 0) {
        <div class="medalhas-stats">
          <div class="stat-card ouro">
            <i class="fas fa-medal"></i>
            <div class="stat-info">
              <span class="stat-value">{{ countTipo(TipoMedalha.Ouro) }}</span>
              <span class="stat-label">Ouro</span>
            </div>
          </div>
          <div class="stat-card prata">
            <i class="fas fa-medal"></i>
            <div class="stat-info">
              <span class="stat-value">{{ countTipo(TipoMedalha.Prata) }}</span>
              <span class="stat-label">Prata</span>
            </div>
          </div>
          <div class="stat-card bronze">
            <i class="fas fa-medal"></i>
            <div class="stat-info">
              <span class="stat-value">{{ countTipo(TipoMedalha.Bronze) }}</span>
              <span class="stat-label">Bronze</span>
            </div>
          </div>
        </div>

        <div class="medalhas-grid">
          @for (medalha of medalhasFiltradas(); track medalha.id) {
            <div class="medalha-card" [class]="getTipoClass(medalha.tipo)">
              <div class="medalha-icon">
                <i class="fas fa-medal"></i>
              </div>
              <div class="medalha-content">
                <div class="medalha-header">
                  <h3>{{ getTipoLabel(medalha.tipo) }}</h3>
                  <span class="medalha-ano">{{ medalha.ano }}</span>
                </div>
                <div class="medalha-info">
                  <p class="jogo-nome">
                    <i class="fas fa-trophy"></i>
                    {{ medalha.jogoNome }}
                  </p>
                  @if (medalha.modalidadeNome) {
                    <p class="modalidade">
                      <i class="fas fa-running"></i>
                      {{ medalha.modalidadeNome }}
                    </p>
                  }
                  @if (medalha.provaNome) {
                    <p class="prova">
                      <i class="fas fa-tasks"></i>
                      {{ medalha.provaNome }}
                    </p>
                  }
                  <p class="grupo">
                    <i class="fas fa-users"></i>
                    {{ medalha.grupoNome }}
                  </p>
                  @if (medalha.descricao) {
                    <p class="descricao">{{ medalha.descricao }}</p>
                  }
                </div>
                @if (medalha.participantes && medalha.participantes.length > 0) {
                  <div class="participantes">
                    <h4>Participantes:</h4>
                    <div class="participantes-list">
                      @for (participante of medalha.participantes; track participante.id) {
                        <div class="participante">
                          @if (participante.imagemPerfilUrl) {
                            <img [src]="participante.imagemPerfilUrl" [alt]="participante.nome">
                          } @else {
                            <div class="participante-avatar">
                              {{ getInitials(participante.nome) }}
                            </div>
                          }
                          <span>{{ participante.nome }}</span>
                        </div>
                      }
                    </div>
                  </div>
                }
                <div class="medalha-footer">
                  <small>
                    <i class="fas fa-calendar"></i>
                    {{ formatDate(medalha.dataConquista) }}
                  </small>
                </div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="empty-state">
          <i class="fas fa-medal"></i>
          <p>Nenhuma medalha encontrada</p>
          <button class="btn btn-primary" (click)="concederMedalha()">
            <i class="fas fa-plus"></i> Conceder Primeira Medalha
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .medalhas-container {
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
          border-color: #667eea;
        }
      }
    }

    .medalhas-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
        }

        &.ouro i { color: #FFD700; }
        &.prata i { color: #C0C0C0; }
        &.bronze i { color: #CD7F32; }

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

    .medalhas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 1.5rem;

      .medalha-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        display: flex;
        gap: 1rem;
        transition: transform 0.2s;
        border-left: 4px solid;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }

        &.ouro { border-left-color: #FFD700; }
        &.prata { border-left-color: #C0C0C0; }
        &.bronze { border-left-color: #CD7F32; }

        .medalha-icon {
          flex-shrink: 0;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        &.ouro .medalha-icon {
          background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
          color: white;
        }

        &.prata .medalha-icon {
          background: linear-gradient(135deg, #E8E8E8 0%, #C0C0C0 100%);
          color: white;
        }

        &.bronze .medalha-icon {
          background: linear-gradient(135deg, #CD7F32 0%, #8B4513 100%);
          color: white;
        }

        .medalha-content {
          flex: 1;

          .medalha-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;

            h3 {
              margin: 0;
              color: #2c3e50;
              font-size: 1.2rem;
            }

            .medalha-ano {
              background: #ecf0f1;
              padding: 0.25rem 0.75rem;
              border-radius: 20px;
              font-size: 0.9rem;
              font-weight: 600;
              color: #555;
            }
          }

          .medalha-info {
            margin-bottom: 1rem;

            p {
              margin: 0.5rem 0;
              color: #555;
              font-size: 0.95rem;
              display: flex;
              align-items: center;
              gap: 0.5rem;

              i {
                color: #7f8c8d;
                width: 20px;
              }

              &.jogo-nome {
                font-weight: 600;
                color: #2c3e50;
              }

              &.descricao {
                font-style: italic;
                color: #7f8c8d;
              }
            }
          }

          .participantes {
            margin-bottom: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #ecf0f1;

            h4 {
              margin: 0 0 0.75rem 0;
              font-size: 0.9rem;
              color: #7f8c8d;
            }

            .participantes-list {
              display: flex;
              flex-wrap: wrap;
              gap: 0.75rem;

              .participante {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                background: #f8f9fa;
                padding: 0.5rem 0.75rem;
                border-radius: 20px;
                font-size: 0.9rem;

                img, .participante-avatar {
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  object-fit: cover;
                }

                .participante-avatar {
                  background: #667eea;
                  color: white;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 0.7rem;
                  font-weight: 600;
                }
              }
            }
          }

          .medalha-footer {
            padding-top: 0.75rem;
            border-top: 1px solid #ecf0f1;

            small {
              color: #7f8c8d;
              display: flex;
              align-items: center;
              gap: 0.5rem;
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
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
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
        color: #FFD700;
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
export class MedalhasListComponent implements OnInit {
  private medalhaService = inject(MedalhaService);
  private router = inject(Router);

  medalhas = signal<Medalha[]>([]);
  medalhasFiltradas = signal<Medalha[]>([]);
  anos = signal<number[]>([]);
  carregando = signal(true);

  filtroAno = '';
  filtroTipo = '';

  TipoMedalha = TipoMedalha;

  ngOnInit() {
    this.loadMedalhas();
  }

  loadMedalhas() {
    this.carregando.set(true);
    this.medalhaService.getAll().subscribe({
      next: (data) => {
        this.medalhas.set(data);
        this.medalhasFiltradas.set(data);
        this.extractAnos(data);
        this.carregando.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar medalhas:', err);
        this.carregando.set(false);
      }
    });
  }

  extractAnos(medalhas: Medalha[]) {
    const anosSet = new Set(medalhas.map(m => m.ano));
    this.anos.set(Array.from(anosSet).sort((a, b) => b - a));
  }

  filtrar() {
    let filtradas = this.medalhas();

    if (this.filtroAno) {
      filtradas = filtradas.filter(m => m.ano === parseInt(this.filtroAno));
    }

    if (this.filtroTipo) {
      filtradas = filtradas.filter(m => m.tipo === parseInt(this.filtroTipo));
    }

    this.medalhasFiltradas.set(filtradas);
  }

  countTipo(tipo: TipoMedalha): number {
    return this.medalhasFiltradas().filter(m => m.tipo === tipo).length;
  }

  getTipoClass(tipo: TipoMedalha): string {
    const map: Record<TipoMedalha, string> = {
      [TipoMedalha.Ouro]: 'ouro',
      [TipoMedalha.Prata]: 'prata',
      [TipoMedalha.Bronze]: 'bronze'
    };
    return map[tipo];
  }

  getTipoLabel(tipo: TipoMedalha): string {
    const map: Record<TipoMedalha, string> = {
      [TipoMedalha.Ouro]: 'Medalha de Ouro',
      [TipoMedalha.Prata]: 'Medalha de Prata',
      [TipoMedalha.Bronze]: 'Medalha de Bronze'
    };
    return map[tipo];
  }

  getInitials(nome: string): string {
    return nome
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  concederMedalha() {
    // TODO: Implementar modal/rota para conceder medalha
    console.log('Conceder medalha');
  }
}
