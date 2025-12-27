import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GuiaService } from '../../core/services/guia.service';
import { Guia, StatusJogo } from '../../core/models/jogos.model';

@Component({
  selector: 'app-guia-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="guia-detail-container">
      @if (guia(); as g) {
        <header class="detail-header">
          <button class="btn-back" (click)="voltar()">
            <i class="fas fa-arrow-left"></i> Voltar
          </button>
          
          <div class="header-content">
            <div class="header-info">
              <h1>{{ g.nome }}</h1>
              <div class="meta">
                <span class="badge" [class]="getStatusClass(g.status)">
                  {{ getStatusLabel(g.status) }}
                </span>
                <span class="year">
                  <i class="fas fa-calendar"></i> {{ g.ano }}
                </span>
                <span class="dates">
                  <i class="fas fa-clock"></i>
                  {{ formatDate(g.dataInicio) }} - {{ formatDate(g.dataFim) }}
                </span>
              </div>
            </div>
            
            <div class="header-actions">
              <button class="btn btn-secondary" (click)="editar()">
                <i class="fas fa-edit"></i> Editar
              </button>
              @if (g.status === StatusJogo.Planejado) {
                <button class="btn btn-success" (click)="iniciar()">
                  <i class="fas fa-play"></i> Iniciar
                </button>
              }
              @if (g.status === StatusJogo.EmAndamento) {
                <button class="btn btn-warning" (click)="finalizar()">
                  <i class="fas fa-flag-checkered"></i> Finalizar
                </button>
              }
            </div>
          </div>
        </header>

        @if (g.imagemCapaUrl) {
          <div class="cover-image">
            <img [src]="g.imagemCapaUrl" [alt]="g.nome">
          </div>
        }

        <div class="detail-content">
          <div class="info-grid">
            <div class="info-card">
              <h3>Descrição</h3>
              <p>{{ g.descricao }}</p>
            </div>

            <div class="info-card">
              <h3>Tema Principal</h3>
              <p class="theme">{{ g.temaPrincipal }}</p>
            </div>

            <div class="info-card">
              <h3>Informações Gerais</h3>
              <dl>
                <dt>Pastoral:</dt>
                <dd>{{ g.pastoralNome || 'N/A' }}</dd>
                
                <dt>Duração Estimada:</dt>
                <dd>{{ g.duracaoEstimadaDias }} dias</dd>
                
                <dt>Quantidade de Provas:</dt>
                <dd>{{ g.quantidadeProvas }}</dd>
                
                @if (g.requisitoIdadeMinima || g.requisitoIdadeMaxima) {
                  <dt>Requisito de Idade:</dt>
                  <dd>
                    @if (g.requisitoIdadeMinima && g.requisitoIdadeMaxima) {
                      {{ g.requisitoIdadeMinima }} - {{ g.requisitoIdadeMaxima }} anos
                    } @else if (g.requisitoIdadeMinima) {
                      Mínimo {{ g.requisitoIdadeMinima }} anos
                    } @else {
                      Máximo {{ g.requisitoIdadeMaxima }} anos
                    }
                  </dd>
                }
                
                @if (g.limiteTotalParticipantes) {
                  <dt>Limite de Participantes:</dt>
                  <dd>{{ g.limiteTotalParticipantes }}</dd>
                }
              </dl>
            </div>

            @if (g.regulamentoUrl) {
              <div class="info-card">
                <h3>Regulamento</h3>
                <a [href]="g.regulamentoUrl" target="_blank" class="btn-link">
                  <i class="fas fa-file-pdf"></i> Abrir Regulamento
                </a>
              </div>
            }

            @if (g.observacoesGerais) {
              <div class="info-card full-width">
                <h3>Observações</h3>
                <p class="observations">{{ g.observacoesGerais }}</p>
              </div>
            }
          </div>

          <div class="provas-section">
            <div class="section-header">
              <h2>
                <i class="fas fa-tasks"></i>
                Provas ({{ g.provas?.length || 0 }})
              </h2>
              <button class="btn btn-primary" (click)="adicionarProva()">
                <i class="fas fa-plus"></i> Adicionar Prova
              </button>
            </div>

            @if (g.provas && g.provas.length > 0) {
              <div class="provas-list">
                @for (prova of g.provas; track prova.id) {
                  <div class="prova-card" [class.finalizada]="prova.finalizada">
                    <div class="prova-header">
                      <div class="prova-number">{{ prova.numero }}</div>
                      <div class="prova-info">
                        <h4>{{ prova.nome }}</h4>
                        @if (prova.descricao) {
                          <p class="prova-desc">{{ prova.descricao }}</p>
                        }
                      </div>
                      @if (prova.finalizada) {
                        <span class="badge badge-success">
                          <i class="fas fa-check"></i> Finalizada
                        </span>
                      } @else {
                        <span class="badge badge-pending">
                          <i class="fas fa-clock"></i> Pendente
                        </span>
                      }
                    </div>
                    <div class="prova-details">
                      <div class="detail-item">
                        <i class="fas fa-star"></i>
                        <span>{{ prova.pontuacaoMaxima }} pontos</span>
                      </div>
                      @if (prova.duracaoEstimadaMinutos) {
                        <div class="detail-item">
                          <i class="fas fa-hourglass-half"></i>
                          <span>{{ prova.duracaoEstimadaMinutos }} minutos</span>
                        </div>
                      }
                      @if (prova.localRealizacao) {
                        <div class="detail-item">
                          <i class="fas fa-map-marker-alt"></i>
                          <span>{{ prova.localRealizacao }}</span>
                        </div>
                      }
                      @if (prova.dataRealizacao) {
                        <div class="detail-item">
                          <i class="fas fa-calendar-day"></i>
                          <span>{{ formatDate(prova.dataRealizacao) }}</span>
                        </div>
                      }
                    </div>
                    @if (prova.requisitos) {
                      <div class="prova-requisitos">
                        <strong>Requisitos:</strong> {{ prova.requisitos }}
                      </div>
                    }
                  </div>
                }
              </div>
            } @else {
              <div class="empty-state">
                <i class="fas fa-tasks"></i>
                <p>Nenhuma prova adicionada</p>
                <button class="btn btn-primary" (click)="adicionarProva()">
                  <i class="fas fa-plus"></i> Adicionar Primeira Prova
                </button>
              </div>
            }
          </div>
        </div>
      } @else if (carregando()) {
        <div class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Carregando guia...</p>
        </div>
      } @else {
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Guia não encontrado</p>
          <button class="btn btn-primary" (click)="voltar()">
            Voltar
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .guia-detail-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .detail-header {
      margin-bottom: 2rem;

      .btn-back {
        background: none;
        border: none;
        color: #f5576c;
        font-weight: 600;
        cursor: pointer;
        margin-bottom: 1rem;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        transition: transform 0.2s;

        &:hover {
          transform: translateX(-4px);
        }
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 2rem;
        background: white;
        padding: 2rem;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }

      h1 {
        margin: 0 0 1rem 0;
        color: #2c3e50;
      }

      .meta {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
        align-items: center;

        .badge, .year, .dates {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .year, .dates {
          color: #7f8c8d;
          font-size: 0.95rem;
        }
      }

      .header-actions {
        display: flex;
        gap: 1rem;
      }
    }

    .cover-image {
      margin-bottom: 2rem;
      border-radius: 12px;
      overflow: hidden;
      max-height: 400px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .detail-content {
      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;

        .info-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);

          &.full-width {
            grid-column: 1 / -1;
          }

          h3 {
            color: #f5576c;
            margin: 0 0 1rem 0;
            font-size: 1.1rem;
          }

          p {
            margin: 0;
            color: #555;
            line-height: 1.6;

            &.theme {
              font-size: 1.1rem;
              font-weight: 600;
              color: #2c3e50;
            }
          }

          dl {
            margin: 0;
            
            dt {
              color: #7f8c8d;
              font-size: 0.9rem;
              margin-bottom: 0.25rem;
            }

            dd {
              color: #2c3e50;
              font-weight: 600;
              margin: 0 0 1rem 0;

              &:last-child {
                margin-bottom: 0;
              }
            }
          }

          .btn-link {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            color: #f5576c;
            text-decoration: none;
            font-weight: 600;
            
            &:hover {
              text-decoration: underline;
            }
          }

          .observations {
            white-space: pre-wrap;
          }
        }
      }

      .provas-section {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;

          h2 {
            margin: 0;
            color: #2c3e50;
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }
        }

        .provas-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;

          .prova-card {
            border: 2px solid #ecf0f1;
            border-radius: 12px;
            padding: 1.5rem;
            transition: all 0.2s;
            background: white;

            &.finalizada {
              background: #f8f9fa;
              border-color: #27ae60;
            }

            &:hover {
              border-color: #f5576c;
              transform: translateX(4px);
              box-shadow: 0 4px 12px rgba(245, 87, 108, 0.2);
            }

            .prova-header {
              display: flex;
              align-items: flex-start;
              gap: 1rem;
              margin-bottom: 1rem;

              .prova-number {
                min-width: 48px;
                height: 48px;
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2rem;
                font-weight: 700;
                flex-shrink: 0;
              }

              .prova-info {
                flex: 1;

                h4 {
                  margin: 0 0 0.5rem 0;
                  color: #2c3e50;
                }

                .prova-desc {
                  margin: 0;
                  color: #7f8c8d;
                  font-size: 0.95rem;
                }
              }
            }

            .prova-details {
              display: flex;
              flex-wrap: wrap;
              gap: 1.5rem;
              margin-bottom: 1rem;

              .detail-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                color: #555;
                font-size: 0.95rem;

                i {
                  color: #f5576c;
                }
              }
            }

            .prova-requisitos {
              padding: 1rem;
              background: #fff8e1;
              border-left: 4px solid #ffc107;
              border-radius: 4px;
              font-size: 0.95rem;
              color: #555;

              strong {
                color: #f57c00;
              }
            }
          }
        }
      }
    }

    .badge {
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;

      &.status-planejado { background: #3498db; color: white; }
      &.status-inscricoes { background: #9b59b6; color: white; }
      &.status-em-andamento { background: #27ae60; color: white; }
      &.status-finalizado { background: #95a5a6; color: white; }
      &.status-cancelado { background: #e74c3c; color: white; }
      
      &.badge-success { background: #27ae60; color: white; }
      &.badge-pending { background: #f39c12; color: white; }
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
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(245, 87, 108, 0.4);
        }
      }

      &.btn-secondary {
        background: #ecf0f1;
        color: #2c3e50;

        &:hover {
          background: #bdc3c7;
        }
      }

      &.btn-success {
        background: #27ae60;
        color: white;

        &:hover {
          background: #229954;
        }
      }

      &.btn-warning {
        background: #f39c12;
        color: white;

        &:hover {
          background: #e67e22;
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: #95a5a6;

      i {
        font-size: 3rem;
        margin-bottom: 1rem;
        display: block;
      }

      p {
        margin: 0 0 1rem 0;
        font-size: 1.1rem;
      }
    }

    .loading-state, .error-state {
      text-align: center;
      padding: 4rem 2rem;

      i {
        font-size: 3rem;
        color: #f5576c;
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
export class GuiaDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private guiaService = inject(GuiaService);

  guia = signal<Guia | null>(null);
  carregando = signal(true);
  StatusJogo = StatusJogo;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadGuia(id);
    }
  }

  loadGuia(id: string) {
    this.carregando.set(true);
    this.guiaService.getById(id).subscribe({
      next: (data) => {
        this.guia.set(data);
        this.carregando.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar guia:', err);
        this.carregando.set(false);
      }
    });
  }

  getStatusClass(status: StatusJogo): string {
    const map: Record<StatusJogo, string> = {
      [StatusJogo.Planejado]: 'status-planejado',
      [StatusJogo.Inscricoes]: 'status-inscricoes',
      [StatusJogo.EmAndamento]: 'status-em-andamento',
      [StatusJogo.Finalizado]: 'status-finalizado',
      [StatusJogo.Cancelado]: 'status-cancelado'
    };
    return `badge ${map[status]}`;
  }

  getStatusLabel(status: StatusJogo): string {
    const map: Record<StatusJogo, string> = {
      [StatusJogo.Planejado]: 'Planejado',
      [StatusJogo.Inscricoes]: 'Inscrições',
      [StatusJogo.EmAndamento]: 'Em Andamento',
      [StatusJogo.Finalizado]: 'Finalizado',
      [StatusJogo.Cancelado]: 'Cancelado'
    };
    return map[status];
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  voltar() {
    this.router.navigate(['/coord-jogos']);
  }

  editar() {
    const id = this.guia()?.id;
    if (id) {
      console.log('Editar guia', id);
    }
  }

  iniciar() {
    const g = this.guia();
    if (g) {
      this.guiaService.updateStatus(g.id, StatusJogo.EmAndamento).subscribe({
        next: () => this.loadGuia(g.id),
        error: (err) => console.error('Erro ao iniciar guia:', err)
      });
    }
  }

  finalizar() {
    const g = this.guia();
    if (g) {
      this.guiaService.updateStatus(g.id, StatusJogo.Finalizado).subscribe({
        next: () => this.loadGuia(g.id),
        error: (err) => console.error('Erro ao finalizar guia:', err)
      });
    }
  }

  adicionarProva() {
    console.log('Adicionar prova');
  }
}
