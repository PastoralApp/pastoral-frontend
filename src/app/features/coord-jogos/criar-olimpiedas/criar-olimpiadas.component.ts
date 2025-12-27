import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OlimpiadasService } from '../../../core/services/olimpiadas.service';
import { PastoralService } from '../../../core/services/pastoral.service';
import { CreateOlimpiadasDto } from '../../../core/models/jogos.model';
import { Pastoral } from '../../../core/models/pastoral.model';

@Component({
  selector: 'app-criar-olimpiadas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './criar-olimpiadas.component.html',
  styleUrls: ['./criar-olimpiadas.component.scss']
})
export class CriarOlimpiadasComponent implements OnInit {
  private fb = inject(FormBuilder);
  private olimpiadasService = inject(OlimpiadasService);
  private pastoralService = inject(PastoralService);
  private router = inject(Router);

  pastorais = signal<Pastoral[]>([]);
  salvando = signal(false);

  form: FormGroup = this.fb.group({
    nome: ['', Validators.required],
    descricao: ['', Validators.required],
    dataInicio: ['', Validators.required],
    dataFim: ['', Validators.required],
    ano: [new Date().getFullYear(), [Validators.required, Validators.min(2020)]],
    pastoralId: ['', Validators.required],
    quantidadeFinaisSemana: [1, [Validators.required, Validators.min(1)]],
    pontosOuro: [5, [Validators.required, Validators.min(0)]],
    pontosPrata: [3, [Validators.required, Validators.min(0)]],
    pontosBronze: [1, [Validators.required, Validators.min(0)]],
    pontosParticipacao: [0, [Validators.required, Validators.min(0)]],
    usaFaseGrupos: [false],
    usaMataMata: [true],
    imagemCapaUrl: [''],
    regulamentoUrl: [''],
    observacoesGerais: ['']
  });

  ngOnInit() {
    this.loadPastorais();
  }

  loadPastorais() {
    this.pastoralService.getAll().subscribe({
      next: (data) => this.pastorais.set(data),
      error: (err) => console.error('Erro ao carregar pastorais:', err)
    });
  }

  salvar() {
    if (this.form.valid) {
      this.salvando.set(true);
      const dto: CreateOlimpiadasDto = this.form.value;

      this.olimpiadasService.create(dto).subscribe({
        next: (olimpiada) => {
          this.salvando.set(false);
          this.router.navigate(['/coord-jogos/olimpiadas', olimpiada.id]);
        },
        error: (err) => {
          this.salvando.set(false);
          console.error('Erro ao criar olimpíada:', err);
          alert('Erro ao criar olimpíada. Tente novamente.');
        }
      });
    }
  }

  voltar() {
    this.router.navigate(['/coord-jogos']);
  }
}
