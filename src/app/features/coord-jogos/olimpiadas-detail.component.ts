import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OlimpiadasService } from '../../core/services/olimpiadas.service';
import { Olimpiadas, StatusJogo } from '../../core/models/jogos.model';

@Component({
  selector: 'app-olimpiadas-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="olimpiadas-detail-container">
      @if (olimpiada(); as olimp) {
        <header class="detail-header">
          <button class="btn-back" (click)="voltar()">
            <i class="fas fa-arrow-left"></i> Voltar
          </button>
          
          <div class="header-content">
            <div class="header-info">
              <h1>{{ olimp.nome }}</h1>
              <div class="meta">
                <span class="badge" [class]="getStatusClass(olimp.status)">
                  {{ getStatusLabel(olimp.status) }}
                </span>
                <span class="year">
                  <i class="fas fa-calendar"></i> {{ olimp.ano }}
                </span>
                <span class="dates">
                  <i class="fas fa-clock"></i>
                  {{ formatDate(olimp.dataInicio) }} - {{ formatDate(olimp.dataFim) }}
                </span>
              </div>
            </div>
            
            <div class="header-actions">
              <button class="btn btn-secondary" (click)="editar()">
                <i class="fas fa-edit"></i> Editar
              </button>
              @if (olimp.status === StatusJogo.Planejado) {
                <button class="btn btn-success" (click)="iniciar()">
                  <i class="fas fa-play"></i> Iniciar
                </button>
              }
              @if (olimp.status === StatusJogo.EmAndamento) {
                <button class="btn btn-warning" (click)="finalizar()">
                  <i class="fas fa-flag-checkered"></i> Finalizar
                </button>
              }
            </div>
          </div>
        </header>

        @if (olimp.imagemCapaUrl) {
          <div class="cover-image">
            <img [src]="olimp.imagemCapaUrl" [alt]="olimp.nome">
          </div>
        }

        <div class="detail-content">
          <div class="info-grid">
            <div class="info-card">
              <h3>Descrição</h3>
              <p>{{ olimp.descricao }}</p>
            </div>

            <div class="info-card">
              <h3>Informações</h3>
              <dl>
                <dt>Pastoral:</dt>
                <dd>{{ olimp.pastoral?.name || 'N/A' }}</dd>
                
                <dt>Finais de Semana:</dt>
                <dd>{{ olimp.quantidadeFinaisSemana }}</dd>
                
                <dt>Usa Fase de Grupos:</dt>
                <dd>{{ olimp.usaFaseGrupos ? 'Sim' : 'Não' }}</dd>
                
                <dt>Usa Mata-Mata:</dt>
                <dd>{{ olimp.usaMataMata ? 'Sim' : 'Não' }}</dd>
              </dl>
            </div>

            <div class="info-card">
              <h3>Pontuação</h3>
              <dl>
                <dt>Ouro:</dt>
                <dd>{{ olimp.pontosOuro }} pontos</dd>
                
                <dt>Prata:</dt>
                <dd>{{ olimp.pontosPrata }} pontos</dd>
                
                <dt>Bronze:</dt>
                <dd>{{ olimp.pontosBronze }} pontos</dd>
                
                <dt>Participação:</dt>
                <dd>{{ olimp.pontosParticipacao }} pontos</dd>
              </dl>
            </div>

            @if (olimp.regulamentoUrl) {
              <div class="info-card">
                <h3>Regulamento</h3>
                <a [href]="olimp.regulamentoUrl" target="_blank" class="btn-link">
                  <i class="fas fa-file-pdf"></i> Abrir Regulamento
                </a>
              </div>
            }

            @if (olimp.observacoesGerais) {
              <div class="info-card full-width">
                <h3>Observações</h3>
                <p class="observations">{{ olimp.observacoesGerais }}</p>
              </div>
            }
          </div>

          <div class="modalidades-section">
            <div class="section-header">
              <h2>
                <i class="fas fa-trophy"></i>
                Modalidades ({{ olimp.modalidades?.length || 0 }})
              </h2>
              <button class="btn btn-primary" (click)="adicionarModalidade()">
                <i class="fas fa-plus"></i> Adicionar Modalidade
              </button>
            </div>

            @if (olimp.modalidades && olimp.modalidades.length > 0) {
              <div class="modalidades-grid">
                @for (modalidade of olimp.modalidades; track modalidade.id) {
                  <div class="modalidade-card">
                    <h4>{{ modalidade.nome }}</h4>
                    <div class="modalidade-info">
                      <span class="badge badge-info">{{ getTipoModalidade(modalidade.tipo) }}</span>
                      <span class="badge badge-secondary">{{ getGeneroModalidade(modalidade.genero) }}</span>
                      @if (modalidade.limiteParticipantes) {
                        <span class="limit">
                          <i class="fas fa-users"></i> Limite: {{ modalidade.limiteParticipantes }}
                        </span>
                      }
                    </div>
                    @if (modalidade.descricao) {
                      <p class="modalidade-desc">{{ modalidade.descricao }}</p>
                    }
                  </div>
                }
              </div>
            } @else {
              <div class="empty-state">
                <i class="fas fa-trophy"></i>
                <p>Nenhuma modalidade adicionada</p>
                <button class="btn btn-primary" (click)="adicionarModalidade()">
                  <i class="fas fa-plus"></i> Adicionar Primeira Modalidade
                </button>
              </div>
            }
          </div>

          <div class="grupos-section">
            <div class="section-header">
              <h2>
                <i class="fas fa-users"></i>
                Grupos Participantes ({{ olimp.grupos?.length || 0 }})
              </h2>
            </div>

            @if (olimp.grupos && olimp.grupos.length > 0) {
              <div class="grupos-grid">
                @for (grupo of olimp.grupos; track grupo.id) {
                  <div class="grupo-card">
                    <h4>{{ grupo.grupo?.nome || 'Sem nome' }}</h4>
                    <div class="grupo-stats">
                      <span class="stat">
                        <i class="fas fa-medal"></i>
                        {{ grupo.totalMedalhasOuro || 0 }} Ouro
                      </span>
                      <span class="stat">
                        <i class="fas fa-medal"></i>
                        {{ grupo.totalMedalhasPrata || 0 }} Prata
                      </span>
                      <span class="stat">
                        <i class="fas fa-medal"></i>
                        {{ grupo.totalMedalhasBronze || 0 }} Bronze
                      </span>
                    </div>
                    <div class="grupo-pontos">
                      <strong>{{ grupo.pontuacaoTotal || 0 }}</strong> pontos
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="empty-state small">
                <i class="fas fa-users"></i>
                <p>Nenhum grupo participante ainda</p>
              </div>
            }
          </div>
        </div>
      } @else if (carregando()) {
        <div class="loading-state">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Carregando olimpíada...</p>
        </div>
      } @else {
        <div class="error-state">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Olimpíada não encontrada</p>
          <button class="btn btn-primary" (click)="voltar()">
            Voltar
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .olimpiadas-detail-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    .detail-header {
      margin-bottom: 2rem;

      .btn-back {
        background: none;
        border: none;
        color: #667eea;
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
            color: #667eea;
            margin: 0 0 1rem 0;
            font-size: 1.1rem;
          }

          p {
            margin: 0;
            color: #555;
            line-height: 1.6;
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
            color: #667eea;
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

      .modalidades-section, .grupos-section {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        margin-bottom: 2rem;

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

        .modalidades-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;

          .modalidade-card {
            border: 2px solid #ecf0f1;
            border-radius: 8px;
            padding: 1.5rem;
            transition: all 0.2s;

            &:hover {
              border-color: #667eea;
              transform: translateY(-2px);
              box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
            }

            h4 {
              margin: 0 0 1rem 0;
              color: #2c3e50;
            }

            .modalidade-info {
              display: flex;
              gap: 0.5rem;
              flex-wrap: wrap;
              margin-bottom: 0.75rem;

              .limit {
                display: inline-flex;
                align-items: center;
                gap: 0.25rem;
                color: #7f8c8d;
                font-size: 0.9rem;
              }
            }

            .modalidade-desc {
              color: #555;
              font-size: 0.9rem;
              margin: 0;
            }
          }
        }

        .grupos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;

          .grupo-card {
            border: 2px solid #ecf0f1;
            border-radius: 8px;
            padding: 1.5rem;
            text-align: center;

            h4 {
              margin: 0 0 1rem 0;
              color: #2c3e50;
            }

            .grupo-stats {
              display: flex;
              justify-content: center;
              gap: 1rem;
              margin-bottom: 1rem;

              .stat {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                font-size: 0.9rem;
                color: #555;
              }
            }

            .grupo-pontos {
              padding-top: 1rem;
              border-top: 1px solid #ecf0f1;
              color: #667eea;
              font-size: 1.1rem;

              strong {
                font-size: 1.5rem;
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
      
      &.badge-info { background: #3498db; color: white; }
      &.badge-secondary { background: #95a5a6; color: white; }
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

      &.small {
        padding: 2rem;
      }

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
        color: #667eea;
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
export class OlimpiadasDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private olimpiadasService = inject(OlimpiadasService);

  olimpiada = signal<Olimpiadas | null>(null);
  carregando = signal(true);
  StatusJogo = StatusJogo;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOlimpiada(id);
    }
  }

  loadOlimpiada(id: string) {
    this.carregando.set(true);
    this.olimpiadasService.getById(id).subscribe({
      next: (data) => {
        this.olimpiada.set(data);
        this.carregando.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar olimpíada:', err);
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

  getTipoModalidade(tipo: number): string {
    const tipos = ['Individual', 'Dupla', 'Equipe'];
    return tipos[tipo] || 'Desconhecido';
  }

  getGeneroModalidade(genero: number): string {
    const generos = ['Masculino', 'Feminino', 'Misto'];
    return generos[genero] || 'Desconhecido';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR');
  }

  voltar() {
    this.router.navigate(['/coord-jogos']);
  }

  editar() {
    const id = this.olimpiada()?.id;
    if (id) {
      // TODO: Implementar rota de edição
      console.log('Editar olimpíada', id);
    }
  }

  iniciar() {
    const olimp = this.olimpiada();
    if (olimp) {
      this.olimpiadasService.updateStatus(olimp.id, StatusJogo.EmAndamento).subscribe({
        next: () => this.loadOlimpiada(olimp.id),
        error: (err) => console.error('Erro ao iniciar olimpíada:', err)
      });
    }
  }

  finalizar() {
    const olimp = this.olimpiada();
    if (olimp) {
      this.olimpiadasService.updateStatus(olimp.id, StatusJogo.Finalizado).subscribe({
        next: () => this.loadOlimpiada(olimp.id),
        error: (err) => console.error('Erro ao finalizar olimpíada:', err)
      });
    }
  }

  adicionarModalidade() {
    // TODO: Implementar modal/rota para adicionar modalidade
    console.log('Adicionar modalidade');
  }
}
