import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { OlimpiadasService } from '../../../core/services/olimpiadas.service';
import { GuiaService } from '../../../core/services/guia.service';
import { Olimpiadas, Guia, StatusJogo } from '../../../core/models/jogos.model';

@Component({
  selector: 'app-jogos-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="jogos-dashboard">
      <header class="dashboard-header">
        <h1>Painel de Jogos</h1>
        <div class="header-actions">
          <button class="btn btn-primary" (click)="criarOlimpiadas()">
            <i class="fas fa-plus"></i> Nova Olimpíada
          </button>
          <button class="btn btn-secondary" (click)="criarGuia()">
            <i class="fas fa-plus"></i> Novo Guia
          </button>
          <button class="btn btn-outline" (click)="verMedalhas()">
            <i class="fas fa-medal"></i> Medalhas
          </button>
          <button class="btn btn-outline" (click)="verTrofeus()">
            <i class="fas fa-trophy"></i> Troféus
          </button>
        </div>
      </header>

      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon olimpiadas">
            <i class="fas fa-medal"></i>
          </div>
          <div class="stat-content">
            <h3>{{ olimpiadas().length }}</h3>
            <p>Olimpíadas</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon guias">
            <i class="fas fa-trophy"></i>
          </div>
          <div class="stat-content">
            <h3>{{ guias().length }}</h3>
            <p>Guias</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon em-andamento">
            <i class="fas fa-running"></i>
          </div>
          <div class="stat-content">
            <h3>{{ jogosEmAndamento() }}</h3>
            <p>Em Andamento</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon finalizados">
            <i class="fas fa-check-circle"></i>
          </div>
          <div class="stat-content">
            <h3>{{ jogosFinalizados() }}</h3>
            <p>Finalizados</p>
          </div>
        </div>
      </div>

      <div class="tabs">
        <button 
          class="tab-btn" 
          [class.active]="activeTab() === 'olimpiadas'"
          (click)="activeTab.set('olimpiadas')">
          Olimpíadas
        </button>
        <button 
          class="tab-btn" 
          [class.active]="activeTab() === 'guias'"
          (click)="activeTab.set('guias')">
          Guias
        </button>
      </div>

      <div class="jogos-content">
        @if (activeTab() === 'olimpiadas') {
          <div class="jogos-grid">
            @for (olimpiada of olimpiadas(); track olimpiada.id) {
              <div class="jogo-card" (click)="verDetalhes('olimpiadas', olimpiada.id)">
                <div class="card-header" [style.background-image]="'url(' + (olimpiada.imagemCapaUrl || '/assets/default-olimpiadas.jpg') + ')'">
                  <span class="status-badge" [class]="getStatusClass(olimpiada.status)">
                    {{ getStatusLabel(olimpiada.status) }}
                  </span>
                </div>
                <div class="card-body">
                  <h3>{{ olimpiada.nome }}</h3>
                  <p class="description">{{ olimpiada.descricao }}</p>
                  <div class="card-info">
                    <span><i class="fas fa-calendar"></i> {{ olimpiada.ano }}</span>
                    <span><i class="fas fa-running"></i> {{ olimpiada.modalidades?.length || 0 }} modalidades</span>
                  </div>
                  <div class="card-dates">
                    <small>{{ formatDate(olimpiada.dataInicio) }} - {{ formatDate(olimpiada.dataFim) }}</small>
                  </div>
                </div>
              </div>
            } @empty {
              <div class="empty-state">
                <i class="fas fa-medal"></i>
                <p>Nenhuma olimpíada cadastrada</p>
                <button class="btn btn-primary" (click)="criarOlimpiadas()">Criar Primeira Olimpíada</button>
              </div>
            }
          </div>
        }

        @if (activeTab() === 'guias') {
          <div class="jogos-grid">
            @for (guia of guias(); track guia.id) {
              <div class="jogo-card" (click)="verDetalhes('guia', guia.id)">
                <div class="card-header guia-header" [style.background-image]="'url(' + (guia.imagemCapaUrl || '/assets/default-guia.jpg') + ')'">
                  <span class="status-badge" [class]="getStatusClass(guia.status)">
                    {{ getStatusLabel(guia.status) }}
                  </span>
                </div>
                <div class="card-body">
                  <h3>{{ guia.nome }}</h3>
                  <p class="description">{{ guia.descricao }}</p>
                  <div class="card-info">
                    <span><i class="fas fa-calendar"></i> {{ guia.ano }}</span>
                    <span><i class="fas fa-tasks"></i> {{ guia.quantidadeProvas }} provas</span>
                  </div>
                  <div class="card-dates">
                    <small>{{ formatDate(guia.dataInicio) }} - {{ formatDate(guia.dataFim) }}</small>
                  </div>
                </div>
              </div>
            } @empty {
              <div class="empty-state">
                <i class="fas fa-trophy"></i>
                <p>Nenhum guia cadastrado</p>
                <button class="btn btn-secondary" (click)="criarGuia()">Criar Primeiro Guia</button>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .jogos-dashboard {
      padding: 2rem;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;

      h1 {
        margin: 0;
        color: #2c3e50;
      }

      .header-actions {
        display: flex;
        gap: 1rem;
      }
    }

    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      transition: transform 0.2s;

      &:hover {
        transform: translateY(-4px);
      }

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        color: white;

        &.olimpiadas {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        &.guias {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        &.em-andamento {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        &.finalizados {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        }
      }

      .stat-content {
        h3 {
          margin: 0;
          font-size: 2rem;
          font-weight: bold;
          color: #2c3e50;
        }

        p {
          margin: 0;
          color: #7f8c8d;
        }
      }
    }

    .tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 2rem;
      border-bottom: 2px solid #ecf0f1;
    }

    .tab-btn {
      background: none;
      border: none;
      padding: 1rem 2rem;
      font-size: 1rem;
      font-weight: 600;
      color: #7f8c8d;
      cursor: pointer;
      border-bottom: 3px solid transparent;
      transition: all 0.2s;

      &:hover {
        color: #667eea;
      }

      &.active {
        color: #667eea;
        border-bottom-color: #667eea;
      }
    }

    .jogos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .jogo-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      }

      .card-header {
        height: 180px;
        background-size: cover;
        background-position: center;
        position: relative;
        background-color: #667eea;

        &.guia-header {
          background-color: #f5576c;
        }

        .status-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 600;
          background: rgba(255,255,255,0.95);

          &.planejado {
            color: #3498db;
          }

          &.inscricoes {
            color: #f39c12;
          }

          &.em-andamento {
            color: #2ecc71;
          }

          &.finalizado {
            color: #95a5a6;
          }

          &.cancelado {
            color: #e74c3c;
          }
        }
      }

      .card-body {
        padding: 1.5rem;

        h3 {
          margin: 0 0 0.5rem 0;
          color: #2c3e50;
          font-size: 1.25rem;
        }

        .description {
          color: #7f8c8d;
          font-size: 0.9rem;
          margin-bottom: 1rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-info {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.5rem;

          span {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #7f8c8d;
            font-size: 0.875rem;

            i {
              color: #667eea;
            }
          }
        }

        .card-dates {
          padding-top: 0.5rem;
          border-top: 1px solid #ecf0f1;

          small {
            color: #95a5a6;
          }
        }
      }
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 4rem 2rem;
      color: #95a5a6;

      i {
        font-size: 4rem;
        margin-bottom: 1rem;
        opacity: 0.5;
      }

      p {
        font-size: 1.25rem;
        margin-bottom: 1.5rem;
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

      &.btn-secondary {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
        }
      }

      &.btn-outline {
        background: white;
        color: #667eea;
        border: 2px solid #667eea;

        &:hover {
          background: #667eea;
          color: white;
          transform: translateY(-2px);
        }
      }
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
        }
      }
    }
  `]
})
export class JogosDashboardComponent implements OnInit {
  private olimpiadasService = inject(OlimpiadasService);
  private guiaService = inject(GuiaService);
  private router = inject(Router);

  olimpiadas = signal<Olimpiadas[]>([]);
  guias = signal<Guia[]>([]);
  activeTab = signal<'olimpiadas' | 'guias'>('olimpiadas');

  ngOnInit() {
    this.loadOlimpiadas();
    this.loadGuias();
  }

  loadOlimpiadas() {
    this.olimpiadasService.getAll().subscribe({
      next: (data) => this.olimpiadas.set(data),
      error: (err) => console.error('Erro ao carregar olimpíadas:', err)
    });
  }

  loadGuias() {
    this.guiaService.getAll().subscribe({
      next: (data) => this.guias.set(data),
      error: (err) => console.error('Erro ao carregar guias:', err)
    });
  }

  jogosEmAndamento(): number {
    const olimpiadasEmAndamento = this.olimpiadas().filter(o => o.status === StatusJogo.EmAndamento).length;
    const guiasEmAndamento = this.guias().filter(g => g.status === StatusJogo.EmAndamento).length;
    return olimpiadasEmAndamento + guiasEmAndamento;
  }

  jogosFinalizados(): number {
    const olimpiadasFinalizadas = this.olimpiadas().filter(o => o.status === StatusJogo.Finalizado).length;
    const guiasFinalizados = this.guias().filter(g => g.status === StatusJogo.Finalizado).length;
    return olimpiadasFinalizadas + guiasFinalizados;
  }

  getStatusClass(status: StatusJogo): string {
    const statusMap: Record<StatusJogo, string> = {
      [StatusJogo.Planejado]: 'planejado',
      [StatusJogo.Inscricoes]: 'inscricoes',
      [StatusJogo.EmAndamento]: 'em-andamento',
      [StatusJogo.Finalizado]: 'finalizado',
      [StatusJogo.Cancelado]: 'cancelado'
    };
    return statusMap[status] || '';
  }

  getStatusLabel(status: StatusJogo): string {
    const statusMap: Record<StatusJogo, string> = {
      [StatusJogo.Planejado]: 'Planejado',
      [StatusJogo.Inscricoes]: 'Inscrições',
      [StatusJogo.EmAndamento]: 'Em Andamento',
      [StatusJogo.Finalizado]: 'Finalizado',
      [StatusJogo.Cancelado]: 'Cancelado'
    };
    return statusMap[status] || 'Desconhecido';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  criarOlimpiadas() {
    this.router.navigate(['/coord-jogos/olimpiadas/criar']);
  }

  criarGuia() {
    this.router.navigate(['/coord-jogos/guia/criar']);
  }

  verMedalhas() {
    this.router.navigate(['/coord-jogos/medalhas']);
  }

  verTrofeus() {
    this.router.navigate(['/coord-jogos/trofeus']);
  }

  verDetalhes(tipo: string, id: string) {
    this.router.navigate([`/coord-jogos/${tipo}`, id]);
  }
}
